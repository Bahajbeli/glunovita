'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface CustomIngredient {
  ingredient: string;
  name: string;
  grammage: number;
  price: number;
}

interface CartItem {
    id: string; // Unique cart item ID to distinguish customizations
    product: any;
    quantity: number;
    customIngredients?: CustomIngredient[];
    customPrice?: number;
}

interface CartContextType {
    items: CartItem[]
    addToCart: (product: any, quantity?: number, customizations?: { customIngredients: CustomIngredient[], customPrice: number }) => void
    removeFromCart: (cartItemId: string) => void
    updateQuantity: (cartItemId: string, quantity: number) => void
    clearCart: () => void
    cartTotal: number
    itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error('Failed to parse cart', e)
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    const addToCart = (product: any, quantity = 1, customizations?: { customIngredients: CustomIngredient[], customPrice: number }) => {
        setItems(current => {
            // Generate a unique ID for customized items to prevent merging
            const cartItemId = customizations ? `${product._id}-${Date.now()}` : product._id;
            
            const existing = current.find(item => item.id === cartItemId)
            if (existing) {
                if (existing.quantity + quantity > product.stock) {
                    toast.error('Stock insuffisant')
                    return current
                }
                toast.success('Quantité mise à jour')
                return current.map(item =>
                    item.id === cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }
            toast.success('Ajouté au panier')
            return [...current, { 
                id: cartItemId, 
                product, 
                quantity, 
                customIngredients: customizations?.customIngredients, 
                customPrice: customizations?.customPrice 
            }]
        })
    }

    const removeFromCart = (cartItemId: string) => {
        setItems(current => current.filter(item => item.id !== cartItemId))
        toast.success('Produit retiré')
    }

    const updateQuantity = (cartItemId: string, quantity: number) => {
        if (quantity < 1) return
        setItems(current => {
            return current.map(item => {
                if (item.id === cartItemId) {
                    if (quantity > item.product.stock) {
                        toast.error('Stock insuffisant')
                        return item
                    }
                    return { ...item, quantity }
                }
                return item
            })
        })
    }

    const clearCart = () => {
        setItems([])
        localStorage.removeItem('cart')
    }

    const cartTotal = items.reduce((total, item) => {
        const itemPrice = item.customPrice !== undefined ? item.customPrice : item.product.price;
        return total + (itemPrice * item.quantity);
    }, 0)
    const itemCount = items.reduce((count, item) => count + item.quantity, 0)

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
