'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import Card from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { FiBell, FiFileText, FiShoppingBag, FiActivity, FiMapPin } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

export default function PatientDashboard() {
  const t = useTranslations('PatientDashboard')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'PATIENT') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [notificationsRes, surveysRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/surveys')
      ])
      setNotifications(notificationsRes.data.data.slice(0, 5))
      setSurveys(surveysRes.data.data.slice(0, 5))
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(t('loadingError'))
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="spinner"></div>
        </div>
      </Layout>
    )
  }

  if (!user || user.role !== 'PATIENT') {
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('welcome', { name: user.firstName })}
          </h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">{t('notifications')}</p>
                  <p className="text-3xl font-bold">{notifications.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiBell className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">{t('surveys')}</p>
                  <p className="text-3xl font-bold">{surveys.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiActivity className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">{t('declarations')}</p>
                  <p className="text-3xl font-bold">-</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiFileText className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm mb-1">{t('shop')}</p>
                  <p className="text-3xl font-bold">-</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiShoppingBag className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FiBell className="w-5 h-5 mr-2 text-primary-600" />
                  {t('recentNotifications')}
                </h2>
              </div>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('noNotifications')}</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={notif._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900">{notif.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FiActivity className="w-5 h-5 mr-2 text-primary-600" />
                  {t('availableSurveys')}
                </h2>
              </div>
              {surveys.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('noSurveys')}</p>
              ) : (
                <div className="space-y-3">
                  {surveys.map((survey, index) => (
                    <motion.div
                      key={survey._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900">{survey.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="p-6 bg-gradient-to-r from-primary-50 to-primary-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">{t('quickActions')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/dashboard/patient/declarations"
                className="p-4 bg-white rounded-lg hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center"
              >
                <FiFileText className="w-8 h-8 mb-2 text-primary-600" />
                <p className="font-medium text-sm">{t('submitDeclaration')}</p>
              </a>
              <a
                href="/dashboard/patient/medical-records"
                className="p-4 bg-white rounded-lg hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center"
              >
                <FiFileText className="w-8 h-8 mb-2 text-primary-600" />
                <p className="font-medium text-sm">{t('viewRecords')}</p>
              </a>
              <a
                href="/dashboard/shop"
                className="p-4 bg-white rounded-lg hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center"
              >
                <FiShoppingBag className="w-8 h-8 mb-2 text-primary-600" />
                <p className="font-medium text-sm">{t('visitShop')}</p>
              </a>
              <a
                href="/sales-points"
                className="p-4 bg-white rounded-lg hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center border border-primary-100"
              >
                <FiMapPin className="w-8 h-8 mb-2 text-primary-600" />
                <p className="font-medium text-sm">{t('salesPointsMap')}</p>
              </a>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  )
}
