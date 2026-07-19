'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { FiSearch, FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi'
import ShopNavbar from '@/components/shop/ShopNavbar'
import Link from 'next/link'

const API_BASE_URL = 'http://localhost:5000'

interface BlogPost {
    _id: string;
    title: string;
    summary: string;
    content: string;
    category: string;
    image: string;
    isPublished: boolean;
    author: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('ALL')
    const [scrolled, setScrolled] = useState(false)

    const fetchPosts = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (category !== 'ALL') params.append('category', category)
            if (search) params.append('search', search)
            params.append('publishedOnly', 'true')

            const res = await api.get(`/blog?${params.toString()}`)
            setPosts(res.data.data)
        } catch (error) {
            console.error('Error fetching blog posts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const timer = setTimeout(fetchPosts, 300)
        return () => clearTimeout(timer)
    }, [search, category])

    const categories = [
        { id: 'ALL', label: 'Tout' },
        { id: 'HEALTH', label: 'Santé' },
        { id: 'NUTRITION', label: 'Nutrition' },
        { id: 'LIFESTYLE', label: 'Vie' },
        { id: 'RECIPES', label: 'Recettes' },
        { id: 'NEWS', label: 'News' }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <ShopNavbar scrolled={scrolled} onCartOpen={() => { }} />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Blog & Conseils</h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            Retrouvez nos derniers articles, conseils nutritionnels et actualités pour mieux vivre avec la maladie cœliaque.
                        </p>
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center justify-between sticky top-24 z-40">
                        <div className="relative flex-1 w-full md:max-w-xl">
                            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher un article..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/30 transition-all text-primary-700"
                            />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`px-6 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${category === cat.id
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-gray-50 animate-pulse h-96">
                                    <div className="bg-gray-200 h-48 rounded-2xl mb-4"></div>
                                    <div className="space-y-3">
                                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    </div>
                                </div>
                            ))
                        ) : posts.length === 0 ? (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-2xl text-gray-400 font-bold">Aucun article trouvé</p>
                                <button onClick={() => { setSearch(''); setCategory('ALL') }} className="mt-4 text-primary-600 font-bold hover:underline">Voir tous les articles</button>
                            </div>
                        ) : (
                            posts.map((post, idx) => (
                                <motion.article
                                    key={post._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl transition-all duration-500 group border border-gray-50 flex flex-col h-full"
                                >
                                    <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-6 flex-shrink-0">
                                        {post.image ? (
                                            <img
                                                src={post.image.startsWith('http') ? post.image : `${API_BASE_URL}${post.image}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                alt={post.title}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary-50 flex items-center justify-center text-primary-600 text-4xl font-black">
                                                {post.category[0]}
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-4 py-1.5 bg-white/90 backdrop-blur text-primary-600 rounded-full text-xs font-black shadow-sm">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col px-2">
                                        <div className="flex items-center gap-4 text-xs text-gray-400 font-bold mb-4 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><FiCalendar /> {new Date(post.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><FiUser /> {post.author?.firstName}</span>
                                        </div>
                                        <h2 className="text-2xl font-extrabold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-500 mb-6 line-clamp-3 font-medium">
                                            {post.summary}
                                        </p>
                                        <Link
                                            href={`/blog/${post._id}`}
                                            className="mt-auto inline-flex items-center gap-2 font-black text-gray-900 hover:text-primary-600 transition-colors group/link"
                                        >
                                            Lire la suite <FiArrowRight className="transition-transform group-hover/link:translate-x-1" />
                                        </Link>
                                    </div>
                                </motion.article>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
