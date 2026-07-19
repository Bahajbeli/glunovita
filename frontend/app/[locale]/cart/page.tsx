'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export default function CartPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadCart()
  }, [user])

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const updateCart = (newCart: any[]) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const updateQuantity = (itemId: string, change: number) => {
    const newCart = cart.map(item => {
      const currentId = item._cartId || item._id
      if (currentId === itemId) {
        const newQuantity = item.quantity + change
        if (newQuantity <= 0) return null
        if (newQuantity > item.stock) {
          toast.error('Stock insuffisant')
          return item
        }
        return { ...item, quantity: newQuantity }
      }
      return item
    }).filter(Boolean)
    
    updateCart(newCart)
  }

  const removeItem = (itemId: string) => {
    const newCart = cart.filter(item => (item._cartId || item._id) !== itemId)
    updateCart(newCart)
    toast.success('Produit retiré du panier')
  }

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.customPrice !== undefined ? item.customPrice : item.price;
      return total + (itemPrice * item.quantity);
    }, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Votre panier est vide')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item._id, // the base product ID for the DB
          quantity: item.quantity,
          price: item.customPrice !== undefined ? item.customPrice : item.price,
          customIngredients: item.customIngredients || undefined
        })),
        totalAmount: getTotal()
      }

      await api.post('/orders', orderData)
      toast.success('Commande passée avec succès!')
      updateCart([])
      router.push(`/dashboard/${user?.role.toLowerCase()}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la commande')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Glunovita</span>
            </Link>
            <Link
              href={`/dashboard/${user.role.toLowerCase()}`}
              className="text-gray-700 hover:text-teal-600"
            >
              Mon Espace
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft />
            <span>Continuer mes achats</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Mon Panier</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Votre panier est vide</p>
            <Link
              href="/"
              className="inline-block bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-4"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Sans image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    {item.brand && <p className="text-sm text-gray-500">{item.brand}</p>}
                    
                    {item.customIngredients && (
                      <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded w-fit">
                        <span className="font-medium text-gray-700 block mb-1">Recette personnalisée :</span>
                        {item.customIngredients.length === 0 ? 'Aucun ingrédient' : (
                          <ul className="list-disc list-inside">
                            {item.customIngredients.map((ci: any, idx: number) => (
                              <li key={idx}>{ci.name} <span className="text-gray-400">({ci.grammage}g)</span></li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    
                    <p className="text-teal-600 font-bold mt-2">
                      {(item.customPrice !== undefined ? item.customPrice : item.price).toFixed(3)} DT
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item._cartId || item._id, -1)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <FiMinus />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, 1)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item._cartId || item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <FiTrash2 />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-teal-600">
                      {getTotal().toFixed(2)} €
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : 'Commander'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
