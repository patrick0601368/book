export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Learning Platform
        </h1>
        <p className="text-gray-600 mb-8">
          AI-powered learning platform with subject-specific content
        </p>
        <div className="space-x-4">
          <a 
            href="/auth/signup" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Get Started
          </a>
          <a 
            href="/auth/signin" 
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors inline-block"
          >
            Sign In
          </a>
        </div>
        <div className="mt-8">
          <a 
            href="/api/test" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Test API Endpoint
          </a>
        </div>
      </div>
    </div>
  )
}
