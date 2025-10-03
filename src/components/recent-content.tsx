export function RecentContent() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Content</h3>
      <div className="space-y-3">
        <div className="border-l-4 border-blue-500 pl-3">
          <p className="text-sm font-medium text-gray-900">Calculus Fundamentals</p>
          <p className="text-xs text-gray-500">Mathematics • 2 hours ago</p>
        </div>
        <div className="border-l-4 border-green-500 pl-3">
          <p className="text-sm font-medium text-gray-900">Physics Problem Set</p>
          <p className="text-xs text-gray-500">Physics • 1 day ago</p>
        </div>
        <div className="border-l-4 border-purple-500 pl-3">
          <p className="text-sm font-medium text-gray-900">History Learning Path</p>
          <p className="text-xs text-gray-500">History • 3 days ago</p>
        </div>
      </div>
    </div>
  )
}
