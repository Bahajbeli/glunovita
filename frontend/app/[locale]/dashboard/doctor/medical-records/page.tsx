'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function DoctorMedicalRecordsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    patientId: '',
    visitDate: new Date().toISOString().split('T')[0],
    visitType: 'FOLLOW_UP',
    chiefComplaint: '',
    symptoms: [],
    diagnosis: '',
    treatmentPlan: '',
    medications: [],
    notes: ''
  })

  useEffect(() => {
    if (user && user.role !== 'DOCTOR') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchRecords()
    }
  }, [user])

  const fetchRecords = async () => {
    try {
      const response = await api.get('/medical-records')
      setRecords(response.data.data)
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/medical-records', formData)
      setShowForm(false)
      fetchRecords()
      setFormData({
        patientId: '',
        visitDate: new Date().toISOString().split('T')[0],
        visitType: 'FOLLOW_UP',
        chiefComplaint: '',
        symptoms: [],
        diagnosis: '',
        treatmentPlan: '',
        medications: [],
        notes: ''
      })
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create medical record')
    }
  }

  if (loading) {
    return <Layout><div className="text-center py-12">Loading...</div></Layout>
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              New Record
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create Medical Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visit Date</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visit Type</label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.visitType}
                  onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                >
                  <option value="INITIAL">Initial</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="ROUTINE">Routine</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Chief Complaint</label>
                <textarea
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Treatment Plan</label>
                <textarea
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.treatmentPlan}
                  onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Create Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visit Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No medical records yet
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4">
                      {record.patientId?.firstName} {record.patientId?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(record.visitDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.visitType}</td>
                    <td className="px-6 py-4">{record.diagnosis || 'N/A'}</td>
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
