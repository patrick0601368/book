export function DashboardStats() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Learning Pages Created</span>
          <span className="font-semibold">0</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Exercises Completed</span>
          <span className="font-semibold">0</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Subjects Studied</span>
          <span className="font-semibold">0</span>
        </div>
      </div>
    </div>
  )
}
