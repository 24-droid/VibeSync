import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../api/axiosConfig'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      })

      const { user, token } = response.data
      login(user, token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center px-4 fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold font-display bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            VibeSync
          </h1>
          <p className="text-muted text-sm">Discover music that matches your mood</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-b from-[#1a1f3a] to-[#0f1428] rounded-lg p-8 backdrop-blur-sm border border-border shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Welcome Back</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 bg-[#0a0e27] border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-[#0a0e27] border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-muted text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary font-semibold hover:text-secondary transition-colors"
            >
              Sign up
            </Link>
          </p>
        </form>

        <p className="text-center text-muted text-xs mt-6">
          Demo credentials: test@example.com / password123
        </p>
      </div>
    </div>
  )
}
