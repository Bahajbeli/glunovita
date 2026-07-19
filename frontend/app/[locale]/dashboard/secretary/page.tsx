'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiUser, FiPlus, FiSearch } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { useDebounce } from '@/hooks/useDebounce'

interface Patient {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
}

export default function SecretaryDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showPatientResults, setShowPatientResults] = useState(false)
  const [searchingPatients, setSearchingPatients] = useState(false)
  const debouncedSearch = useDebounce(patientSearch, 300)
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: '30',
    type: 'CONSULTATION',
    reason: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'SECRETARY') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user, selectedDate])

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      searchPatients(debouncedSearch)
    } else {
      setPatientResults([])
      setShowPatientResults(false)
    }
  }, [debouncedSearch])

  const fetchAppointments = async () => {
    try {
      const response = await api.get(`/appointments/daily?date=${selectedDate}`)
      setAppointments(response.data.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchPatients = async (searchTerm: string) => {
    if (searchTerm.length < 2) return
    
    setSearchingPatients(true)
    try {
      const response = await api.get(`/users/search/patients?search=${encodeURIComponent(searchTerm)}`)
      setPatientResults(response.data.data)
      setShowPatientResults(true)
    } catch (error) {
      console.error('Error searching patients:', error)
      setPatientResults([])
    } finally {
      setSearchingPatients(false)
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData({ ...formData, patientId: patient._id })
    setPatientSearch(`${patient.firstName} ${patient.lastName}`)
    setShowPatientResults(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patientId) {
      toast.error('Veuillez sélectionner un patient')
      return
    }

    if (!user?.doctorId) {
      toast.error('Vous devez être assigné à un docteur')
      return
    }

    try {
      const endTime = calculateEndTime(formData.startTime, parseInt(formData.duration))
      await api.post('/appointments', {
        patientId: formData.patientId,
        appointmentDate: formData.appointmentDate,
        startTime: formData.startTime,
        endTime,
        duration: parseInt(formData.duration),
        type: formData.type,
        reason: formData.reason
      })
      toast.success('Consultation créée avec succès')
      setShowModal(false)
      setFormData({
        patientId: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        startTime: '',
        duration: '30',
        type: 'CONSULTATION',
        reason: ''
      })
      setPatientSearch('')
      setSelectedPatient(null)
      fetchAppointments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
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

  if (authLoading || loading) {
    return <Layout><div className="flex justify-center py-12"><div className="spinner"></div></div></Layout>
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Consultations</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FiCalendar className="w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <Button onClick={() => setShowModal(true)}>
              <FiPlus className="w-5 h-5 mr-2" />
              Nouvelle Consultation
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <p className="text-gray-500 mb-4">{appointments.length} consultation(s)</p>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune consultation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-teal-50 rounded-lg p-3 text-center">
                      <FiClock className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                      <span className="text-sm font-medium">{appointment.startTime}</span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">
                        {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{appointment.patientId?.email}</p>
                      {appointment.reason && (
                        <p className="text-sm text-gray-500">Motif: {appointment.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[appointment.status]}`}>
                      {appointment.status}
                    </span>
                    <select
                      value={appointment.status}
                      onChange={(e) => updateStatus(appointment._id, e.target.value)}
                      className="px-3 py-1 border rounded-lg text-sm"
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

        <Modal isOpen={showModal} onClose={() => {
          setShowModal(false)
          setPatientSearch('')
          setSelectedPatient(null)
          setPatientResults([])
        }} title="Nouvelle Consultation">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du Patient <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value)
                    if (e.target.value === '') {
                      setSelectedPatient(null)
                      setFormData({ ...formData, patientId: '' })
                      setShowPatientResults(false)
                    }
                  }}
                  onFocus={() => {
                    if (patientResults.length > 0 && patientSearch.length >= 2) {
                      setShowPatientResults(true)
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding to allow click on results
                    setTimeout(() => setShowPatientResults(false), 200)
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required={!selectedPatient}
                />
                {searchingPatients && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="spinner-small"></div>
                  </div>
                )}
              </div>
              {showPatientResults && patientResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {patientResults.map((patient) => (
                    <div
                      key={patient._id}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handlePatientSelect(patient)
                      }}
                      className="px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{patient.email}</p>
                          {patient.phoneNumber && (
                            <p className="text-xs text-gray-400">{patient.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showPatientResults && patientResults.length === 0 && debouncedSearch.length >= 2 && !searchingPatients && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  Aucun patient trouvé
                </div>
              )}
              {selectedPatient && (
                <div className="mt-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <p className="text-sm font-medium text-teal-900">
                    ✓ Patient sélectionné: {selectedPatient.firstName} {selectedPatient.lastName}
                  </p>
                  <p className="text-xs text-teal-700 mt-1">{selectedPatient.email}</p>
                </div>
              )}
            </div>
            <Input
              label="Date"
              type="date"
              required
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
            />
            <Input
              label="Heure de début"
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée (minutes)</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 heure</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="CONSULTATION">Consultation</option>
                <option value="FOLLOW_UP">Suivi</option>
                <option value="INITIAL_VISIT">Première visite</option>
                <option value="EMERGENCY">Urgence</option>
              </select>
            </div>
            <Input
              label="Motif"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
            <div className="flex space-x-2 pt-4">
              <Button type="submit" fullWidth>Créer</Button>
              <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
