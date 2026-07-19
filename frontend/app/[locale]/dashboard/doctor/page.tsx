'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function DoctorDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [medicalRecords, setMedicalRecords] = useState<any[]>([])
  const [stats, setStats] = useState({ totalPatients: 0, totalRecords: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'DOCTOR') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const recordsRes = await api.get('/medical-records')
      const records = recordsRes.data.data
      setMedicalRecords(records.slice(0, 5))
      setStats({
        totalPatients: new Set(records.map((r: any) => r.patientId._id)).size,
        totalRecords: records.length
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!user || user.role !== 'DOCTOR') {
    return null
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Doctor Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-500">Total Patients</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.totalPatients}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-500">Total Records</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.totalRecords}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-500">Region</h3>
            <p className="text-xl font-semibold text-gray-900">{user.region || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Medical Records</h2>
          {medicalRecords.length === 0 ? (
            <p className="text-gray-500">No medical records yet</p>
          ) : (
            <div className="overflow-x-auto">
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
                  {medicalRecords.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.patientId.firstName} {record.patientId.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(record.visitDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{record.visitType}</td>
                      <td className="px-6 py-4">{record.diagnosis || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
