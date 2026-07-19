'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiArrowRight } from 'react-icons/fi'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
    const { user } = useAuth()
    const router = useRouter()
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    const handleCheckout = async () => {
        if (!user) {
            toast.error('Veuillez vous connecter pour commander')
            router.push('/login')
            return
        }

        if (items.length === 0) return

        setIsCheckingOut(true)
        try {
            // Create order
            await api.post('/orders', {
                items: items.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity
                })),
                shippingAddress: {
                    street: '123 Main St', // Placeholder - should ideally be a form
                    city: 'Tunis',
                    country: 'Tunisie'
                }
            })

            toast.success('Commande effectuée avec succès !')
            clearCart()
            onClose()
            // Redirect to orders page if it exists, or stay
            if (user.role === 'PATIENT') {
                router.push('/dashboard/patient/orders') // Need to create this page potentially
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Erreur lors de la commande')
        } finally {
            setIsCheckingOut(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FiShoppingBag /> Mon Panier ({items.length})
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="text-center py-20 text-gray-500">
                                    <FiShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p>Votre panier est vide</p>
                                    <button
                                        onClick={onClose}
                                        className="mt-4 text-primary-600 font-medium hover:underline"
                                    >
                                        Continuer mes achats
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.product._id} className="flex gap-4">
                                        <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.product.image ? (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <FiShoppingBag />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                                            <p className="text-gray-500 text-sm mb-2">{item.product.price.toFixed(2)} €</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                        className="p-1 hover:bg-gray-100"
                                                    >
                                                        <FiMinus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                        className="p-1 hover:bg-gray-100"
                                                    >
                                                        <FiPlus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.product._id)}
                                                    className="text-red-500 p-2 hover:bg-red-50 rounded-full ml-auto"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="p-6 border-t bg-gray-50">
                                <div className="flex justify-between items-center mb-4 text-lg font-bold">
                                    <span>Total</span>
                                    <span>{cartTotal.toFixed(2)} €</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isCheckingOut ? (
                                        <div className="spinner w-6 h-6 border-white/30 border-t-white" />
                                    ) : (
                                        <>
                                            Commander <FiArrowRight />
                                        </>
                                    )}
                                </button>
                                {!user && (
                                    <p className="text-xs text-red-500 text-center mt-2">Vous devez être connecté pour commander</p>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
