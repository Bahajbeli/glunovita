'use client'

import { useRef, useState } from 'react'
import api from '@/lib/api'

export type CeliacFormState = {
  general: {
    patientType: string[]
    sex: string[]
    birthYear: string
    countryRegion: string
  }
  diagnosisStatus: {
    status: string[]
    diagnosisDate: string
    methods: string[]
  }
  healthProfessional: {
    doctorType: string[]
    diagnosisCountry: string
  }
  symptoms: string[]
  symptomsOther: string
  history: {
    symptomOnsetAge: string
    symptomOnsetDateApprox: string
    detection: string[]
  }
  familyHistory: {
    casesInFamily: string
    relatives: string[]
  }
  associatedConditions: string[]
  associatedAutoimmuneDetail: string
  associatedOtherDetail: string
  allergiesFood: string[]
  allergiesFoodOther: string
  allergiesDrug: string
  diet: {
    glutenFree: string
    dietStartDate: string
    dietEffect: string
  }
  followUp: {
    hasGP: string
    doctorTypes: string[]
    frequency: string[]
  }
  insurance: {
    hasInsurance: string
    types: string[]
  }
  documents: {
    types: string[]
    uploadedUrls: string[]
  }
  dailyLife: {
    dietDifficulty: string
    productAccess: string
  }
  consent: {
    accuracy: boolean
    research: boolean
  }
}

export function createEmptyCeliacForm(): CeliacFormState {
  return {
    general: { patientType: [], sex: [], birthYear: '', countryRegion: '' },
    diagnosisStatus: { status: [], diagnosisDate: '', methods: [] },
    healthProfessional: { doctorType: [], diagnosisCountry: '' },
    symptoms: [],
    symptomsOther: '',
    history: { symptomOnsetAge: '', symptomOnsetDateApprox: '', detection: [] },
    familyHistory: { casesInFamily: '', relatives: [] },
    associatedConditions: [],
    associatedAutoimmuneDetail: '',
    associatedOtherDetail: '',
    allergiesFood: [],
    allergiesFoodOther: '',
    allergiesDrug: '',
    diet: { glutenFree: '', dietStartDate: '', dietEffect: '' },
    followUp: { hasGP: '', doctorTypes: [], frequency: [] },
    insurance: { hasInsurance: '', types: [] },
    documents: { types: [], uploadedUrls: [] },
    dailyLife: { dietDifficulty: '', productAccess: '' },
    consent: { accuracy: false, research: false },
  }
}

function toggle<T extends string>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border border-gray-200 rounded-xl p-5 md:p-6 bg-white shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">
        {title}
      </h3>
      {children}
    </section>
  )
}

