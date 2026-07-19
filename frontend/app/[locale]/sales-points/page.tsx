'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import SalesMap from '@/components/SalesMap'
import { FiMap } from 'react-icons/fi'

export default function SalesPointsMapPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user) {
      fetchPoints()
    }
  }, [user, authLoading, router])

  const fetchPoints = async () => {
    try {
      const res = await api.get('/sales-points')
      setPoints(res.data.data)
    } catch (error) {
      console.error('Failed to load sales points', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <Layout><div className="flex justify-center p-12"><div className="spinner"></div></div></Layout>
  }

  if (!user) return null

  return (
    <Layout>
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <FiMap className="text-primary-600" />
          Carte des Points de Vente
        </h1>
        <p className="text-slate-500 mb-8">
          Trouvez les points de vente partenaires les plus proches de chez vous.
        </p>
        
        <div className="glass-panel p-2 rounded-[20px] shadow-premium">
          <SalesMap points={points} />
        </div>
      </div>
    </Layout>
  )
}
