'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FiHome, 
  FiFileText, 
  FiUsers, 
  FiShoppingBag, 
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiX,
  FiCalendar,
  FiUser,
  FiMapPin
} from 'react-icons/fi'
import { useState } from 'react'

import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'

export default function Layout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Layout')
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    return `/dashboard/${user.role.toLowerCase()}`
  }

  const navItems = [
    { href: getDashboardLink(), label: t('dashboard'), icon: FiHome },
    ...(user?.role === 'PATIENT' ? [
      { href: '/dashboard/patient/consultations/book', label: t('bookConsultation'), icon: FiCalendar },
      { href: '/dashboard/patient/declarations', label: t('myDeclarations'), icon: FiFileText },
      { href: '/dashboard/patient/medical-records', label: t('medicalRecords'), icon: FiFileText },
      { href: '/dashboard/patient/orders', label: t('myOrders'), icon: FiShoppingBag },
    ] : []),
    ...(user?.role === 'DOCTOR' ? [
      { href: '/dashboard/doctor/profile', label: t('myProfile'), icon: FiUser },
      { href: '/dashboard/doctor/location', label: t('myLocation'), icon: FiMapPin },
      { href: '/dashboard/doctor/appointments', label: t('consultations'), icon: FiUsers },
      { href: '/dashboard/doctor/secretaries', label: t('secretaries'), icon: FiUsers },
      { href: '/dashboard/doctor/medical-records', label: t('medicalRecords'), icon: FiFileText },
      { href: '/dashboard/doctor/orders', label: t('myOrders'), icon: FiShoppingBag },
    ] : []),
    ...(user?.role === 'SECRETARY' ? [
      { href: '/dashboard/secretary', label: t('consultations'), icon: FiUsers },
    ] : []),
    ...(user?.role === 'ADMIN' ? [
      { href: '/dashboard/admin/users', label: t('users'), icon: FiUsers },
      { href: '/dashboard/admin/declarations', label: t('declarations'), icon: FiFileText },
      { href: '/dashboard/admin/products', label: t('products'), icon: FiShoppingBag },
      { href: '/dashboard/admin/orders', label: t('orders'), icon: FiShoppingBag },
      { href: '/dashboard/admin/ingredients', label: t('ingredients'), icon: FiFileText },
      { href: '/dashboard/admin/recipes', label: t('recipes'), icon: FiFileText },
      { href: '/dashboard/admin/sales-points', label: t('salesPointsManagement'), icon: FiMapPin },
    ] : []),
    ...(user?.role === 'AUTHORITY' ? [
      { href: '/dashboard/authority/statistics', label: t('statistics'), icon: FiBarChart2 },
    ] : []),
    { href: '/sales-points', label: t('salesPoints'), icon: FiMapPin },
    { href: '/', label: t('shop'), icon: FiShoppingBag },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={getDashboardLink()} className="flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg"
                >
                  <span className="text-white font-bold text-xl">C</span>
                </motion.div>
                <span className="text-xl font-bold gradient-text hidden sm:block">
                  Celiac Platform
                </span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ms-10 md:flex md:gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
                    >
                      <Icon className="w-4 h-4 me-2" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />

              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
              
              {user && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('logout')}
                >
                  <FiLogOut className="w-5 h-5" />
                </motion.button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
              >
                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? 'auto' : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="px-4 pt-2 pb-4 space-y-1 bg-white border-t border-gray-200">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <Icon className="w-5 h-5 me-3" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </motion.div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
