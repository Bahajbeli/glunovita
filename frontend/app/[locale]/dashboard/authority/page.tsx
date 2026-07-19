'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AuthorityDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'AUTHORITY') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchStatistics()
    }
  }, [user])

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/statistics')
      setStatistics(response.data.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!user || user.role !== 'AUTHORITY') {
    return null
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Statistics Dashboard</h1>
        <p className="text-gray-600 mb-6">Region: {user.region || 'All Regions'}</p>
        
        {statistics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Patient Statistics</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Total Patients:</span> {statistics.patients.total}</p>
                  <p><span className="font-medium">With Approved Declaration:</span> {statistics.patients.withApprovedDeclaration}</p>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Medical Records</h2>
                <p><span className="font-medium">Total Records:</span> {statistics.medicalRecords.total}</p>
              </div>
            </div>

            {statistics.patients.regionalDistribution && statistics.patients.regionalDistribution.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Regional Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statistics.patients.regionalDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {statistics.medicalRecords.byType && statistics.medicalRecords.byType.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Medical Records by Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics.medicalRecords.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statistics.medicalRecords.byType.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {statistics.declarations.statusDistribution && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Declaration Status</h2>
                <div className="grid grid-cols-3 gap-4">
                  {statistics.declarations.statusDistribution.map((status: any) => (
                    <div key={status.status} className="text-center">
                      <p className="text-2xl font-bold text-primary-600">{status.count}</p>
                      <p className="text-sm text-gray-600">{status.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
