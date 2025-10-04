import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('Testing MongoDB connection...')
    await dbConnect()
    console.log('MongoDB connection test successful')
    
    return NextResponse.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('MongoDB health check failed:', error)
    return NextResponse.json({ 
      status: 'error', 
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
