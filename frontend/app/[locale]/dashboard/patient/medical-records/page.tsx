'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function PatientMedicalRecordsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

  useEffect(() => {
    if (user && user.role !== 'PATIENT') {
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

  if (loading) {
    return <Layout><div className="text-center py-12">Loading...</div></Layout>
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Medical Records</h1>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visit Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No medical records available
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(record.visitDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {record.doctorId?.firstName} {record.doctorId?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.visitType}</td>
                    <td className="px-6 py-4">{record.diagnosis || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedRecord && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Medical Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                <p><strong>Visit Date:</strong> {new Date(selectedRecord.visitDate).toLocaleDateString()}</p>
                <p><strong>Doctor:</strong> {selectedRecord.doctorId?.firstName} {selectedRecord.doctorId?.lastName}</p>
                <p><strong>Type:</strong> {selectedRecord.visitType}</p>
                <p><strong>Chief Complaint:</strong> {selectedRecord.chiefComplaint || 'N/A'}</p>
                <p><strong>Diagnosis:</strong> {selectedRecord.diagnosis || 'N/A'}</p>
                <p><strong>Treatment Plan:</strong> {selectedRecord.treatmentPlan || 'N/A'}</p>
                {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                  <div>
                    <strong>Medications:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {selectedRecord.medications.map((med: any, idx: number) => (
                        <li key={idx}>{med.name} - {med.dosage} ({med.frequency})</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p><strong>Notes:</strong> {selectedRecord.notes || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
