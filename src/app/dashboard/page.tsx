'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ContentGenerator } from '@/components/content-generator'
import { ContentLibrary } from '@/components/content-library'
import { DashboardStats } from '@/components/dashboard-stats'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Sparkles, Library, LogOut } from 'lucide-react'

interface User {
  _id: string
  name: string
  email: string
  image?: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'generate' | 'library'>('generate')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!apiClient.isAuthenticated()) {
        router.push('/auth/signin')
        return
      }

      try {
        const userData = await apiClient.getUserProfile()
        setUser(userData)
      } catch (error) {
        console.error('Failed to get user profile:', error)
        apiClient.clearToken()
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    apiClient.clearToken()
    router.push('/auth/signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600 mt-2">Create new learning content or browse your library.</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('generate')}
                className={`${
                  activeTab === 'generate'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Content
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`${
                  activeTab === 'library'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Library className="h-5 w-5 mr-2" />
                My Library
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'generate' ? (
            <ContentGenerator />
          ) : (
            <ContentLibrary />
          )}
        </div>
      </div>
    </div>
  )
}
