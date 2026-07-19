'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'

export default function PatientConsultationsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [consultations, setConsultations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        } else if (user && user.role !== 'PATIENT') {
            router.push(`/dashboard/${user.role.toLowerCase()}`)
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && user.role === 'PATIENT') {
            fetchConsultations()
        }
    }, [user])

    const fetchConsultations = async () => {
        try {
            const res = await api.get('/consultations')
            setConsultations(res.data.data)
        } catch (error) {
            console.error('Error fetching consultations:', error)
            toast.error('Erreur lors du chargement des rendez-vous')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return
        try {
            await api.put(`/consultations/${id}`, { status: 'CANCELLED' })
            toast.success('Rendez-vous annulé')
            fetchConsultations()
        } catch (error) {
            console.error('Error cancelling:', error)
            toast.error('Erreur lors de l\'annulation')
        }
    }

    if (authLoading || loading) {
        return <div className="text-center py-12">Chargement...</div>
    }

    return (
        <Layout>
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
                    <Button onClick={() => router.push('/dashboard/patient/consultations/book')}>
                        Prendre un nouveau RDV
                    </Button>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médecin</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialité</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {consultations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            Vous n'avez pas encore de rendez-vous.
                                        </td>
                                    </tr>
                                ) : (
                                    consultations.map((c) => (
                                        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                {c.doctor.firstName} {c.doctor.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {c.doctor.specialization || 'Médecin'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(c.date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                          ${c.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' :
                                                        c.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                            c.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                                c.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {(c.status === 'REQUESTED' || c.status === 'CONFIRMED') && (
                                                    <button
                                                        onClick={() => handleCancel(c._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Annuler
                                                    </button>
                                                )}
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
