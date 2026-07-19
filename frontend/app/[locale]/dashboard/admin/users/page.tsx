'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { FiSearch, FiFilter, FiUserX, FiUserCheck, FiUsers } from 'react-icons/fi'

export default function AdminUsersPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        role: '',
        search: '',
        isActive: ''
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        } else if (user && user.role !== 'ADMIN') {
            router.push(`/dashboard/${user.role.toLowerCase()}`)
        }
    }, [user, authLoading, router])

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams()
            if (filters.role) params.append('role', filters.role)
            if (filters.search) params.append('search', filters.search)
            if (filters.isActive) params.append('isActive', filters.isActive)
            params.append('page', pagination.page.toString())
            params.append('limit', pagination.limit.toString())

            const response = await api.get(`/users?${params.toString()}`)
            setUsers(response.data.data.users)
            setPagination(response.data.data.pagination)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            const timer = setTimeout(() => {
                fetchUsers()
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [user, filters, pagination.page])

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                await api.patch(`/users/${userId}/deactivate`)
            } else {
                await api.put(`/users/${userId}`, { isActive: true })
            }
            fetchUsers()
        } catch (error: any) {
            console.error('Failed to update user status:', error)
            alert(error.response?.data?.message || 'Failed to update user status')
        }
    }

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    if (authLoading || (loading && pagination.page === 1)) {
        return (
            <Layout>
                <div className="flex h-96 items-center justify-center">
                    <div className="spinner"></div>
                </div>
            </Layout>
        )
    }

    if (!user || user.role !== 'ADMIN') {
        return null
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gestion des Utilisateurs</h1>
                        <p className="mt-2 text-sm text-gray-500">Gérez les comptes, les rôles et l'accès à la plateforme.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-5 rounded-2xl shadow-sm mb-8 border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Rechercher par nom ou email..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                            value={filters.search}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, search: e.target.value }))
                                setPagination(prev => ({ ...prev, page: 1 }))
                            }}
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1">
                            <FiFilter className="text-gray-400 w-4 h-4" />
                            <select
                                name="role"
                                className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none py-2"
                                value={filters.role}
                                onChange={handleFilterChange}
                            >
                                <option value="">Tous les Rôles</option>
                                <option value="PATIENT">Patients</option>
                                <option value="DOCTOR">Médecins</option>
                                <option value="ADMIN">Administrateurs</option>
                                <option value="AUTHORITY">Autorités</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1">
                            <select
                                name="isActive"
                                className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none py-2"
                                value={filters.isActive}
                                onChange={handleFilterChange}
                            >
                                <option value="">Tous les Statuts</option>
                                <option value="true">Actifs</option>
                                <option value="false">Inactifs</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Utilisateur</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Rôle</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Région</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <FiUsers className="w-8 h-8 text-gray-200" />
                                                </div>
                                                <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-11 w-11 flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                                                        {u.firstName?.[0]}{u.lastName?.[0]}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{u.firstName} {u.lastName}</div>
                                                        <div className="text-xs text-gray-400">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                        u.role === 'DOCTOR' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            u.role === 'AUTHORITY' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                                'bg-green-50 text-green-600 border-green-100'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                {u.region || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${u.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                    {u.isActive ? 'Actif' : 'Bloqué'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleToggleStatus(u._id, u.isActive)}
                                                    className={`p-2.5 rounded-xl transition-all ${u.isActive
                                                            ? 'text-red-500 hover:bg-red-50 hover:shadow-sm'
                                                            : 'text-green-500 hover:bg-green-50 hover:shadow-sm'
                                                        }`}
                                                    title={u.isActive ? 'Suspendre le compte' : 'Activer le compte'}
                                                >
                                                    {u.isActive ? <FiUserX className="w-5 h-5" /> : <FiUserCheck className="w-5 h-5" />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            Page {pagination.page} / {pagination.pages}
                        </p>
                        <div className="flex gap-3">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                className="px-6 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Précédent
                            </button>
                            <button
                                disabled={pagination.page === pagination.pages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                className="px-6 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}
