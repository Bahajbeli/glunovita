'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import CeliacDeclarationForm from '@/components/patient/CeliacDeclarationForm'
import { useTranslations } from 'next-intl'

export default function PatientDeclarationsPage() {
  const t = useTranslations('PatientDeclarations')
  const { user } = useAuth()
  const router = useRouter()
  const [declarations, setDeclarations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (user && user.role !== 'PATIENT') {
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

  const handleFormSuccess = () => {
    setShowForm(false)
    setFormKey((k) => k + 1)
    fetchDeclarations()
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-700">{t('loading')}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          {!showForm && (
            <button
              type="button"
              onClick={() => {
                setFormKey((k) => k + 1)
                setShowForm(true)
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 shrink-0"
            >
              {t('newDeclaration')}
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-10">
            <CeliacDeclarationForm
              key={formKey}
              patientId={user?._id}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setFormKey((k) => k + 1)
                setShowForm(false)
              }}
            />
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('diagnosis')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('location')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('form')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {declarations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {t('noDeclarations')}
                  </td>
                </tr>
              ) : (
                declarations.map((declaration) => (
                  <tr key={declaration._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                      {declaration.createdAt
                        ? new Date(declaration.createdAt).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                      {declaration.diagnosisDate
                        ? new Date(declaration.diagnosisDate).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                      {declaration.diagnosisLocation || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {declaration.celiacForm ? t('complete') : t('summary')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
