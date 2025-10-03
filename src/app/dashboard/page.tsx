'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ContentGenerator } from '@/components/content-generator'
import { DashboardStats } from '@/components/dashboard-stats'
import { RecentContent } from '@/components/recent-content'

export default function Dashboard() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user?.name}!</h1>
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
