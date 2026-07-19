'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiShoppingCart, FiSearch, FiUser, FiHeart } from 'react-icons/fi'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import RecipeCustomizer from '@/components/RecipeCustomizer'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('HomePage')
  const tNav = useTranslations('Navigation')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [cart, setCart] = useState<any[]>([])
  const [blogs, setBlogs] = useState<any[]>([])
  const [loadingBlogs, setLoadingBlogs] = useState(true)

  useEffect(() => {
    fetchProducts()
    if (user) {
      loadCart()
    }
  }, [selectedCategory, searchTerm, user])

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoadingBlogs(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/blogs?publishedOnly=true`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setBlogs(data.data || [])
      } else {
        setBlogs([])
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
      setBlogs([])
    } finally {
      setLoadingBlogs(false)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (searchTerm) params.append('search', searchTerm)

      // Products are now public, no authentication required
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?${params.toString()}`, { 
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data.products || [])
      } else {
        console.error('Error fetching products:', response.status)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const [customizingProduct, setCustomizingProduct] = useState<any>(null)

  const addToCart = (product: any, customizedData?: any) => {
    if (!user) {
      toast.error(t('messages.loginToOrder'))
      router.push('/login?redirect=/')
      return
    }

    if (product.isRecipe && !customizedData) {
      // Open modal instead of adding directly
      setCustomizingProduct(product)
      return
    }

    const itemToAdd = customizedData || product
    // For normal products we use _id. For customized, we use _cartId.
    const itemId = itemToAdd._cartId || itemToAdd._id

    // Check if it exists exactly (same _id or same _cartId)
    const existingItem = cart.find(item => (item._cartId || item._id) === itemId)
    let newCart

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1
      if (newQuantity > itemToAdd.stock) {
        toast.error(t('messages.insufficientStock'))
        return
      }
      newCart = cart.map(item =>
        (item._cartId || item._id) === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    } else {
      if (itemToAdd.stock < 1) {
        toast.error(t('messages.outOfStockAlert'))
        return
      }
      newCart = [...cart, { ...itemToAdd, quantity: 1 }]
    }

    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    setCustomizingProduct(null)
    toast.success(t('messages.addedToCart'))
  }

  const getCartCount = () => {
    if (!user) return 0
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const categories = [
    { id: '', label: t('categories.all') },
    { id: 'FOOD', label: t('categories.food') },
    { id: 'BEVERAGE', label: t('categories.beverage') },
    { id: 'SNACK', label: t('categories.snack') },
    { id: 'INGREDIENT', label: t('categories.ingredient') },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Glunovita</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-teal-600 font-medium">
                {tNav('home')}
              </Link>
              <Link href="/#produits" className="text-gray-700 hover:text-teal-600 font-medium">
                {tNav('shop')}
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-teal-600 font-medium">
                Blog
              </Link>
              <Link href="#apropos" className="text-gray-700 hover:text-teal-600 font-medium">
                {tNav('about')}
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-teal-600 font-medium">
                {tNav('contact')}
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              
              {user && (
                <Link href="/cart" className="relative p-2 text-gray-700 hover:text-teal-600">
                  <FiShoppingCart className="w-6 h-6" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartCount()}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <Link
                  href={`/dashboard/${user.role.toLowerCase()}`}
                  className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all"
                >
                  <FiUser className="w-5 h-5" />
                  <span>{tNav('mySpace')}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all"
                >
                  <FiUser className="w-5 h-5" />
                  <span>{tNav('login')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="relative h-64 bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 p-8 flex flex-col justify-center">
                <span className="inline-block bg-yellow-300 text-orange-800 px-3 py-1 rounded-full text-sm font-bold mb-2 w-fit">
                  {t('hero.newCollection')}
                </span>
                <h2 className="text-4xl font-bold text-white mb-2">
                  {t('hero.title')}
                </h2>
                <p className="text-white text-lg mb-4">{t('hero.promotions')}</p>
                <button 
                  onClick={() => {
                    if (!user) {
                      toast.error(t('messages.loginToOrder'))
                      router.push('/login?redirect=/')
                    } else {
                      document.getElementById('produits')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="bg-white text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors w-fit"
                >
                  {user ? t('hero.shopNow') : t('hero.loginToShop')}
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-30 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-1">{t('hero.special')}</h3>
              <p className="text-4xl font-bold">-20%</p>
            </div>
            <div className="h-30 bg-gradient-to-r from-teal-700 to-teal-800 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">{t('hero.flashSale')}</h3>
              <p className="text-sm mb-2">{t('hero.limitedOffers')}</p>
              <p className="text-3xl font-bold">-50% OFF</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="produits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500 text-2xl">⭐</span>
            <h2 className="text-3xl font-bold text-gray-900">{t('products.title')}</h2>
          </div>
          <span className="text-gray-500">{products.length} {products.length > 1 ? t('products.resultsPlural') : t('products.results')}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">
              {t('products.noProducts')}
            </p>
            {searchTerm && (
              <p className="text-gray-400 text-sm mt-2">
                {t('products.tryDifferentSearch')}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">{t('products.noImage')}</span>
                    </div>
                  )}
                  {product.certification !== 'NONE' && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {product.certification === 'CERTIFIED' ? t('products.certified') : t('products.verified')}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                  {product.brand && (
                    <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-teal-600">
                      {product.price.toFixed(2)} €
                    </span>
                    {!user ? (
                      <button
                        onClick={() => {
                          toast.error(t('messages.loginToOrder'))
                          router.push('/login?redirect=/')
                        }}
                        className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center gap-2"
                        title={t('messages.loginToOrder')}
                      >
                        <FiUser className="w-4 h-4" />
                        {tNav('login')}
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                          product.stock > 0
                            ? 'bg-teal-500 text-white hover:bg-teal-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <FiShoppingCart className="w-4 h-4" />
                        {product.stock > 0 ? t('products.add') : t('products.outOfStock')}
                      </button>
                    )}
                  </div>
                  
                  {product.stock > 0 && product.stock < 10 && (
                    <p className="text-xs text-orange-600 mt-2 text-center">
                      ⚠️ {t('products.lowStock', { stock: product.stock })}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Blog Section */}
      <div className="bg-white py-16 mt-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-teal-500 text-2xl">📝</span>
              <h2 className="text-3xl font-bold text-gray-900">{t('blog.latestArticles') || 'Derniers Articles'}</h2>
            </div>
            <Link href="/blog" className="text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1 transition-colors">
              {t('blog.viewAll') || 'Voir tout'} &rarr;
            </Link>
          </div>

          {loadingBlogs ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-lg">Aucun article pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.slice(0, 3).map((blog) => (
                <motion.div
                  key={blog._id}
                  whileHover={{ y: -8 }}
                  className="bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col border border-gray-100"
                >
                  <div className="relative h-48 overflow-hidden group">
                    {blog.image ? (
                      <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <span className="text-teal-300 text-4xl">📰</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur text-teal-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {blog.category || 'Article'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                      {blog.author && <span>• {blog.author.firstName} {blog.author.lastName}</span>}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight hover:text-teal-600 transition-colors">
                      <Link href={`/blog/${blog._id}`}>{blog.title}</Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">{blog.summary}</p>
                    <Link
                      href={`/blog/${blog._id}`}
                      className="inline-flex items-center justify-center w-full bg-white border-2 border-teal-500 text-teal-600 px-4 py-2 rounded-xl font-medium hover:bg-teal-50 transition-colors mt-auto"
                    >
                      Lire la suite
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Glunovita</h3>
            <p className="text-gray-400">{t('footer.subtitle')}</p>
            <p className="text-gray-500 text-sm mt-4">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {customizingProduct && (
        <RecipeCustomizer 
          product={customizingProduct} 
          onClose={() => setCustomizingProduct(null)} 
          onConfirm={(customizedProduct) => addToCart(customizingProduct, customizedProduct)} 
        />
      )}
    </div>
  )
}
