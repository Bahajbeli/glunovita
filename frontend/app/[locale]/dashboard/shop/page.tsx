'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function ShopPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: ''
  })
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user, filters])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.search) params.append('search', filters.search)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)

      const response = await api.get(`/products?${params.toString()}`)
      setProducts(response.data.data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const categoryLabels: { [key: string]: string } = {
    FOOD: 'Aliment',
    BEVERAGE: 'Boisson',
    SNACK: 'Snack',
    INGREDIENT: 'Ingrédient',
    OTHER: 'Autre'
  }

  if (authLoading || loading) {
    return <Layout><div className="text-center py-12">Chargement...</div></Layout>
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Boutique Produits Sans Gluten</h1>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <input
                type="text"
                name="search"
                placeholder="Rechercher un produit..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                name="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">Toutes les catégories</option>
                <option value="FOOD">Aliment</option>
                <option value="BEVERAGE">Boisson</option>
                <option value="SNACK">Snack</option>
                <option value="INGREDIENT">Ingrédient</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix Min (€)</label>
              <input
                type="number"
                name="minPrice"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix Max (€)</label>
              <input
                type="number"
                name="maxPrice"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-400">Pas d'image</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    {product.certification !== 'NONE' && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        {product.certification === 'CERTIFIED' ? 'Certifié' : 'Vérifié'}
                      </span>
                    )}
                  </div>
                  {product.brand && (
                    <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary-600">{product.price.toFixed(2)} €</span>
                    <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">{categoryLabels[product.category]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {selectedProduct.image && (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedProduct.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold">Prix:</span> {selectedProduct.price.toFixed(2)} €
                  </div>
                  <div>
                    <span className="font-semibold">Stock:</span> {selectedProduct.stock}
                  </div>
                  <div>
                    <span className="font-semibold">Catégorie:</span> {categoryLabels[selectedProduct.category]}
                  </div>
                  {selectedProduct.brand && (
                    <div>
                      <span className="font-semibold">Marque:</span> {selectedProduct.brand}
                    </div>
                  )}
                </div>

                {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Ingrédients</h3>
                    <p className="text-gray-700">{selectedProduct.ingredients.join(', ')}</p>
                  </div>
                )}

                {selectedProduct.allergens && selectedProduct.allergens.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Allergènes</h3>
                    <p className="text-gray-700">{selectedProduct.allergens.join(', ')}</p>
                  </div>
                )}

                <div className="flex items-center space-x-4 pt-4 border-t">
                  <span className="text-2xl font-bold text-primary-600">{selectedProduct.price.toFixed(2)} €</span>
                  <button
                    disabled={selectedProduct.stock === 0}
                    className={`px-6 py-2 rounded-md font-medium ${
                      selectedProduct.stock > 0
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedProduct.stock > 0 ? 'Ajouter au Panier' : 'Rupture de Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
