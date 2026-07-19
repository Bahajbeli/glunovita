'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'DOCTOR') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user, selectedDate])

  const fetchAppointments = async () => {
    try {
      const response = await api.get(`/appointments/daily?date=${selectedDate}`)
      setAppointments(response.data.data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus })
      toast.success('Statut mis à jour')
      fetchAppointments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const statusColors: any = {
    SCHEDULED: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <Layout><div className="flex justify-center py-12"><div className="spinner"></div></div></Layout>
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Consultations Journalières</h1>
          <div className="flex items-center space-x-2">
            <FiCalendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <p className="text-gray-500">{appointments.length} consultation(s)</p>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune consultation pour cette date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center bg-teal-50 rounded-lg p-3">
                      <FiClock className="w-6 h-6 text-teal-600 mb-1" />
                      <span className="text-sm font-medium">{appointment.startTime}</span>
                      <span className="text-xs text-gray-500">{appointment.duration}min</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <FiUser className="w-4 h-4 text-gray-500" />
                        <p className="font-medium text-lg">
                          {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{appointment.patientId?.email}</p>
                      {appointment.reason && (
                        <p className="text-sm text-gray-500 mt-1">Motif: {appointment.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[appointment.status]}`}>
                      {appointment.status}
                    </span>
                    <select
                      value={appointment.status}
                      onChange={(e) => updateStatus(appointment._id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="SCHEDULED">Planifiée</option>
                      <option value="CONFIRMED">Confirmée</option>
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="COMPLETED">Terminée</option>
                      <option value="CANCELLED">Annulée</option>
                      <option value="NO_SHOW">Absent</option>
                    </select>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
