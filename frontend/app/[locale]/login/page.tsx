'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import GoogleButton from '@/components/ui/GoogleButton'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { login, loginWithGoogle } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    // Get redirect parameter from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      if (redirect) {
        // Store redirect in sessionStorage for use after login
        sessionStorage.setItem('loginRedirect', redirect)
      }
    }
  }, [])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError(t('emailRequired'))
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError(t('emailInvalid'))
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError(t('passwordRequired'))
      return false
    }
    if (password.length < 6) {
      setPasswordError(t('passwordLength'))
      return false
    }
    setPasswordError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      toast.success(t('success'))
      // Get redirect from sessionStorage or default to home
      const redirect = typeof window !== 'undefined' 
        ? sessionStorage.getItem('loginRedirect') || '/'
        : '/'
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('loginRedirect')
      }
      router.push(redirect)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('error')
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center mb-4 shadow-glow"
            >
              <FiLock className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              {t('title')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('subtitle')}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-center mb-4">
              <GoogleButton
                isLoading={loading}
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

            <Input
              label={t('emailLabel')}
              type="email"
              required
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) validateEmail(e.target.value)
              }}
              onBlur={() => validateEmail(email)}
              error={emailError}
              icon={<FiMail className="w-5 h-5" />}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`appearance-none relative block w-full pl-10 pr-10 py-2.5 border ${
                    passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (passwordError) validatePassword(e.target.value)
                  }}
                  onBlur={() => validatePassword(password)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {passwordError}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              size="lg"
            >
              {t('submit')}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('noAccount')}{' '}
                <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  {t('createAccount')}
                </Link>
              </p>
            </div>
          </form>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-gray-500">
            {t('securePlatform')}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
