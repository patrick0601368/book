'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ContentGenerator } from '@/components/content-generator'
import { DashboardStats } from '@/components/dashboard-stats'
import { RecentContent } from '@/components/recent-content'
import { apiClient } from '@/lib/api'

interface User {
  _id: string
  name: string
  email: string
  image?: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Create new learning content or continue where you left off.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ContentGenerator />
          </div>
          <div className="space-y-8">
            <DashboardStats />
            <RecentContent />
          </div>
        </div>
      </div>
    </div>
  )
}
