'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { FiUserPlus, FiTrash2 } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'

export default function DoctorSecretariesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [secretaries, setSecretaries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })

  useEffect(() => {
    if (user && user.role !== 'DOCTOR') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchSecretaries()
    }
  }, [user])

  const fetchSecretaries = async () => {
    try {
      const response = await api.get('/secretaries')
      setSecretaries(response.data.data)
    } catch (error) {
      console.error('Error fetching secretaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/secretaries', formData)
      toast.success('Secrétaire ajouté avec succès')
      setShowModal(false)
      setFormData({ email: '', password: '', firstName: '', lastName: '' })
      fetchSecretaries()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout')
    }
  }

  const handleRemove = async (secretaryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce secrétaire ?')) return

    try {
      await api.delete(`/secretaries/${secretaryId}`)
      toast.success('Secrétaire supprimé')
      fetchSecretaries()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  if (loading) {
    return <Layout><div className="flex justify-center py-12"><div className="spinner"></div></div></Layout>
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mes Secrétaires</h1>
          <Button onClick={() => setShowModal(true)}>
            <FiUserPlus className="w-5 h-5 mr-2" />
            Ajouter un Secrétaire
          </Button>
        </div>

        {secretaries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FiUserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Aucun secrétaire ajouté</p>
            <Button onClick={() => setShowModal(true)}>
              Ajouter un secrétaire
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secretaries.map((secretary) => (
              <motion.div
                key={secretary._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {secretary.firstName[0]}{secretary.lastName[0]}
                  </div>
                  <button
                    onClick={() => handleRemove(secretary._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <h3 className="font-bold text-lg">
                  {secretary.firstName} {secretary.lastName}
                </h3>
                <p className="text-sm text-gray-600">{secretary.email}</p>
                <div className="mt-3">
                  <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                    Secrétaire
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Ajouter un Secrétaire">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Prénom"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              label="Nom"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Mot de passe"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <div className="flex space-x-2 pt-4">
              <Button type="submit" fullWidth>
                Créer
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setShowModal(false)}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
