export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-indigo-400"></div>
        </div>
        <p className="text-white mt-4 text-lg">Loading...</p>
      </div>
    </div>
  )
}
