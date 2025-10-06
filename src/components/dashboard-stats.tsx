'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface ContentStats {
  totalContent: number
  learningPages: number
  exercises: number
  exercisesWithSolution: number
  uniqueSubjects: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<ContentStats>({
    totalContent: 0,
    learningPages: 0,
    exercises: 0,
    exercisesWithSolution: 0,
    uniqueSubjects: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getContentStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
        <div className="space-y-4 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Content Created</span>
          <span className="font-semibold text-blue-600">{stats.totalContent}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Learning Pages</span>
          <span className="font-semibold">{stats.learningPages}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Exercises</span>
          <span className="font-semibold">{stats.exercises + stats.exercisesWithSolution}</span>
        </div>
      </div>
    </div>
  )
}
