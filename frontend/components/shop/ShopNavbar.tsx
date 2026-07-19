'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { FiHeart, FiShoppingCart, FiUser, FiLogIn } from 'react-icons/fi'

interface ShopNavbarProps {
    scrolled: boolean
    onCartOpen: () => void
}

export default function ShopNavbar({ scrolled, onCartOpen }: ShopNavbarProps) {
    const { user } = useAuth()
    const { itemCount } = useCart()
    const router = useRouter()

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-white/50 backdrop-blur-sm py-5'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-gray-100">
                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">
                        Glunovita
                    </span>
                </div>

                <div className="hidden md:flex items-center space-x-10">
                    <a href="/" className="font-semibold text-gray-700 hover:text-[#10b981] transition-colors">Accueil</a>
                    <a href="/dashboard/shop" className="font-semibold text-gray-700 hover:text-[#10b981] transition-colors">Boutique</a>
                    <a href="/blog" className="font-semibold text-gray-700 hover:text-[#10b981] transition-colors">Blog</a>
                    <a href="/about" className="font-semibold text-gray-700 hover:text-[#10b981] transition-colors">À Propos</a>
                    <a href="#" className="font-semibold text-gray-700 hover:text-[#10b981] transition-colors">Contact</a>
                </div>

                <div className="flex items-center gap-5">
                    <button
                        onClick={onCartOpen}
                        className="relative p-2.5 hover:bg-gray-100 rounded-full transition-colors group"
                    >
                        <FiShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-[#10b981]" />
                        {itemCount > 0 && (
                            <span className="absolute top-1 right-1 bg-[#10b981] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                                {itemCount}
                            </span>
                        )}
                    </button>

                    {user ? (
                        <button
                            onClick={() => router.push(`/dashboard/${user.role.toLowerCase()}`)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#10b981] text-white rounded-2xl font-bold shadow-md hover:bg-[#059669] transition-all"
                        >
                            <FiUser /> {user.firstName}
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push('/login')}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-900 border border-gray-100 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all group"
                        >
                            <FiLogIn className="transition-transform group-hover:translate-x-1" /> Se Connecter
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}
