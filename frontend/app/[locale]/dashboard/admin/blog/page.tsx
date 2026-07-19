'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiCheck } from 'react-icons/fi'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import { FiUpload } from 'react-icons/fi'

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

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentPost, setCurrentPost] = useState<BlogPost | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        content: '',
        category: 'NEWS',
        image: '',
        images: [] as string[],
        video: '',
        isPublished: true
    })
    const [uploading, setUploading] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('image', file) // Using 'image' as the field name for both for simplicity on backend

        try {
            setUploading(true)
            const res = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            const fileUrl = res.data.url
            const isVideo = file.type.startsWith('video/')

            if (isVideo) {
                setFormData(prev => ({ ...prev, video: fileUrl }))
                toast.success('Vidéo téléchargée avec succès')
            } else {
                setFormData(prev => ({
                    ...prev,
                    image: prev.image || fileUrl,
                    images: [...prev.images, fileUrl]
                }))
                toast.success('Image téléchargée avec succès')
            }
        } catch (error) {
            toast.error('Erreur lors du téléchargement du fichier')
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setFormData(prev => {
            const newImages = [...prev.images]
            newImages.splice(index, 1)
            return {
                ...prev,
                images: newImages,
                // If we removed the main image, pick the first from the remaining or empty
                image: prev.image === prev.images[index] ? (newImages[0] || '') : prev.image
            }
        })
    }

    const fetchPosts = async () => {
        try {
            setLoading(true)
            const res = await api.get('/blog')
            setPosts(res.data.data)
        } catch (error) {
            toast.error('Erreur lors du chargement des articles')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (currentPost) {
                await api.put(`/blog/${currentPost._id}`, formData)
                toast.success('Article mis à jour')
            } else {
                await api.post('/blog', formData)
                toast.success('Article créé')
            }
            setIsModalOpen(false)
            fetchPosts()
        } catch (error) {
            toast.error('Une erreur est survenue')
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet article ?')) {
            try {
                await api.delete(`/blog/${id}`)
                toast.success('Article supprimé')
                fetchPosts()
            } catch (error) {
                toast.error('Erreur lors de la suppression')
            }
        }
    }

    const handleEdit = (post: BlogPost) => {
        setCurrentPost(post)
        setFormData({
            title: post.title,
            summary: post.summary,
            content: post.content,
            category: post.category,
            image: post.image,
            images: post.images || [],
            video: post.video || '',
            isPublished: post.isPublished
        })
        setIsModalOpen(true)
    }

    const openAddModal = () => {
        setCurrentPost(null)
        setFormData({
            title: '',
            summary: '',
            content: '',
            category: 'NEWS',
            image: '',
            images: [],
            video: '',
            isPublished: true
        })
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestion du Blog</h1>
                    <p className="text-gray-500">Créez et gérez les articles d'actualité et conseils santé</p>
                </div>
                <Button onClick={openAddModal}>
                    <FiPlus className="mr-2" /> Nouvel Article
                </Button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-700">Article</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Catégorie</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Statut</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Date</th>
                                <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-gray-400">Chargement des articles...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : posts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        Aucun article trouvé
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {post.image ? (
                                                        <img
                                                            src={post.image.startsWith('http') ? post.image : `${API_BASE_URL}${post.image}`}
                                                            className="w-full h-full object-cover"
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <FiEye />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 line-clamp-1">{post.title}</p>
                                                    <p className="text-sm text-gray-500 line-clamp-1">{post.summary}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold uppercase">
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {post.isPublished ? (
                                                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                                                    <FiCheck /> Publié
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">Brouillon</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(post)}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                >
                                                    <FiEdit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentPost ? 'Modifier l\'article' : 'Créer un article'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Titre de l'article"
                            required
                            value={formData.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Les bienfaits du régime sans gluten"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                            <select
                                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-primary-700"
                                value={formData.category}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="HEALTH">Santé</option>
                                <option value="NUTRITION">Nutrition</option>
                                <option value="LIFESTYLE">Mode de vie</option>
                                <option value="RECIPES">Recettes</option>
                                <option value="NEWS">Actualités</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700">Vidéo de l'article</label>
                        {formData.video ? (
                            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-md border border-gray-200 shadow-sm group">
                                <video
                                    src={formData.video.startsWith('http') ? formData.video : `${API_BASE_URL}${formData.video}`}
                                    className="w-full h-full"
                                    controls
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, video: '' })}
                                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'video/*';
                                        input.onchange = (e: any) => handleFileUpload(e);
                                        input.click();
                                    }}
                                    isLoading={uploading}
                                >
                                    <FiPlus className="mr-2" /> Télécharger une vidéo (MP4, WEBM)
                                </Button>
                                <div className="flex-1">
                                    <Input
                                        placeholder="Ou collez l'URL d'une vidéo (YouTube, etc...)"
                                        value={formData.video}
                                        onChange={(e: any) => setFormData({ ...formData, video: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-400 italic">La vidéo sera affichée en haut de l'article.</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700">Images de l'article</label>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            <AnimatePresence>
                                {formData.images.map((img, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="relative group aspect-square rounded-xl bg-gray-100 overflow-hidden border border-gray-200"
                                    >
                                        <img
                                            src={img.startsWith('http') ? img : `${API_BASE_URL}${img}`}
                                            className="w-full h-full object-cover"
                                            alt={`Image ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                        {formData.image === img && (
                                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                                                Principale
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: img })}
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="text-white text-xs font-bold">Définir comme principale</span>
                                        </button>
                                    </motion.div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('imageUpload')?.click()}
                                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                                >
                                    {uploading ? (
                                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <FiPlus className="w-8 h-8 text-gray-400 group-hover:text-primary-500" />
                                            <span className="text-xs text-gray-500 group-hover:text-primary-500 font-medium mt-2">Ajouter</span>
                                        </>
                                    )}
                                </button>
                            </AnimatePresence>
                        </div>

                        <input
                            type="file"
                            id="imageUpload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                        />

                        <div className="pt-2">
                            <Input
                                label="Ou collez l'URL d'une image externe"
                                placeholder="https://..."
                                onKeyDown={(e: any) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (e.target.value) {
                                            setFormData(prev => ({
                                                ...prev,
                                                images: [...prev.images, e.target.value],
                                                image: prev.image || e.target.value
                                            }));
                                            e.target.value = '';
                                        }
                                    }
                                }}
                            />
                            <p className="text-xs text-gray-400 mt-1">Appuyez sur Entrée pour ajouter l'URL</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900">Corps de l'article</h3>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Résumé</label>
                            <textarea
                                required
                                rows={3}
                                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-primary-700"
                                value={formData.summary}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, summary: e.target.value })}
                                placeholder="Bref résumé de l'article..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Contenu (HTML possible)</label>
                            <textarea
                                required
                                rows={8}
                                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-primary-700"
                                value={formData.content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Contenu détaillé de l'article..."
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPublished"
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                                checked={formData.isPublished}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isPublished: e.target.checked })}
                            />
                            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                                Publier l'article immédiatement
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="submit">
                            {currentPost ? 'Mettre à jour' : 'Créer l\'article'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div >
    )
}
