import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true while validating stored token
  const [error, setError] = useState(null)

  // ── On mount: restore session from stored token ────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user)
      })
      .catch(() => {
        // Token invalid / expired — clear storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
      return false
    }
  }, [])

  // ── Register ───────────────────────────────────────────────────────────
  const register = useCallback(async (username, email, password) => {
    setError(null)
    try {
      const { data } = await api.post('/auth/register', { username, email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
      return false
    }
  }, [])

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setError(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
