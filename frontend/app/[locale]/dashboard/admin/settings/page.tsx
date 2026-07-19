'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import api from '@/lib/api'

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && user.role !== 'ADMIN') {
      router.push(`/dashboard/${user.role.toLowerCase()}`)
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      // Load current logo
      const currentLogo = localStorage.getItem('platformLogo') || '/glunovita.png'
      setLogoPreview(currentLogo)
      setLoading(false)
    }
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match('image.*')) {
      setUploadError('Please select an image file (JPEG, PNG, GIF, etc.)')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size should be less than 2MB')
      return
    }

    setUploadError('')
    setUploadSuccess(false)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setUploadError('Please select a file first')
      return
    }

    const file = fileInputRef.current.files[0]
    const formData = new FormData()
    formData.append('logo', file)

    setUploading(true)
    setUploadError('')
    
    try {
      // In a real implementation, this would send the file to the backend
      // For now, we'll save it to localStorage as a data URL
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result as string
        localStorage.setItem('platformLogo', base64data)
        setUploadSuccess(true)
        setTimeout(() => setUploadSuccess(false), 3000)
      }
      reader.readAsDataURL(file)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      setUploadError('Failed to upload logo. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="text-center py-12">Access denied</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Settings</h1>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Platform Logo</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center h-40">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Current Logo Preview" 
                        className="max-h-32 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-500">No logo uploaded</span>
                    )}
                  </div>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Select Image
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || !fileInputRef.current?.files?.[0]}
                    className={`w-full px-4 py-2 rounded-md text-white transition-colors ${
                      uploading || !fileInputRef.current?.files?.[0]
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700'
                    }`}
                  >
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </button>
                  
                  {uploadSuccess && (
                    <div className="mt-3 p-3 bg-green-100 text-green-700 rounded-md">
                      Logo uploaded successfully!
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-md">
                      {uploadError}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 text-sm text-gray-600">
                  <p className="font-medium mb-1">Requirements:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Image format: JPEG, PNG, GIF, SVG</li>
                    <li>Maximum size: 2MB</li>
                    <li>Recommended dimensions: 200x200 pixels</li>
                  </ul>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">How to customize your logo</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                    <li>Click "Select Image" to choose an image file from your computer</li>
                    <li>Preview your logo in the box on the left</li>
                    <li>Click "Upload Logo" to save your new logo</li>
                    <li>The new logo will appear across the platform immediately</li>
                  </ol>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-900 mb-2">Logo Preview</h3>
                    <div className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-center space-x-3">
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo Preview" 
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">Logo</span>
                          </div>
                        )}
                        <span className="font-bold text-lg">GLUNOVITA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}