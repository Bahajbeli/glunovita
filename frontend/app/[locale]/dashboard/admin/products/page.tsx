'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function AdminProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'FOOD',
    image: '',
    stock: '',
    brand: '',
    glutenFree: true,
    certification: 'NONE',
    ingredients: '',
    allergens: ''
  })

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/admin/all')
      setProducts(response.data.data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: formData.allergens.split(',').map(a => a.trim()).filter(a => a)
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productData)
      } else {
        await api.post('/products', productData)
      }

      setShowForm(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'FOOD',
        image: '',
        stock: '',
        brand: '',
        glutenFree: true,
        certification: 'NONE',
        ingredients: '',
        allergens: ''
      })
      fetchProducts()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save product')
    }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image || '',
      stock: product.stock.toString(),
      brand: product.brand || '',
      glutenFree: product.glutenFree,
      certification: product.certification,
      ingredients: product.ingredients?.join(', ') || '',
      allergens: product.allergens?.join(', ') || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      await api.delete(`/products/${id}`)
      fetchProducts()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete product')
    }
  }

  if (loading) {
    return <Layout><div className="text-center py-12">Chargement...</div></Layout>
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
          {!showForm && (
            <button
              onClick={() => {
                setShowForm(true)
                setEditingProduct(null)
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category: 'FOOD',
                  image: '',
                  stock: '',
                  brand: '',
                  glutenFree: true,
                  certification: 'NONE',
                  ingredients: '',
                  allergens: ''
                })
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Ajouter un Produit
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du Produit *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie *</label>
                  <select
                    name="category"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="FOOD">Aliment</option>
                    <option value="BEVERAGE">Boisson</option>
                    <option value="SNACK">Snack</option>
                    <option value="INGREDIENT">Ingrédient</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix (€) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    min="0"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.stock}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marque</label>
                  <input
                    type="text"
                    name="brand"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL de l'Image</label>
                  <input
                    type="url"
                    name="image"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.image}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Certification</label>
                  <select
                    name="certification"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.certification}
                    onChange={handleChange}
                  >
                    <option value="NONE">Aucune</option>
                    <option value="CERTIFIED">Certifié</option>
                    <option value="VERIFIED">Vérifié</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="glutenFree"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.glutenFree}
                    onChange={handleChange}
                  />
                  <label className="ml-2 block text-sm text-gray-700">Sans Gluten</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ingrédients (séparés par des virgules)</label>
                <textarea
                  name="ingredients"
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.ingredients}
                  onChange={handleChange}
                  placeholder="Farine de riz, Eau, Sel..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Allergènes (séparés par des virgules)</label>
                <textarea
                  name="allergens"
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.allergens}
                  onChange={handleChange}
                  placeholder="Peut contenir des traces de noix..."
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  {editingProduct ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingProduct(null)
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-12 w-12 object-cover rounded" />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Pas d'image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{product.name}</div>
                      {product.brand && <div className="text-sm text-gray-500">{product.brand}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.price.toFixed(2)} €</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary-600 hover:text-primary-800 text-sm"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
