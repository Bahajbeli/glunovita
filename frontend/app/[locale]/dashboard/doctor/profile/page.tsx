'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { FiUser, FiMapPin, FiClock, FiDollarSign, FiBook, FiAward, FiPlus, FiX } from 'react-icons/fi'

export default function DoctorProfilePage() {
  const { user, refreshUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    specialization: '',
    bio: '',
    yearsOfExperience: '',
    consultationFee: '',
    consultationDuration: '30',
    acceptsNewPatients: true,
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    languages: [] as string[],
    education: [] as Array<{ degree: string; institution: string; year: string }>,
    certifications: [] as Array<{ name: string; issuingOrganization: string; year: string }>
  })
  const [newLanguage, setNewLanguage] = useState('')
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' })
  const [newCertification, setNewCertification] = useState({ name: '', issuingOrganization: '', year: '' })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'DOCTOR') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    } else if (user) {
      loadProfile()
    }
  }, [user, authLoading, router])

  const loadProfile = () => {
    if (user) {
      setFormData({
        specialization: user.specialization || '',
        bio: user.profileQuestions?.bio || '',
        yearsOfExperience: user.profileQuestions?.yearsOfExperience?.toString() || '',
        consultationFee: user.profileQuestions?.consultationFee?.toString() || '',
        consultationDuration: user.profileQuestions?.consultationDuration?.toString() || '30',
        acceptsNewPatients: user.profileQuestions?.acceptsNewPatients ?? true,
        workingHours: {
          start: user.profileQuestions?.workingHours?.start || '09:00',
          end: user.profileQuestions?.workingHours?.end || '18:00'
        },
        languages: user.profileQuestions?.languages || [],
        education: (user.profileQuestions?.education || []).map((edu: any) => ({
          ...edu,
          year: edu.year ? String(edu.year) : ''
        })),
        certifications: (user.profileQuestions?.certifications || []).map((cert: any) => ({
          ...cert,
          year: cert.year ? String(cert.year) : ''
        }))
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const profileData = {
        specialization: formData.specialization,
        profileQuestions: {
          bio: formData.bio,
          yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
          consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : undefined,
          consultationDuration: parseInt(formData.consultationDuration),
          acceptsNewPatients: formData.acceptsNewPatients,
          workingHours: formData.workingHours,
          languages: formData.languages,
          education: formData.education.map(edu => ({
            degree: edu.degree,
            institution: edu.institution,
            year: edu.year ? parseInt(edu.year) : undefined
          })),
          certifications: formData.certifications.map(cert => ({
            name: cert.name,
            issuingOrganization: cert.issuingOrganization,
            year: cert.year ? parseInt(cert.year) : undefined
          }))
        }
      }

      await api.put(`/users/${user?._id}`, profileData)
      toast.success('Profil mis à jour avec succès')
      await refreshUser()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLanguage.trim()]
      })
      setNewLanguage('')
    }
  }

  const removeLanguage = (lang: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(l => l !== lang)
    })
  }

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setFormData({
        ...formData,
        education: [...formData.education, { ...newEducation }]
      })
      setNewEducation({ degree: '', institution: '', year: '' })
    }
  }

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    })
  }

  const addCertification = () => {
    if (newCertification.name && newCertification.issuingOrganization) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, { ...newCertification }]
      })
      setNewCertification({ name: '', issuingOrganization: '', year: '' })
    }
  }

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index)
    })
  }

  if (authLoading) {
    return <Layout><div className="flex justify-center py-12"><div className="spinner"></div></div></Layout>
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
            <p className="text-gray-600">Complétez votre profil pour être visible par les patients</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiUser className="w-5 h-5 mr-2 text-teal-600" />
                Informations Professionnelles
              </h2>
              
              <div className="space-y-4">
                <Input
                  label="Spécialisation"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Ex: Gastro-entérologue, Médecin généraliste..."
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biographie
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Décrivez votre parcours et votre expertise..."
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/1000 caractères</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Années d'expérience"
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  />

                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acceptsNewPatients}
                        onChange={(e) => setFormData({ ...formData, acceptsNewPatients: e.target.checked })}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Accepte les nouveaux patients</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Langues */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Langues parlées</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm flex items-center"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      className="ml-2 hover:text-red-600"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter une langue"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                />
                <Button type="button" onClick={addLanguage}>
                  <FiPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Formation */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiBook className="w-5 h-5 mr-2 text-teal-600" />
                Formation
              </h2>
              
              <div className="space-y-3 mb-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-gray-600">{edu.institution} {edu.year && `(${edu.year})`}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Diplôme"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                />
                <Input
                  placeholder="Établissement"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Année"
                    type="number"
                    value={newEducation.year}
                    onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                  />
                  <Button type="button" onClick={addEducation}>
                    <FiPlus />
                  </Button>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiAward className="w-5 h-5 mr-2 text-teal-600" />
                Certifications
              </h2>
              
              <div className="space-y-3 mb-4">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-gray-600">{cert.issuingOrganization} {cert.year && `(${cert.year})`}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Nom de la certification"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                />
                <Input
                  placeholder="Organisme émetteur"
                  value={newCertification.issuingOrganization}
                  onChange={(e) => setNewCertification({ ...newCertification, issuingOrganization: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Année"
                    type="number"
                    value={newCertification.year}
                    onChange={(e) => setNewCertification({ ...newCertification, year: e.target.value })}
                  />
                  <Button type="button" onClick={addCertification}>
                    <FiPlus />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tarifs et horaires */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiClock className="w-5 h-5 mr-2 text-teal-600" />
                Tarifs et Horaires
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiDollarSign className="w-4 h-4 mr-1" />
                    Tarif de consultation (TND)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée de consultation (minutes)
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={formData.consultationDuration}
                    onChange={(e) => setFormData({ ...formData, consultationDuration: e.target.value })}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure d'ouverture</label>
                  <Input
                    type="time"
                    value={formData.workingHours.start}
                    onChange={(e) => setFormData({
                      ...formData,
                      workingHours: { ...formData.workingHours, start: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure de fermeture</label>
                  <Input
                    type="time"
                    value={formData.workingHours.end}
                    onChange={(e) => setFormData({
                      ...formData,
                      workingHours: { ...formData.workingHours, end: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard/doctor')}
              >
                Annuler
              </Button>
              <Button type="submit" isLoading={loading}>
                Enregistrer le profil
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
