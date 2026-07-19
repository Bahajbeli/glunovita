'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/api'
import Cookies from 'js-cookie'

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'AUTHORITY' | 'SECRETARY'
  region?: string
  doctorId?: string
  specialization?: string
  address?: string
  location?: {
    lat: number
    lng: number
  }
  profileQuestions?: {
    bio?: string
    yearsOfExperience?: number
    languages?: string[]
    consultationFee?: number
    workingHours?: {
      start: string
      end: string
    }
    consultationDuration?: number
    acceptsNewPatients?: boolean
    education?: Array<{
      degree: string
      institution: string
      year?: number
    }>
    certifications?: Array<{
      name: string
      issuingOrganization: string
      year?: number
    }>
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (token: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = Cookies.get('accessToken')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me')
      setUser(response.data.data.user)
    } catch (error) {
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const { accessToken, refreshToken, user: userData } = response.data.data
    
    Cookies.set('accessToken', accessToken)
    Cookies.set('refreshToken', refreshToken)
    setUser(userData)
  }

  const loginWithGoogle = async (token: string) => {
    const response = await api.post('/auth/google', { token })
    const { accessToken, refreshToken, user: userData } = response.data.data
    
    Cookies.set('accessToken', accessToken)
    Cookies.set('refreshToken', refreshToken)
    setUser(userData)
  }

  const register = async (userData: any) => {
    const response = await api.post('/auth/register', userData)
    const { accessToken, refreshToken, user: newUser } = response.data.data
    
    Cookies.set('accessToken', accessToken)
    Cookies.set('refreshToken', refreshToken)
    setUser(newUser)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.data.user)
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