function CheckboxGrid({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[]
  value: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((o) => (
        <label
          key={o.id}
          className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={value.includes(o.id)}
            onChange={() => onChange(toggle(value, o.id))}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}

const API_ORIGIN =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '')) ||
  'http://localhost:5000'

type Props = {
  patientId?: string
  onSuccess: () => void
  onCancel: () => void
}

import { useTranslations } from 'next-intl'

export default function CeliacDeclarationForm({
  patientId,
  onSuccess,
  onCancel,
}: Props) {
  const t = useTranslations('CeliacForm')
  const [form, setForm] = useState<CeliacFormState>(createEmptyCeliacForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [ocrResults, setOcrResults] = useState<Array<{name: string, text: string}>>([])
  const [showOcrPopup, setShowOcrPopup] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const setConsent = (key: 'accuracy' | 'research', v: boolean) => {
    setForm((f) => ({
      ...f,
      consent: { ...f.consent, [key]: v },
    }))
  }

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return { urls: [], extractedTexts: [] }
    const fd = new FormData()
    Array.from(files).forEach((file) => fd.append('files', file))
    const res = await api.post('/upload/declaration', fd)
    const urls = (res.data.urls || []) as string[]
    const scores = res.data.validation?.scores || []
    const extractedTexts = scores.map((s: any) => ({ name: s.name, text: s.extractedText }))
    return { urls, extractedTexts }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    
    setError(null)
    setUploadingFiles(true)
    try {
      const { urls, extractedTexts } = await uploadFiles(files)
      setForm(f => ({
        ...f,
        documents: {
          ...f.documents,
          uploadedUrls: [...f.documents.uploadedUrls, ...urls]
        }
      }))
      
      const validTexts = extractedTexts.filter((t: any) => t.text && t.text.trim().length > 0)
      if (validTexts.length > 0) {
        setOcrResults(validTexts)
        setShowOcrPopup(true)
      }
    } catch (err: any) {
      const data = err?.response?.data
      let msg = data?.message || 'Échec du téléversement.'
      if (data?.details?.length) {
        const parts = data.details
          .filter((d: any) => d.reason)
          .map((d: any) => `${d.name || 'Fichier'} : ${d.reason}`)
        if (parts.length) msg = `${msg} — ${parts.join(' · ')}`
      }
      setError(msg)
    } finally {
      setUploadingFiles(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.consent.accuracy || !form.consent.research) {
      setError('Veuillez cocher les deux cases de consentement (section 14).')
      return
    }
    if (!form.general.birthYear.trim()) {
      setError('L’année de naissance est obligatoire.')
      return
    }
    setSubmitting(true)
    try {
      // Les fichiers sont déjà téléversés via handleFileChange, on utilise juste les URLs stockées
      const uploadedUrls = form.documents.uploadedUrls
      const celiacForm = {
        ...form,
        documents: { ...form.documents, uploadedUrls, extractedTexts: ocrResults },
      }
      await api.post('/patients/declarations', { celiacForm })
      onSuccess()
    } catch (err: any) {
      const data = err?.response?.data
      let msg = data?.message || 'Échec de l’envoi de la déclaration.'
      if (data?.details?.length) {
        const parts = data.details
          .filter((d: any) => d.reason)
          .map((d: any) => `${d.name || 'Fichier'} : ${d.reason}`)
        if (parts.length) msg = `${msg} — ${parts.join(' · ')}`
      }
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
        <h2 className="text-xl font-bold text-gray-900">
          {t('title')}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {t('subtitle')}
        </p>
      </div>

    <Section title={t('sec1')}>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Type de patient</p>
          <CheckboxGrid
            options={[
              { id: 'ADULT', label: 'Adulte' },
              { id: 'CHILD', label: 'Enfant' },
            ]}
            value={form.general.patientType}
            onChange={(v) =>
              setForm((f) => ({ ...f, general: { ...f.general, patientType: v } }))
            }
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Sexe</p>
          <CheckboxGrid
            options={[
              { id: 'M', label: 'Masculin' },
              { id: 'F', label: 'Féminin' },
              { id: 'OTHER', label: 'Autre' },
            ]}
            value={form.general.sex}
            onChange={(v) =>
              setForm((f) => ({ ...f, general: { ...f.general, sex: v } }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Année de naissance *
          </label>
          <input
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            required
            className="mt-1 w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md"
            value={form.general.birthYear}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                general: { ...f.general, birthYear: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pays / région (optionnel)
          </label>
          <input
            type="text"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            value={form.general.countryRegion}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                general: { ...f.general, countryRegion: e.target.value },
              }))
            }
          />
        </div>
      </Section>

      <Section title={t('sec2')}>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Statut du diagnostic de maladie cœliaque
          </p>
          <CheckboxGrid
            options={[
              { id: 'CONFIRMED', label: 'Diagnostic confirmé' },
              { id: 'SUSPECTED', label: 'Diagnostic suspecté' },
              { id: 'UNDER_INVESTIGATION', label: 'En cours d’exploration médicale' },
            ]}
            value={form.diagnosisStatus.status}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                diagnosisStatus: { ...f.diagnosisStatus, status: v },
              }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date du diagnostic (si confirmé)
          </label>
          <input
            type="date"
            className="mt-1 w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md"
            value={form.diagnosisStatus.diagnosisDate}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                diagnosisStatus: {
                  ...f.diagnosisStatus,
                  diagnosisDate: e.target.value,
                },
              }))
            }
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Méthode de diagnostic utilisée
          </p>
          <CheckboxGrid
            options={[
              { id: 'BLOOD_ANTIBODIES', label: 'Analyse sanguine (anticorps)' },
              { id: 'INTESTINAL_BIOPSY', label: 'Biopsie intestinale' },
              { id: 'GENETIC_TEST', label: 'Test génétique' },
              { id: 'CLINICAL_DIAGNOSIS', label: 'Diagnostic clinique' },
              { id: 'OTHER_METHOD', label: 'Autre' },
            ]}
            value={form.diagnosisStatus.methods}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                diagnosisStatus: { ...f.diagnosisStatus, methods: v },
              }))
            }
          />
        </div>
      </Section>

      <Section title={t('sec3')}>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Type de médecin</p>
          <CheckboxGrid
            options={[
              { id: 'GASTRO', label: 'Gastro-entérologue' },
              { id: 'GP', label: 'Médecin généraliste' },
              { id: 'PEDIATRICIAN', label: 'Pédiatre' },
              { id: 'NUTRITIONIST', label: 'Nutritionniste' },
              { id: 'OTHER_SPECIALIST', label: 'Autre spécialiste' },
            ]}
            value={form.healthProfessional.doctorType}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                healthProfessional: { ...f.healthProfessional, doctorType: v },
              }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pays du diagnostic (facultatif)
          </label>
          <input
            type="text"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            value={form.healthProfessional.diagnosisCountry}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                healthProfessional: {
                  ...f.healthProfessional,
                  diagnosisCountry: e.target.value,
                },
              }))
            }
          />
        </div>
      </Section>

      <Section title={t('sec4')}>
        <CheckboxGrid
          options={[
            { id: 'ABDOMINAL_PAIN', label: 'Douleurs abdominales' },
            { id: 'BLOATING', label: 'Ballonnements' },
            { id: 'CHRONIC_DIARRHEA', label: 'Diarrhée chronique' },
            { id: 'CONSTIPATION', label: 'Constipation' },
            { id: 'CHRONIC_FATIGUE', label: 'Fatigue chronique' },
            { id: 'WEIGHT_LOSS', label: 'Perte de poids' },
            { id: 'GROWTH_DELAY', label: 'Retard de croissance (enfants)' },
            { id: 'ANEMIA', label: 'Anémie' },
            { id: 'VOMITING', label: 'Vomissements' },
            { id: 'DERMATITIS_HERPETIFORMIS', label: 'Dermatite herpétiforme' },
          ]}
          value={form.symptoms}
          onChange={(v) => setForm((f) => ({ ...f, symptoms: v }))}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Autres symptômes (préciser)
          </label>
          <textarea
            rows={2}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            value={form.symptomsOther}
            onChange={(e) => setForm((f) => ({ ...f, symptomsOther: e.target.value }))}
          />
        </div>
      </Section>

      <Section title={t('sec5')}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Âge approximatif d’apparition des premiers symptômes
            </label>
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              value={form.history.symptomOnsetAge}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  history: { ...f.history, symptomOnsetAge: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date approximative des premiers symptômes
            </label>
            <input
              type="date"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              value={form.history.symptomOnsetDateApprox}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  history: {
                    ...f.history,
                    symptomOnsetDateApprox: e.target.value,
                  },
                }))
              }
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Comment la maladie a été détectée ?
          </p>
          <CheckboxGrid
            options={[
              { id: 'DIGESTIVE_SYMPTOMS', label: 'Symptômes digestifs' },
              { id: 'BLOOD_TEST', label: 'Analyse sanguine' },
              { id: 'FAMILY_SCREENING', label: 'Dépistage familial' },
              { id: 'ROUTINE_EXAM', label: 'Examen médical de routine' },
              { id: 'OTHER_DISEASE_DIAGNOSIS', label: 'Diagnostic d’une autre maladie' },
              { id: 'OTHER_DETECTION', label: 'Autre' },
            ]}
            value={form.history.detection}
            onChange={(v) =>
              setForm((f) => ({ ...f, history: { ...f.history, detection: v } }))
            }
          />
        </div>
      </Section>

      <Section title={t('sec6')}>
        <div className="flex flex-wrap gap-4">
          {(['YES', 'NO', 'UNKNOWN'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="familyCases"
                checked={form.familyHistory.casesInFamily === v}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    familyHistory: { ...f.familyHistory, casesInFamily: v },
                  }))
                }
                className="text-primary-600"
              />
              {v === 'YES' ? 'Oui' : v === 'NO' ? 'Non' : 'Inconnu'}
            </label>
          ))}
        </div>
        {form.familyHistory.casesInFamily === 'YES' && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Parent / membre atteint</p>
            <CheckboxGrid
              options={[
                { id: 'FATHER', label: 'Père' },
                { id: 'MOTHER', label: 'Mère' },
                { id: 'SIBLING', label: 'Frère / sœur' },
                { id: 'CHILD', label: 'Enfant' },
                { id: 'OTHER_FAMILY', label: 'Autre membre de la famille' },
              ]}
              value={form.familyHistory.relatives}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  familyHistory: { ...f.familyHistory, relatives: v },
                }))
              }
            />
          </div>
        )}
      </Section>

      <Section title={t('sec7')}>
        <CheckboxGrid
          options={[
            { id: 'T1D', label: 'Diabète de type 1' },
            { id: 'HASHIMOTO', label: 'Thyroïdite de Hashimoto' },
            { id: 'DH', label: 'Dermatite herpétiforme' },
            { id: 'AUTOIMMUNE', label: 'Maladie auto-immune (préciser ci-dessous)' },
            { id: 'NONE_ASSOC', label: 'Aucune' },
            { id: 'OTHER_ASSOC', label: 'Autre maladie (préciser ci-dessous)' },
          ]}
          value={form.associatedConditions}
          onChange={(v) =>
            setForm((f) => ({ ...f, associatedConditions: v }))
          }
        />
        <input
          type="text"
          placeholder="Précision maladie auto-immune"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={form.associatedAutoimmuneDetail}
          onChange={(e) =>
            setForm((f) => ({ ...f, associatedAutoimmuneDetail: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Précision autre maladie"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={form.associatedOtherDetail}
          onChange={(e) =>
            setForm((f) => ({ ...f, associatedOtherDetail: e.target.value }))
          }
        />
      </Section>

      <Section title={t('sec8')}>
        <p className="text-sm font-medium text-gray-700">Allergies alimentaires</p>
        <CheckboxGrid
          options={[
            { id: 'LACTOSE', label: 'Lactose' },
            { id: 'NUTS', label: 'Fruits à coque' },
            { id: 'PEANUTS', label: 'Arachides' },
            { id: 'EGGS', label: 'Œufs' },
            { id: 'SOY', label: 'Soja' },
            { id: 'FOOD_OTHER', label: 'Autres' },
          ]}
          value={form.allergiesFood}
          onChange={(v) => setForm((f) => ({ ...f, allergiesFood: v }))}
        />
        <input
          type="text"
          placeholder="Précision autres allergies alimentaires"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          value={form.allergiesFoodOther}
          onChange={(e) =>
            setForm((f) => ({ ...f, allergiesFoodOther: e.target.value }))
          }
        />
        <p className="text-sm font-medium text-gray-700">Allergies médicamenteuses</p>
        <div className="flex gap-4">
          {(['YES', 'NO'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="drugAllergy"
                checked={form.allergiesDrug === v}
                onChange={() => setForm((f) => ({ ...f, allergiesDrug: v }))}
                className="text-primary-600"
              />
              {v === 'YES' ? 'Oui' : 'Non'}
            </label>
          ))}
        </div>
      </Section>

      <Section title={t('sec9')}>
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'STRICT', label: 'Oui strict' },
            { id: 'PARTIAL', label: 'Oui partiellement' },
            { id: 'NO_GF', label: 'Non' },
          ].map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="glutenFree"
                checked={form.diet.glutenFree === o.id}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    diet: { ...f.diet, glutenFree: o.id },
                  }))
                }
                className="text-primary-600"
              />
              {o.label}
            </label>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date de début du régime sans gluten
          </label>
          <input
            type="date"
            className="mt-1 w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md"
            value={form.diet.dietStartDate}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                diet: { ...f.diet, dietStartDate: e.target.value },
              }))
            }
          />
        </div>
        <p className="text-sm font-medium text-gray-700">Effet du régime sur les symptômes</p>
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'MAJOR', label: 'Amélioration importante' },
            { id: 'PARTIAL_IMPROV', label: 'Amélioration partielle' },
            { id: 'NONE_IMPROV', label: 'Aucune amélioration' },
          ].map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="dietEffect"
                checked={form.diet.dietEffect === o.id}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    diet: { ...f.diet, dietEffect: o.id },
                  }))
                }
                className="text-primary-600"
              />
              {o.label}
            </label>
          ))}
        </div>
      </Section>

      <Section title={t('sec10')}>
        <div className="flex gap-4">
          {(['YES', 'NO'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="hasGP"
                checked={form.followUp.hasGP === v}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    followUp: { ...f.followUp, hasGP: v },
                  }))
                }
                className="text-primary-600"
              />
              {v === 'YES' ? 'Médecin traitant : oui' : 'Médecin traitant : non'}
            </label>
          ))}
        </div>
        <p className="text-sm font-medium text-gray-700">Type de médecin</p>
        <CheckboxGrid
          options={[
            { id: 'FU_GASTRO', label: 'Gastro-entérologue' },
            { id: 'FU_GP', label: 'Médecin généraliste' },
            { id: 'FU_PEDIA', label: 'Pédiatre' },
            { id: 'FU_NUTRI', label: 'Nutritionniste' },
            { id: 'FU_OTHER', label: 'Autre' },
          ]}
          value={form.followUp.doctorTypes}
          onChange={(v) =>
            setForm((f) => ({
              ...f,
              followUp: { ...f.followUp, doctorTypes: v },
            }))
          }
        />
        <p className="text-sm font-medium text-gray-700">Fréquence du suivi médical</p>
        <CheckboxGrid
          options={[
            { id: 'EVERY_6M', label: 'Tous les 6 mois' },
            { id: 'YEARLY', label: 'Annuel' },
            { id: 'IRREGULAR', label: 'Irrégulier' },
          ]}
          value={form.followUp.frequency}
          onChange={(v) =>
            setForm((f) => ({
              ...f,
              followUp: { ...f.followUp, frequency: v },
            }))
          }
        />
      </Section>

      <Section title={t('sec11')}>
        <div className="flex gap-4">
          {(['YES', 'NO'] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="insurance"
                checked={form.insurance.hasInsurance === v}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    insurance: { ...f.insurance, hasInsurance: v },
                  }))
                }
                className="text-primary-600"
              />
              {v === 'YES' ? 'Oui' : 'Non'}
            </label>
          ))}
        </div>
        <p className="text-sm font-medium text-gray-700">Type d’assurance</p>
        <CheckboxGrid
          options={[
            { id: 'PUBLIC', label: 'Assurance publique' },
            { id: 'PRIVATE', label: 'Assurance privée' },
            { id: 'CHILD_INS', label: 'Assurance enfant' },
            { id: 'INS_OTHER', label: 'Autre' },
          ]}
          value={form.insurance.types}
          onChange={(v) =>
            setForm((f) => ({
              ...f,
              insurance: { ...f.insurance, types: v },
            }))
          }
        />
      </Section>

      <Section title={t('sec12')}>
        <CheckboxGrid
          options={[
            { id: 'BLOOD_REPORTS', label: 'Analyses sanguines' },
            { id: 'BIOPSY_REPORT', label: 'Rapport de biopsie' },
            { id: 'MEDICAL_CERTIFICATE', label: 'Certificat médical' },
            { id: 'PRESCRIPTION', label: 'Ordonnance' },
            { id: 'OTHER_DOC', label: 'Autre document' },
          ]}
          value={form.documents.types}
          onChange={(v) =>
            setForm((f) => ({
              ...f,
              documents: { ...f.documents, types: v },
            }))
          }
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléversement (PDF, JPG, PNG — plusieurs fichiers possibles)
          </label>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="block w-full text-sm text-gray-600"
            onChange={handleFileChange}
            disabled={uploadingFiles}
          />
          {uploadingFiles && (
            <p className="text-sm text-primary-600 mt-2 animate-pulse">
              Téléversement et analyse OCR en cours...
            </p>
          )}
          {form.documents.uploadedUrls.length > 0 && (
            <ul className="mt-2 text-xs text-gray-500 space-y-1">
              {form.documents.uploadedUrls.map((u) => (
                <li key={u}>
                  <a
                    href={`${API_ORIGIN}${u}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 underline"
                  >
                    {u.split('/').pop() || 'Document'}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      <Section title={t('sec13')}>
        <p className="text-sm font-medium text-gray-700">
          Difficulté à suivre un régime sans gluten
        </p>
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'LOW', label: 'Faible' },
            { id: 'MEDIUM', label: 'Moyenne' },
            { id: 'HIGH', label: 'Élevée' },
          ].map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="dietDifficulty"
                checked={form.dailyLife.dietDifficulty === o.id}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    dailyLife: { ...f.dailyLife, dietDifficulty: o.id },
                  }))
                }
                className="text-primary-600"
              />
              {o.label}
            </label>
          ))}
        </div>
        <p className="text-sm font-medium text-gray-700">
          Accès aux produits sans gluten dans votre région
        </p>
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'EASY', label: 'Facile' },
            { id: 'MODERATE', label: 'Modéré' },
            { id: 'DIFFICULT', label: 'Difficile' },
          ].map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="productAccess"
                checked={form.dailyLife.productAccess === o.id}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    dailyLife: { ...f.dailyLife, productAccess: o.id },
                  }))
                }
                className="text-primary-600"
              />
              {o.label}
            </label>
          ))}
        </div>
      </Section>

      <Section title={t('sec14')}>
        <label className="flex items-start gap-3 text-sm text-gray-800 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent.accuracy}
            onChange={(e) => setConsent('accuracy', e.target.checked)}
            className="mt-1 rounded border-gray-300 text-primary-600"
          />
          <span>
            Je confirme que les informations fournies sont exactes. *
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-gray-800 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent.research}
            onChange={(e) => setConsent('research', e.target.checked)}
            className="mt-1 rounded border-gray-300 text-primary-600"
          />
          <span>
            J’accepte que mes données soient utilisées de manière anonymisée pour des études
            statistiques ou scientifiques. *
          </span>
        </label>
      </Section>

      {error && (
        <div className="rounded-lg bg-red-50 text-red-800 text-sm px-4 py-3 border border-red-100">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 pb-8">
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          {submitting ? t('submitting') : t('submit')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-300"
        >
          {t('cancel')}
        </button>
      </div>

      {showOcrPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Résultats de l'analyse (OCR)
              </h3>
              <button
                type="button"
                onClick={() => setShowOcrPopup(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow space-y-6">
              <p className="text-sm text-gray-600">
                Voici le texte extrait automatiquement de vos documents. (Une IA l'analysera ultérieurement pour affiner le diagnostic).
              </p>
              {ocrResults.map((result, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 font-medium text-sm text-gray-800 border-b border-gray-200">
                    {result.name}
                  </div>
                  <div className="p-4 bg-gray-50 text-sm font-mono text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {result.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowOcrPopup(false)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
