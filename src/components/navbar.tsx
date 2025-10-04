'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User, LogOut, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

export function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const userData = await apiClient.getUserProfile()
          setUser(userData)
        } catch (error) {
          console.error('Failed to get user profile:', error)
          apiClient.clearToken()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleSignOut = () => {
    apiClient.clearToken()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Learning Platform</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-8 w-8 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
