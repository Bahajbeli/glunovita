'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { FiFileText, FiTrash2, FiPlus, FiEdit2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Ingredient {
  _id: string;
  name: string;
  category: string;
  grammage: number;
  price: number;
  description?: string;
}

export default function AdminIngredients() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: 'AUTRE',
    grammage: '',
    price: '',
    description: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'ADMIN') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    } else if (user) {
      fetchIngredients()
    }
  }, [user, authLoading, router])

  const fetchIngredients = async () => {
    try {
      const res = await api.get('/ingredients')
      setIngredients(res.data.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des ingrédients')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (ing: Ingredient) => {
    setEditingId(ing._id)
    setFormData({
      name: ing.name,
      category: ing.category,
      grammage: ing.grammage.toString(),
      price: ing.price.toString(),
      description: ing.description || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        grammage: parseFloat(formData.grammage),
        price: parseFloat(formData.price)
      }
      if (editingId) {
        await api.put(`/ingredients/${editingId}`, payload)
        toast.success('Ingrédient mis à jour')
      } else {
        await api.post('/ingredients', payload)
        toast.success('Ingrédient ajouté avec succès')
      }
      setEditingId(null)
      setFormData({ name: '', category: 'AUTRE', grammage: '', price: '', description: '' })
      fetchIngredients()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet ingrédient ?')) {
      try {
        await api.delete(`/ingredients/${id}`)
        toast.success('Supprimé avec succès')
        fetchIngredients()
      } catch (error) {
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  if (authLoading || loading) return <Layout><div className="flex justify-center p-8"><div className="spinner"></div></div></Layout>
  if (!user || user.role !== 'ADMIN') return null

  return (
    <Layout>
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <FiFileText className="text-primary-600" />
          Gestion des Ingrédients
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Form */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-2xl h-fit">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Modifier l\'ingrédient' : 'Ajouter un Ingrédient'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="ex: Farine d'amande" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie *</label>
                <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="FARINE">Farines & Fécules</option>
                  <option value="CEREALE">Céréales & Graines</option>
                  <option value="EPICE">Épices & Arômes</option>
                  <option value="LAITIER">Produits Laitiers</option>
                  <option value="FRUIT_SEC">Fruits Secs</option>
                  <option value="ADDITIF">Additifs & Levures</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Grammage (g) *</label>
                  <input required type="number" min="1" step="1" className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={formData.grammage} onChange={e => setFormData({...formData, grammage: e.target.value})} placeholder="ex: 1000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix (DT) *</label>
                  <input required type="number" min="0" step="0.01" className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="ex: 15.50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optionnelle)</label>
                <textarea className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition flex justify-center items-center gap-2 font-medium">
                  {editingId ? <FiEdit2 /> : <FiPlus />}
                  {editingId ? 'Enregistrer' : 'Ajouter'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => {
                    setEditingId(null)
                    setFormData({ name: '', category: 'AUTRE', grammage: '', price: '', description: '' })
                  }} className="bg-slate-200 text-slate-700 p-2 rounded-lg hover:bg-slate-300 transition font-medium">
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl overflow-hidden h-fit">
            <h2 className="text-lg font-semibold mb-4">Base d'Ingrédients ({ingredients.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-sm font-medium text-slate-600">Nom & Catégorie</th>
                    <th className="p-3 text-sm font-medium text-slate-600">Grammage</th>
                    <th className="p-3 text-sm font-medium text-slate-600">Prix</th>
                    <th className="p-3 text-sm font-medium text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ingredients.map(ing => (
                    <tr key={ing._id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{ing.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{ing.category}</div>
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {ing.grammage} g
                      </td>
                      <td className="p-3 text-sm font-medium text-primary-600">
                        {ing.price.toFixed(3)} DT
                      </td>
                      <td className="p-3 text-right flex justify-end gap-2">
                        <button onClick={() => handleEdit(ing)} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition" title="Modifier">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(ing._id)} className="text-rose-500 hover:text-rose-700 p-2 bg-rose-50 rounded-lg hover:bg-rose-100 transition" title="Supprimer">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ingredients.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">Aucun ingrédient ajouté pour le moment.</td>
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
