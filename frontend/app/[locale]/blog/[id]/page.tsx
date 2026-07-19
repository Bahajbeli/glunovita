'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { FiCalendar, FiUser, FiChevronLeft, FiShare2 } from 'react-icons/fi'
import ShopNavbar from '@/components/shop/ShopNavbar'

const API_BASE_URL = 'http://localhost:5000'

interface BlogPost {
    _id: string;
    title: string;
    summary: string;
    content: string;
    category: string;
    image: string;
    images: string[];
    video: string;
    isPublished: boolean;
    author: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

export default function BlogDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [post, setPost] = useState<BlogPost | null>(null)
    const [loading, setLoading] = useState(true)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/blog/${id}`)
                setPost(res.data.data)
            } catch (error) {
                console.error('Error fetching post:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPost()

        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [id])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    if (!post) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
                <button onClick={() => router.push('/blog')} className="text-primary-600 font-bold hover:underline">Retour au blog</button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-white">
            <ShopNavbar scrolled={scrolled} onCartOpen={() => { }} />

            <main className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    <button
                        onClick={() => router.push('/blog')}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors font-bold mb-8 group"
                    >
                        <FiChevronLeft className="transition-transform group-hover:-translate-x-1" /> Retour au blog
                    </button>

                    <header className="space-y-8 mb-12">
                        <div className="space-y-4">
                            <span className="px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-black uppercase">
                                {post.category}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
                                {post.title}
                            </h1>
                        </div>

                        <div className="flex items-center justify-between border-y border-gray-100 py-6">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                                        {post.author?.firstName[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{post.author?.firstName} {post.author?.lastName}</p>
                                        <p className="text-xs text-gray-500">Auteur</p>
                                    </div>
                                </div>
                                <div className="h-10 w-px bg-gray-100 hidden sm:block"></div>
                                <div className="text-gray-500 text-sm hidden sm:block">
                                    <p className="flex items-center gap-2 font-medium"><FiCalendar /> {new Date(post.createdAt).toLocaleDateString()}</p>
                                    <p className="font-medium">5 min de lecture</p>
                                </div>
                            </div>

                            <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-gray-600 group">
                                <FiShare2 className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </header>

                    {post.video ? (
                        <div className="w-full aspect-video rounded-[3rem] overflow-hidden mb-12 shadow-2xl bg-black">
                            {post.video.includes('youtube.com') || post.video.includes('youtu.be') ? (
                                <iframe
                                    className="w-full h-full"
                                    src={post.video.replace('watch?v=', 'embed/')}
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    src={post.video.startsWith('http') ? post.video : `${API_BASE_URL}${post.video}`}
                                    className="w-full h-full"
                                    controls
                                />
                            )}
                        </div>
                    ) : post.image && (
                        <div className="w-full aspect-video rounded-[3rem] overflow-hidden mb-12 shadow-2xl group relative">
                            <img
                                src={post.image.startsWith('http') ? post.image : `${API_BASE_URL}${post.image}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt={post.title}
                            />
                        </div>
                    )}

                    <div
                        className="prose prose-lg max-w-none prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {post.images && post.images.filter(img => img !== post.image).length > 0 && (
                        <div className="mt-16 space-y-8">
                            <h2 className="text-3xl font-black text-gray-900 border-l-4 border-primary-500 pl-6">Galerie Photos</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {post.images.filter(img => img !== post.image).map((img, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl group cursor-pointer"
                                    >
                                        <img
                                            src={img.startsWith('http') ? img : `${API_BASE_URL}${img}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            alt={`Image ${index + 2}`}
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-16 pt-8 border-t border-gray-100">
                        <div className="bg-primary-50 rounded-3xl p-8 md:p-12 text-center space-y-6">
                            <h3 className="text-2xl md:text-3xl font-black text-gray-900">Vous avez aimé cet article ?</h3>
                            <p className="text-gray-600 font-medium max-w-xl mx-auto text-lg">Inscrivez-vous à notre newsletter pour recevoir nos derniers articles et conseils santé directement dans votre boîte mail.</p>
                            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                                <input type="email" placeholder="votre@email.com" className="flex-1 px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm" />
                                <button className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all">S'inscrire</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
