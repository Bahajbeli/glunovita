import PatientDeclaration from '../models/PatientDeclaration.model.js';
import AuditLog from '../models/AuditLog.model.js';

async function evaluateWithGroq(extractedTexts) {
  if (!extractedTexts || !extractedTexts.length) return null;
  const combinedText = extractedTexts.map(t => `Document ${t.name}:\n${t.text}`).join('\n\n');
  const apiKey = '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';
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert médical spécialisé dans la maladie cœliaque. Analyse le texte suivant extrait d\'un dossier médical. Réponds UNIQUEMENT par un objet JSON valide avec deux clés: "isSick" (booléen) indiquant si le texte confirme la maladie cœliaque, et "reason" (chaîne) donnant une courte explication.'
          },
          {
            role: 'user',
            content: `Texte extrait:\n${combinedText}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });
    if (!res.ok) {
      console.error('Groq API Error:', await res.text());
      return null;
    }
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.error('Error calling Groq API:', err);
    return null;
  }
}

const DOCTOR_LABEL = {
  GASTRO: 'Gastro-entérologue',
  GP: 'Médecin généraliste',
  PEDIATRICIAN: 'Pédiatre',
  NUTRITIONIST: 'Nutritionniste',
  OTHER_SPECIALIST: 'Autre spécialiste'
};

function buildLegacyFromCeliacForm(celiacForm) {
  const methods = Array.isArray(celiacForm?.diagnosisStatus?.methods)
    ? celiacForm.diagnosisStatus.methods
    : [];
  const priority = [
    ['INTESTINAL_BIOPSY', 'BIOPSY'],
    ['GENETIC_TEST', 'GENETIC_TEST'],
    ['BLOOD_ANTIBODIES', 'SEROLOGY'],
    ['CLINICAL_DIAGNOSIS', 'CLINICAL'],
    ['OTHER_METHOD', 'CLINICAL']
  ];
  let medicalEvidence = 'CLINICAL';
  for (const [key, ev] of priority) {
    if (methods.includes(key)) {
      medicalEvidence = ev;
      break;
    }
  }

  let diagnosisDate = celiacForm?.diagnosisStatus?.diagnosisDate
    ? new Date(celiacForm.diagnosisStatus.diagnosisDate)
    : null;
  if (!diagnosisDate || Number.isNaN(diagnosisDate.getTime())) {
    diagnosisDate = new Date();
  }

  const diagnosisLocation =
    [celiacForm?.general?.countryRegion, celiacForm?.healthProfessional?.diagnosisCountry]
      .filter(Boolean)
      .join(' / ') || 'Non renseigné';

  const types = celiacForm?.healthProfessional?.doctorType || [];
  const diagnosingDoctor =
    types.map((t) => DOCTOR_LABEL[t] || t).join(', ') || 'Voir formulaire détaillé';

  const supportingDocuments = Array.isArray(celiacForm?.documents?.uploadedUrls)
    ? celiacForm.documents.uploadedUrls
    : [];

  return {
    diagnosisDate,
    diagnosisLocation,
    diagnosingDoctor,
    medicalEvidence,
    supportingDocuments
  };
}

export const createDeclaration = async (patientId, body) => {
  const existingApproved = await PatientDeclaration.findOne({
    patientId,
    status: 'APPROVED'
  });

  if (existingApproved) {
    throw new Error('Patient already has an approved declaration');
  }

  const { celiacForm, ...rest } = body;
  let payload = { ...rest };

  if (celiacForm && typeof celiacForm === 'object') {
    if (!celiacForm.consent?.accuracy) {
      throw new Error('Vous devez confirmer l’exactitude des informations.');
    }
    if (!celiacForm.consent?.research) {
      throw new Error(
        'Vous devez accepter l’utilisation anonymisée des données à des fins statistiques ou scientifiques.'
      );
    }
    payload = {
      ...payload,
      ...buildLegacyFromCeliacForm(celiacForm),
      celiacForm
    };
  } else {
    if (
      !payload.diagnosisDate ||
      !payload.diagnosisLocation ||
      !payload.diagnosingDoctor ||
      !payload.medicalEvidence
    ) {
      throw new Error('Veuillez remplir tous les champs obligatoires de la déclaration.');
    }
    if (payload.diagnosisDate && !(payload.diagnosisDate instanceof Date)) {
      payload.diagnosisDate = new Date(payload.diagnosisDate);
    }
  }

  let aiDecision = null;
  if (celiacForm?.documents?.extractedTexts) {
    aiDecision = await evaluateWithGroq(celiacForm.documents.extractedTexts);
  }

  const declaration = new PatientDeclaration({
    patientId,
    declarationDate: new Date(),
    aiDecision,
    ...payload
  });

  await declaration.save();

  await AuditLog.create({
    userId: patientId,
    action: 'PATIENT_DECLARATION_CREATE',
    resourceType: 'PATIENT_DECLARATION',
    resourceId: declaration._id,
    status: 'SUCCESS'
  });

  return declaration;
};

export const getPatientDeclarations = async (patientId, userRole) => {
  if (userRole === 'PATIENT') {
    return await PatientDeclaration.find({ patientId }).sort({ createdAt: -1 });
  }
  return await PatientDeclaration.find().sort({ createdAt: -1 }).populate('patientId', 'firstName lastName email');
};

export const approveDeclaration = async (declarationId, adminId) => {
  const declaration = await PatientDeclaration.findById(declarationId);

  if (!declaration) {
    throw new Error('Declaration not found');
  }

  if (declaration.status === 'APPROVED') {
    throw new Error('Declaration already approved');
  }

  declaration.status = 'APPROVED';
  declaration.reviewedBy = adminId;
  declaration.reviewedAt = new Date();
  await declaration.save();

  await AuditLog.create({
    userId: adminId,
    action: 'PATIENT_DECLARATION_APPROVE',
    resourceType: 'PATIENT_DECLARATION',
    resourceId: declaration._id,
    status: 'SUCCESS'
  });

  return declaration;
};

export const rejectDeclaration = async (declarationId, adminId, rejectionReason) => {
  const declaration = await PatientDeclaration.findById(declarationId);

  if (!declaration) {
    throw new Error('Declaration not found');
  }

  declaration.status = 'REJECTED';
  declaration.reviewedBy = adminId;
  declaration.reviewedAt = new Date();
  declaration.rejectionReason = rejectionReason;
  await declaration.save();

  await AuditLog.create({
    userId: adminId,
    action: 'PATIENT_DECLARATION_REJECT',
    resourceType: 'PATIENT_DECLARATION',
    resourceId: declaration._id,
    status: 'SUCCESS',
    details: { rejectionReason }
  });

  return declaration;
};
