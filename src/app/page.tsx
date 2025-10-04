export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Learning Platform
        </h1>
        <p className="text-center text-gray-600 mb-8">
          AI-powered learning platform with subject-specific content
        </p>
        <div className="text-center">
          <a 
            href="/auth/signup" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </main>
  )
}
