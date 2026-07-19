'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import toast from 'react-hot-toast'
import GoogleButton from '@/components/ui/GoogleButton'
import { useTranslations } from 'next-intl'

export default function RegisterPage() {
  const t = useTranslations('Register')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'PATIENT',
    region: '',
    licenseNumber: '',
    dateOfBirth: '',
    phoneNumber: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, loginWithGoogle } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(formData)
      router.push('/login')
    } catch (err: any) {
      setError(err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('title')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-center mb-4">
            <GoogleButton
              isLoading={loading}
              text={t('googleButton')}
              onSuccess={async (token) => {
                try {
                  setLoading(true)
                  await loginWithGoogle(token)
                  toast.success(t('googleSuccess'))
                  const redirect = typeof window !== 'undefined' 
                    ? sessionStorage.getItem('loginRedirect') || '/'
                    : '/'
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('loginRedirect')
                  }
                  router.push(redirect)
                } catch (err: any) {
                  const errorMessage = err.response?.data?.message || err.message || t('googleError')
                  setError(errorMessage)
                  toast.error(errorMessage)
                } finally {
                  setLoading(false)
                }
              }}
              onError={() => {
                toast.error(t('googleFail'))
              }}
            />
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">{t('orContinue')}</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                {t('firstName')}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                {t('lastName')}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                {t('role')}
              </label>
              <select
                id="role"
                name="role"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="PATIENT">{t('patient')}</option>
                <option value="DOCTOR">{t('doctor')}</option>
                <option value="AUTHORITY">{t('authority')}</option>
                <option value="SECRETARY">{t('secretary')}</option>
              </select>
            </div>
            {(formData.role === 'DOCTOR' || formData.role === 'AUTHORITY') && (
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                  {t('region')}
                </label>
                <input
                  id="region"
                  name="region"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.region}
                  onChange={handleChange}
                />
              </div>
            )}
            {formData.role === 'DOCTOR' && (
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                  {t('licenseNumber')}
                </label>
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                />
              </div>
            )}
            {formData.role === 'PATIENT' && (
              <>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    {t('dateOfBirth')}
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    {t('phoneNumber')}
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? t('submitting') : t('submit')}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {t('hasAccount')}{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                {t('login')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
