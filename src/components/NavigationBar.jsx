import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Music, Home, Folder, History, TrendingUp, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/collections', icon: Folder, label: 'Collections' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/trending', icon: TrendingUp, label: 'Trending' },
]

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{ background: 'rgba(7,7,17,0.85)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }}
            >
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Vibe<span className="shimmer-text">Sync</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                      : 'text-white/45 hover:text-white/75 hover:bg-white/[0.05]'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* User + logout */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }}>
                  {(user.username || user.name || user.email || '?')[0].toUpperCase()}
                </div>
                <span className="text-white/60 text-sm">{user.username || user.name || user.email}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/45 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white/50 hover:text-white transition-colors p-2"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-white/[0.06] pt-4">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-white/50 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
