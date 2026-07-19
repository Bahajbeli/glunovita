'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'

const API_ORIGIN =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '')) ||
  'http://localhost:5000'

function summarizeCeliacForm(cf: Record<string, unknown> | null | undefined): string[] {
  if (!cf || typeof cf !== 'object') return []
  const lines: string[] = []
  const g = cf.general as Record<string, unknown> | undefined
  if (g) {
    if (g.birthYear) lines.push(`Année de naissance : ${g.birthYear}`)
    if (Array.isArray(g.patientType) && g.patientType.length)
      lines.push(`Type : ${(g.patientType as string[]).join(', ')}`)
    if (Array.isArray(g.sex) && g.sex.length) lines.push(`Sexe : ${(g.sex as string[]).join(', ')}`)
    if (g.countryRegion) lines.push(`Pays/région : ${g.countryRegion}`)
  }
  const ds = cf.diagnosisStatus as Record<string, unknown> | undefined
  if (ds) {
    if (Array.isArray(ds.status) && ds.status.length)
      lines.push(`Statut diagnostic : ${(ds.status as string[]).join(', ')}`)
    if (ds.diagnosisDate) lines.push(`Date diagnostic : ${String(ds.diagnosisDate)}`)
    if (Array.isArray(ds.methods) && ds.methods.length)
      lines.push(`Méthodes : ${(ds.methods as string[]).join(', ')}`)
  }
  const sym = cf.symptoms as string[] | undefined
  if (Array.isArray(sym) && sym.length) lines.push(`Symptômes (${sym.length}) : ${sym.join(', ')}`)
  const diet = cf.diet as Record<string, unknown> | undefined
  if (diet?.glutenFree) lines.push(`Régime sans gluten : ${String(diet.glutenFree)}`)
  const docs = cf.documents as { uploadedUrls?: string[] } | undefined
  if (docs?.uploadedUrls?.length)
    lines.push(`Documents joints : ${docs.uploadedUrls.length} fichier(s)`)
  return lines
}

export default function AdminDeclarationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [declarations, setDeclarations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<any | null>(null)

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchDeclarations()
    }
  }, [user])

  const fetchDeclarations = async () => {
    try {
      const response = await api.get('/patients/declarations')
      setDeclarations(response.data.data)
    } catch (error) {
      console.error('Error fetching declarations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/patients/declarations/${id}/approve`)
      fetchDeclarations()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Échec de la validation')
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Motif du refus :')
    if (reason) {
      try {
        await api.patch(`/patients/declarations/${id}/reject`, { rejectionReason: reason })
        fetchDeclarations()
      } catch (error: any) {
        alert(error.response?.data?.message || 'Échec du refus')
      }
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Chargement…</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Déclarations patients</h1>

        <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date diagnostic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Lieu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Preuve
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {declarations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucune déclaration
                  </td>
                </tr>
              ) : (
                declarations.map((declaration) => (
                  <tr key={declaration._id}>
                    <td className="px-6 py-4">
                      {declaration.patientId?.firstName} {declaration.patientId?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {declaration.diagnosisDate
                        ? new Date(declaration.diagnosisDate).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">{declaration.diagnosisLocation || '—'}</td>
                    <td className="px-6 py-4">{declaration.medicalEvidence || '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          declaration.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : declaration.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {declaration.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {declaration.celiacForm && (
                          <button
                            type="button"
                            onClick={() => setDetail(declaration)}
                            className="bg-slate-600 text-white px-3 py-1 rounded text-sm hover:bg-slate-700"
                          >
                            Détails
                          </button>
                        )}
                        {declaration.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(declaration._id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Approuver
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(declaration._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Formulaire maladie cœliaque</h2>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Patient : {detail.patientId?.firstName} {detail.patientId?.lastName} (
              {detail.patientId?.email})
            </p>
            {detail.aiDecision && (
              <div className={`p-4 rounded-lg mb-6 border ${detail.aiDecision.isSick ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <h3 className={`font-bold ${detail.aiDecision.isSick ? 'text-red-800' : 'text-green-800'}`}>
                  Avis IA (Modèle LLaMA 3) : {detail.aiDecision.isSick ? 'Cœliaque suspecté' : 'Aucune preuve claire'}
                </h3>
                <p className={`text-sm mt-1 ${detail.aiDecision.isSick ? 'text-red-700' : 'text-green-700'}`}>
                  {detail.aiDecision.reason}
                </p>
              </div>
            )}
            <ul className="space-y-2 text-sm text-gray-800 mb-6">
              {summarizeCeliacForm(detail.celiacForm).map((line, i) => (
                <li key={i} className="border-b border-gray-100 pb-2">
                  {line}
                </li>
              ))}
            </ul>
            <details className="text-xs">
              <summary className="cursor-pointer text-primary-600 font-medium mb-2">
                JSON brut
              </summary>
              <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-gray-700 whitespace-pre-wrap break-all">
                {JSON.stringify(detail.celiacForm, null, 2)}
              </pre>
            </details>
            {detail.celiacForm?.documents?.uploadedUrls?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Fichiers</p>
                <ul className="text-sm space-y-1">
                  {detail.celiacForm.documents.uploadedUrls.map((u: string) => (
                    <li key={u}>
                      <a
                        href={`${API_ORIGIN}${u}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 underline break-all"
                      >
                        {u}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="mt-6 w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
