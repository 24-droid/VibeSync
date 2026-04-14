import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // Still validating the stored token — show spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070711] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-white/10 border-t-indigo-500"
            style={{ animation: 'spin-slow 0.8s linear infinite' }}
          />
          <p className="text-white/30 text-sm font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
