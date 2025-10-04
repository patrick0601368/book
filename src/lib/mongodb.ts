import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

declare global {
  var mongoose: any
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  console.log('Attempting to connect to MongoDB...')
  console.log('MongoDB URI exists:', !!MONGODB_URI)

  if (cached.conn) {
    console.log('Using cached MongoDB connection')
    return cached.conn
  }

  if (!cached.promise) {
    console.log('Creating new MongoDB connection...')
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully')
      return mongoose
    }).catch((error) => {
      console.error('MongoDB connection failed:', error)
      throw error
    })
  }

  try {
    console.log('Waiting for MongoDB connection...')
    cached.conn = await cached.promise
    console.log('MongoDB connection established')
  } catch (e) {
    console.error('MongoDB connection error:', e)
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect
