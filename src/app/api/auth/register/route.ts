import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('Registration API called at:', new Date().toISOString())

    const dbStartTime = Date.now()
    await dbConnect()
    console.log('Database connected in:', Date.now() - dbStartTime, 'ms')

    const { name, email, password } = await request.json()
    console.log('Registration data received:', { name, email, password: password ? '***' : 'missing' })

    // Validate input
    if (!name || !email || !password) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log('Validation failed: password too short')
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    console.log('Checking for existing user...')
    const existingUserStartTime = Date.now()
    const existingUser = await User.findOne({ email })
    console.log('User lookup completed in:', Date.now() - existingUserStartTime, 'ms')
    
    if (existingUser) {
      console.log('User already exists')
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    console.log('Hashing password...')
    const hashStartTime = Date.now()
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Password hashed in:', Date.now() - hashStartTime, 'ms')

    // Create user
    console.log('Creating user...')
    const createStartTime = Date.now()
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })
    console.log('User created in:', Date.now() - createStartTime, 'ms')

    console.log('User created successfully:', user._id)
    console.log('Total registration time:', Date.now() - startTime, 'ms')

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject()

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    console.log('Total registration time before error:', Date.now() - startTime, 'ms')
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
