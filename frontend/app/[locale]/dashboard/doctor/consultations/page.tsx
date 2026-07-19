'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Button from '@/components/ui/Button'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { IoCalendarOutline, IoCheckmarkCircle, IoCloseCircle, IoTime } from 'react-icons/io5'

interface Consultation {
    _id: string
    patient: {
        _id: string
        firstName: string
        lastName: string
        phoneNumber?: string
    }
    doctor: {
        _id: string
        firstName: string
        lastName: string
    }
    date: string
    status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
    reason?: string
}

export default function DoctorConsultationsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [todayConsultations, setTodayConsultations] = useState<Consultation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        } else if (user && user.role !== 'DOCTOR') {
            router.push(`/dashboard/${user.role.toLowerCase()}`)
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && user.role === 'DOCTOR') {
            fetchConsultations()
        }
    }, [user])

    const fetchConsultations = async () => {
        try {
            const res = await api.get('/consultations')
            const allConsultations = res.data.data
            setConsultations(allConsultations)

            // Filter today's consultations
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            const todayOnly = allConsultations.filter((c: Consultation) => {
                const consultDate = new Date(c.date)
                return consultDate >= today && consultDate < tomorrow
            })

            setTodayConsultations(todayOnly)
        } catch (error) {
            console.error('Error fetching consultations:', error)
            toast.error('Erreur lors du chargement des rendez-vous')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await api.put(`/consultations/${id}`, { status: newStatus })
            const statusLabels: Record<string, string> = {
                CONFIRMED: 'confirmé',
                CANCELLED: 'annulé',
                COMPLETED: 'terminé'
            }
            toast.success(`Rendez-vous ${statusLabels[newStatus] || newStatus}`)
            fetchConsultations()
        } catch (error: any) {
            console.error('Error updating status:', error)
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour')
        }
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            REQUESTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
            CANCELLED: 'bg-red-100 text-red-800 border-red-200',
            COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200'
        }

        const labels = {
            REQUESTED: 'En attente',
            CONFIRMED: 'Confirmé',
            CANCELLED: 'Annulé',
            COMPLETED: 'Terminé'
        }

        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        )
    }

    if (authLoading || loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Rendez-vous</h1>
                    <p className="text-gray-600">Gérez vos consultations et rendez-vous patients</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium mb-1">En attente</p>
                                <p className="text-3xl font-bold text-yellow-900">
                                    {consultations.filter(c => c.status === 'REQUESTED').length}
                                </p>
                            </div>
                            <IoTime className="w-12 h-12 text-yellow-600 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium mb-1">Confirmés</p>
                                <p className="text-3xl font-bold text-green-900">
                                    {consultations.filter(c => c.status === 'CONFIRMED').length}
                                </p>
                            </div>
                            <IoCheckmarkCircle className="w-12 h-12 text-green-600 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium mb-1">Aujourd'hui</p>
                                <p className="text-3xl font-bold text-blue-900">{todayConsultations.length}</p>
                            </div>
                            <IoCalendarOutline className="w-12 h-12 text-blue-600 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium mb-1">Total</p>
                                <p className="text-3xl font-bold text-purple-900">{consultations.length}</p>
                            </div>
                            <IoCalendarOutline className="w-12 h-12 text-purple-600 opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Today's Consultations */}
                <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100 mb-8">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <IoCalendarOutline className="w-7 h-7" />
                            Consultations d'aujourd'hui
                        </h2>
                        <p className="text-primary-100 mt-1">
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Heure</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Téléphone</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Motif</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {todayConsultations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <IoCalendarOutline className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">Aucune consultation aujourd'hui</p>
                                        </td>
                                    </tr>
                                ) : (
                                    todayConsultations.map((c) => (
                                        <tr key={c._id} className="hover:bg-primary-50/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-primary-700">
                                                {new Date(c.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {c.patient.firstName} {c.patient.lastName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {c.patient.phoneNumber || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {c.reason || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(c.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    {c.status === 'REQUESTED' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(c._id, 'CONFIRMED')}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <IoCheckmarkCircle className="w-4 h-4" />
                                                            Confirmer
                                                        </Button>
                                                    )}
                                                    {c.status === 'CONFIRMED' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(c._id, 'COMPLETED')}
                                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            Terminer
                                                        </Button>
                                                    )}
                                                    {c.status !== 'CANCELLED' && c.status !== 'COMPLETED' && (
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => handleStatusUpdate(c._id, 'CANCELLED')}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <IoCloseCircle className="w-4 h-4" />
                                                            Annuler
                                                        </Button>
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

                {/* All Consultations */}
                <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Tous les rendez-vous</h2>
                        <p className="text-sm text-gray-600 mt-1">Historique complet de vos consultations</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date & Heure</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Motif</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {consultations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            Aucun rendez-vous trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    consultations.map((c) => (
                                        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {c.patient.firstName} {c.patient.lastName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(c.date).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {c.reason || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(c.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    {c.status === 'REQUESTED' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(c._id, 'CONFIRMED')}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <IoCheckmarkCircle className="w-4 h-4" />
                                                            Confirmer
                                                        </Button>
                                                    )}
                                                    {c.status === 'CONFIRMED' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(c._id, 'COMPLETED')}
                                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            Terminer
                                                        </Button>
                                                    )}
                                                    {c.status !== 'CANCELLED' && c.status !== 'COMPLETED' && (
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => handleStatusUpdate(c._id, 'CANCELLED')}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <IoCloseCircle className="w-4 h-4" />
                                                            Annuler
                                                        </Button>
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
            </div>
        </Layout>
    )
}
