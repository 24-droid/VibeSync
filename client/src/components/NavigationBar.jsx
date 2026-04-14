import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavigationBar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gradient-to-b from-[#1a1f3a] to-[#0f1428] border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to='/'
          className="text-2xl font-bold font-display bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          VibeSync
        </Link>

        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/home"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/collections"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Collections
            </Link>
            <Link
              to="/history"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              History
            </Link>
            <Link
              to="/trending"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Trending
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="relative group">
                <button className="text-foreground hover:text-primary transition-colors font-medium">
                  Menu
                </button>
                <div className="absolute right-0 w-48 bg-[#0a0e27] border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all mt-2">
                  <p className="px-4 py-3 border-b border-border text-sm text-muted">
                    {user?.email}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-foreground hover:text-primary transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isAuthenticated && menuOpen && (
        <div className="md:hidden bg-[#0f1428] border-t border-border">
          <Link
            to="/home"
            className="block px-4 py-3 text-foreground hover:bg-primary/10 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/collections"
            className="block px-4 py-3 text-foreground hover:bg-primary/10 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Collections
          </Link>
          <Link
            to="/history"
            className="block px-4 py-3 text-foreground hover:bg-primary/10 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            History
          </Link>
          <Link
            to="/trending"
            className="block px-4 py-3 text-foreground hover:bg-primary/10 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Trending
          </Link>
          <button
            onClick={() => {
              handleLogout()
              setMenuOpen(false)
            }}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
