/**
 * Validation locale « intelligente » des pièces jointes (sans API externe) :
 * - Images : qualité (sharp), entropie (détection de pages vides), OCR (Tesseract.js hors-ligne)
 * - PDF : extraction de texte (pdf-parse / pdf.js embarqué)
 * - Score sémantique : termes liés au diagnostic de maladie cœliaque et au suivi médical
 *
 * Ce n’est pas un diagnostic médical : c’est un filtre anti-abus basé sur le contenu apparent du document.
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { PDFParse } from 'pdf-parse';

/** Désactiver via CELIAC_DOC_AI=off */
export function isCeliacDocAiEnabled() {
  return process.env.CELIAC_DOC_AI !== 'off' && process.env.CELIAC_DOC_AI !== '0';
}

/** Score minimum pour accepter un fichier (ajustable) */
const MIN_SCORE_PER_FILE = parseInt(process.env.CELIAC_DOC_MIN_SCORE || '18', 10);

/** Entropie normalisée (0–8) en dessous de ce seuil ≈ image quasi uniforme / vide */
const MIN_IMAGE_ENTROPY = 2.8;

/** Dimensions minimales pour un scan lisible */
const MIN_W = 320;
const MIN_H = 320;

/**
 * Poids par motif (regex). Priorité aux termes très spécifiques à la maladie cœliaque.
 */
