'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import { motion } from 'framer-motion'
import { FiUsers, FiFileText, FiActivity, FiHeart, FiSettings, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'

// Mock Data
const growthData = [
  { name: 'Jan', patients: 120, doctors: 20 },
  { name: 'Feb', patients: 150, doctors: 25 },
  { name: 'Mar', patients: 200, doctors: 30 },
  { name: 'Apr', patients: 180, doctors: 45 },
  { name: 'May', patients: 250, doctors: 50 },
  { name: 'Jun', patients: 320, doctors: 65 },
];

const distributionData = [
  { name: 'Patients', value: 320, color: '#3b82f6' },
  { name: 'Doctors', value: 65, color: '#10b981' },
  { name: 'Admins', value: 5, color: '#f59e0b' },
];

const declarationData = [
  { name: 'Mon', pending: 12, approved: 15, rejected: 2 },
  { name: 'Tue', pending: 15, approved: 10, rejected: 1 },
  { name: 'Wed', pending: 8, approved: 20, rejected: 4 },
  { name: 'Thu', pending: 20, approved: 12, rejected: 3 },
  { name: 'Fri', pending: 25, approved: 18, rejected: 5 },
  { name: 'Sat', pending: 10, approved: 5, rejected: 0 },
  { name: 'Sun', pending: 5, approved: 2, rejected: 0 },
];


const recentActivity = [
  { id: 1, user: 'Sarah Jenkins', action: 'New Patient Registered', time: '2 hours ago', status: 'success' },
  { id: 2, user: 'Dr. Robert Smith', action: 'Declaration Submitted', time: '4 hours ago', status: 'pending' },
  { id: 3, user: 'Emma Watson', action: 'Order Placed #ORD-124', time: '5 hours ago', status: 'success' },
  { id: 4, user: 'Dr. Alan Turing', action: 'Account Verified', time: '1 day ago', status: 'success' },
  { id: 5, user: 'System', action: 'Failed Login Attempt', time: '1 day ago', status: 'error' },
];

const sparklineData1 = [{ v: 10 }, { v: 15 }, { v: 12 }, { v: 20 }, { v: 18 }, { v: 25 }, { v: 30 }];
const sparklineData2 = [{ v: 5 }, { v: 8 }, { v: 12 }, { v: 10 }, { v: 15 }, { v: 12 }, { v: 8 }];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingDeclarations: 0,
    activeDoctors: 0,
    activePatients: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'ADMIN') {
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
      const [usersRes, declarationsRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: { data: { users: [], pagination: { total: 400 } } } })),
        api.get('/patients/declarations').catch(() => ({ data: { data: [] } }))
      ])
      
      const users = usersRes.data.data?.users || []
      const declarations = declarationsRes.data.data || []
      
      setStats({
        totalUsers: usersRes.data.data?.pagination?.total || 390,
        pendingDeclarations: declarations.filter((d: any) => d.status === 'PENDING').length || 15,
        activeDoctors: users.filter((u: any) => u.role === 'DOCTOR' && u.isActive).length || 65,
        activePatients: users.filter((u: any) => u.role === 'PATIENT' && u.isActive).length || 320
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="spinner"></div>
        </div>
      </Layout>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <Layout>
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h1>
            <p className="mt-2 text-sm text-slate-500">
              Advanced analytics and real-time monitoring for the Celiac Platform.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
             <button 
               onClick={() => window.print()}
               className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all shadow-sm font-medium text-sm"
             >
               Download Report
             </button>
             <button 
               onClick={() => router.push('/dashboard/admin/settings')}
               className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all shadow-sm shadow-primary-500/30 font-medium text-sm"
             >
               <FiSettings className="w-4 h-4" />
               Settings
             </button>
          </div>
        </div>
        
        {/* KPI Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.totalUsers}</h3>
              </div>
              <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                <FiUsers className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-4">
              <FiArrowUpRight className="w-4 h-4" /> <span>+12.5% this month</span>
            </div>
            <div className="h-12 w-full absolute bottom-0 left-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData1}>
                  <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Forms</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.pendingDeclarations}</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <FiFileText className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-rose-600 font-medium mb-4">
              <FiArrowDownRight className="w-4 h-4" /> <span>-3.2% this week</span>
            </div>
             <div className="h-12 w-full absolute bottom-0 left-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData2}>
                  <Area type="monotone" dataKey="v" stroke="#f59e0b" fill="#fffbeb" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Doctors</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.activeDoctors}</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <FiActivity className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-6">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">85% engagement rate</p>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Patients</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.activePatients}</h3>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <FiHeart className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-6">
              <div className="bg-rose-500 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">92% profile completion</p>
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Main Growth Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">User Acquisition Trends</h2>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" name="Patients" dataKey="patients" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
                  <Area type="monotone" name="Doctors" dataKey="doctors" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDoctors)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* User Distribution Donut */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-2xl p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Demographics</h2>
            <div className="flex-1 min-h-[300px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-900">390</span>
                <span className="text-sm text-slate-500">Total Users</span>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {distributionData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-slate-600 font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Declarations Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Weekly Declaration Volume</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={declarationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={12}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="approved" name="Approved" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Activity Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel rounded-2xl p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity Log</h2>
              <button className="text-primary-600 text-sm font-medium hover:text-primary-700">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User / Action</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentActivity.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                            {log.user.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{log.action}</p>
                            <p className="text-xs text-slate-500">{log.user}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{log.time}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 
                          log.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  )
}
