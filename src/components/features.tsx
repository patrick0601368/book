export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to learn effectively
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform adapts to your learning style and creates 
            personalized content for any subject.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Content Generation</h3>
            <p className="text-gray-600">
              AI creates comprehensive learning materials tailored to your specific needs and difficulty level.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Interactive Exercises</h3>
            <p className="text-gray-600">
              Practice with AI-generated problems and get detailed solutions to improve your understanding.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Learning Paths</h3>
            <p className="text-gray-600">
              Follow structured learning journeys designed to take you from beginner to expert level.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Tracking</h3>
            <p className="text-gray-600">
              Monitor your learning progress and identify areas that need more attention.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Subject Support</h3>
            <p className="text-gray-600">
              Learn any subject from mathematics and science to languages and humanities.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Adaptive Difficulty</h3>
            <p className="text-gray-600">
              Content automatically adjusts to your skill level for optimal learning experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
