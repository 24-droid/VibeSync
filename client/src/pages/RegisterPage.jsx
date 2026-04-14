import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../api/axiosConfig'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await axiosInstance.post('/auth/register', {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      })

      const { user, token } = response.data
      register(user, token)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
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
          <p className="text-muted text-sm">Join the music discovery community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-b from-[#1a1f3a] to-[#0f1428] rounded-lg p-8 backdrop-blur-sm border border-border shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Create Account</h2>

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
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 bg-[#0a0e27] border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-foreground mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="your_username"
              required
              className="w-full px-4 py-3 bg-[#0a0e27] border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-[#0a0e27] border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <p className="text-center text-muted text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:text-secondary transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