const POSITIVE_PATTERNS = [
  { re: /maladie\s+c[oô]eliaque|c[oô]eliaquie|maladie\s+coeliaque/i, w: 35 },
  { re: /\bceliac\s+disease\b|\bcoeliac\b|\bceliac\b/i, w: 28 },
  { re: /biopsie\s*(duod[ée]nale|intestinale)?|villosit[ée]s|atrophie\s+villositaire|classification\s+de\s+marsh|\bmarsh\s*[0-3]/i, w: 32 },
  { re: /anti[-\s]?ttg|anti[-\s]?transglutaminase|iga\s*ttg|anticorps\s*anti[-\s]?ttg/i, w: 30 },
  { re: /iga\s*anti[-\s]?dgp|d[ée]amid[ée]e?\s+gluten|anti[-\s]?gliadine/i, w: 28 },
  { re: /hla[-\s]?dq2|hla[-\s]?dq8|typage\s+hla/i, w: 22 },
  { re: /sprue\s+non\s+tropicale|ent[ée]ropathie\s+au\s+gluten/i, w: 26 },
  { re: /pathologie|anatomopathologie|compte[-\s]?rendu\s+histologique|laboratoire\s+d['’]?analyses/i, w: 14 },
  { re: /gastro[-\s]?ent[ée]rologue|h[ôo]pital|clinique|cabinet\s+m[ée]dical|n[°o]\s*dossier|ippb|cnss|cnops/i, w: 10 },
  { re: /r[ée]sultat\s+d['’]?analyse|analyse\s+sanguine|h[ée]mogramme|fer\s+s[ée]rique|vitamine\s+b12|folates/i, w: 12 },
  { re: /certificat\s+m[ée]dical|ordonnance|compte[-\s]?rendu\s+m[ée]dical/i, w: 10 },
  { re: /sans\s+gluten|intol[ée]rance\s+au\s+gluten|r[ée]gime\s+hypoglutenique/i, w: 8 },
  { re: /dermatite\s+herp[ée]tiforme|dh\s+celia/i, w: 20 },
  { re: /diagnostic|sympt[ôo]me|patient|m[ée]decin\s+traitant/i, w: 4 }
];

const NEGATIVE_PATTERNS = [
  { re: /lorem\s+ipsum|placeholder|sample\s+text|fake\s+document|template\s+gratuit/i, w: -40 }
];

function scoreText(text) {
  if (!text || typeof text !== 'string') return { score: 0, hits: [] };
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length < 8) return { score: 0, hits: [] };

  let score = 0;
  const hits = [];

  for (const { re, w } of POSITIVE_PATTERNS) {
    if (re.test(normalized)) {
      score += w;
      hits.push(re.source.slice(0, 40));
    }
  }
  for (const { re, w } of NEGATIVE_PATTERNS) {
    if (w && re.test(normalized)) {
      score += w;
      hits.push(`neg:${re.source.slice(0, 30)}`);
    }
  }

  /** Léger bonus longueur = document substantiel */
  if (normalized.length > 400) score += 6;
  else if (normalized.length > 120) score += 3;

  return { score: Math.max(0, score), hits };
}

async function computeImageEntropy(buffer) {
  const { data } = await sharp(buffer)
    .greyscale()
    .resize(64, 64, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const hist = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) hist[data[i]]++;
  let entropy = 0;
  const n = data.length;
  for (let h of hist) {
    if (h === 0) continue;
    const p = h / n;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

async function validateImageBuffer(buffer) {
  const meta = await sharp(buffer).metadata();
  const w = meta.width || 0;
  const h = meta.height || 0;
  if (w < MIN_W || h < MIN_H) {
    return {
      ok: false,
      reason: `Image trop petite (${w}×${h}px). Fournissez un scan lisible (min. ${MIN_W}×${MIN_H}).`
    };
  }

  const entropy = await computeImageEntropy(buffer);
  if (entropy < MIN_IMAGE_ENTROPY) {
    return {
      ok: false,
      reason: 'Image trop uniforme ou vide : le document ne semble pas exploitable.'
    };
  }

  const worker = await createWorker('fra+eng', 1, {
    logger: () => {}
  });

  let text = '';
  try {
    const preprocessed = await sharp(buffer)
      .greyscale()
      .normalize()
      .resize({
        width: 2000,
        height: 2000,
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()
      .toBuffer();

    const {
      data: { text: ocrText }
    } = await worker.recognize(preprocessed);
    text = ocrText || '';
  } finally {
    await worker.terminate().catch(() => {});
  }

  const { score, hits } = scoreText(text);
  if (score < MIN_SCORE_PER_FILE) {
    return {
      ok: false,
      reason:
        'Le texte détecté dans l’image ne contient pas assez d’indices médicaux liés à une maladie cœliaque ou à un suivi biologique. Joignez une analyse, une biopsie, un compte-rendu ou un certificat explicite.',
      score,
      hits,
      preview: text.slice(0, 200).replace(/\s+/g, ' '),
      extractedText: text
    };
  }

  return { ok: true, score, hits, kind: 'image', extractedText: text };
}

async function validatePdfBuffer(buffer) {
  const parser = new PDFParse({ data: buffer });
  let text = '';
  try {
    /** Limite aux 8 premières pages pour la performance */
    const result = await parser.getText({ first: 8 });
    text = result?.text || '';
  } catch (e) {
    await parser.destroy().catch(() => {});
    return {
      ok: false,
      reason: `PDF illisible ou corrompu : ${e.message || 'erreur de lecture'}`
    };
  }
  await parser.destroy().catch(() => {});

  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length < 25) {
    return {
      ok: false,
      reason:
        'Ce PDF ne contient presque pas de texte extractible (souvent un scan image). Exportez un PDF avec texte sélectionnable ou envoyez une photo JPG/PNG nette du document.'
    };
  }

  const { score, hits } = scoreText(text);
  if (score < MIN_SCORE_PER_FILE) {
    return {
      ok: false,
      reason:
        'Le contenu du PDF ne semble pas correspondre à une pièce justificative médicale pour la maladie cœliaque (analyses, biopsie, compte-rendu, etc.).',
      score,
      hits,
      extractedText: text
    };
  }

  return { ok: true, score, hits, kind: 'pdf', extractedText: text };
}

/**
 * @param {{ path: string, mimetype: string, originalname?: string }} file
 */
export async function validateDeclarationFile(file) {
  const abs = path.isAbsolute(file.path) ? file.path : path.join(process.cwd(), file.path);
  if (!fs.existsSync(abs)) {
    return { ok: false, reason: 'Fichier introuvable après téléversement.' };
  }

  const buffer = fs.readFileSync(abs);
  const mime = file.mimetype || '';

  if (mime === 'application/pdf') {
    return validatePdfBuffer(buffer);
  }
  if (mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/jpg') {
    return validateImageBuffer(buffer);
  }

  return { ok: false, reason: 'Type de fichier non pris en charge par la validation.' };
}

/**
 * Valide une liste de fichiers après multer. Tous doivent passer.
 */
export async function validateDeclarationFiles(files) {
  if (!isCeliacDocAiEnabled()) {
    return {
      ok: true,
      skipped: true,
      summary: { message: 'Validation IA désactivée (CELIAC_DOC_AI=off)' }
    };
  }

  const details = [];
  for (const f of files) {
    const r = await validateDeclarationFile(f);
    details.push({
      name: f.originalname || path.basename(f.path),
      ...r
    });
    if (!r.ok) {
      return {
        ok: false,
        message: r.reason,
        details
      };
    }
  }

  return {
    ok: true,
    summary: {
      filesChecked: files.length,
      scores: details.map((d) => ({ name: d.name, score: d.score, kind: d.kind, extractedText: d.extractedText }))
    }
  };
}
