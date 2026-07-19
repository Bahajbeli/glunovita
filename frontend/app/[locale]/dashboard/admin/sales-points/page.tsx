'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { FiMapPin, FiTrash2, FiPlus, FiEdit2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import LocationPicker from '@/components/LocationPicker'

interface SalesPoint {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pointType?: string;
  phone?: string;
  description?: string;
}

export default function AdminSalesPoints() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [points, setPoints] = useState<SalesPoint[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    pointType: 'STORE',
    latitude: '',
    longitude: '',
    description: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'ADMIN') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    } else if (user) {
      fetchPoints()
    }
  }, [user, authLoading, router])

  const fetchPoints = async () => {
    try {
      const res = await api.get('/sales-points/admin')
      setPoints(res.data.data)
    } catch (error) {
      toast.error('Failed to load sales points')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }))
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }))
        toast.success('Adresse récupérée automatiquement !')
      }
    } catch (error) {
      console.error('Geocoding error', error)
      toast.error('Impossible de récupérer l\'adresse')
    }
  }

  const handleEdit = (point: SalesPoint) => {
    setEditingId(point._id)
    setFormData({
      name: point.name,
      address: point.address,
      pointType: point.pointType || 'STORE',
      latitude: point.latitude.toString(),
      longitude: point.longitude.toString(),
      description: point.description || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      }
      if (editingId) {
        await api.put(`/sales-points/${editingId}`, payload)
        toast.success('Point mis à jour avec succès')
      } else {
        await api.post('/sales-points', payload)
        toast.success('Point ajouté avec succès')
      }
      setEditingId(null)
      setFormData({ name: '', address: '', pointType: 'STORE', latitude: '', longitude: '', description: '' })
      fetchPoints()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this point?')) {
      try {
        await api.delete(`/sales-points/${id}`)
        toast.success('Deleted successfully')
        fetchPoints()
      } catch (error) {
        toast.error('Failed to delete')
      }
    }
  }

  if (authLoading || loading) return <Layout><div className="flex justify-center p-8"><div className="spinner"></div></div></Layout>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <Layout>
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <FiMapPin className="text-primary-600" />
          Manage Sales Points
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Form */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-2xl h-fit">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Modifier le point' : 'Ajouter un point'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type d'icône *</label>
                <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={formData.pointType} onChange={e => setFormData({...formData, pointType: e.target.value})}>
                  <option value="STORE">Boutique (Shopping Bag)</option>
                  <option value="PHARMACY">Pharmacie (Croix)</option>
                  <option value="RESTAURANT">Restaurant / Café (Tasse)</option>
                  <option value="DEFAULT">Autre (Point standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Position sur la carte * (Cliquez pour placer le point)
                </label>
                <LocationPicker 
                  onLocationSelect={handleLocationSelect}
                  initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
                  initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
                  pointType={formData.pointType}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 text-slate-400">Latitude</label>
                  <input required readOnly type="text" className="w-full p-2 border rounded-lg bg-slate-50 text-slate-500" value={formData.latitude} placeholder="Automatique" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 text-slate-400">Longitude</label>
                  <input required readOnly type="text" className="w-full p-2 border rounded-lg bg-slate-50 text-slate-500" value={formData.longitude} placeholder="Automatique" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition flex justify-center items-center gap-2 font-medium">
                  {editingId ? <FiEdit2 /> : <FiPlus />}
                  {editingId ? 'Enregistrer' : 'Ajouter'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => {
                    setEditingId(null)
                    setFormData({ name: '', address: '', pointType: 'STORE', latitude: '', longitude: '', description: '' })
                  }} className="bg-slate-200 text-slate-700 p-2 rounded-lg hover:bg-slate-300 transition font-medium">
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl overflow-hidden h-fit">
            <h2 className="text-lg font-semibold mb-4">Existing Points ({points.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-sm font-medium text-slate-600">Name</th>
                    <th className="p-3 text-sm font-medium text-slate-600">Address</th>
                    <th className="p-3 text-sm font-medium text-slate-600">Coordinates</th>
                    <th className="p-3 text-sm font-medium text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {points.map(point => (
                    <tr key={point._id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{point.name}</div>
                        <div className="text-xs text-slate-500">{point.phone}</div>
                      </td>
                      <td className="p-3 text-sm text-slate-600">{point.address}</td>
                      <td className="p-3 text-sm text-slate-500 font-mono">
                        {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                      </td>
                      <td className="p-3 text-right flex justify-end gap-2">
                        <button onClick={() => handleEdit(point)} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition" title="Modifier">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(point._id)} className="text-rose-500 hover:text-rose-700 p-2 bg-rose-50 rounded-lg hover:bg-rose-100 transition" title="Supprimer">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {points.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">No sales points added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
