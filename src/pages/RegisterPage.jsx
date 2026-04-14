import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Music, User, Mail, Lock, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, error, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) return <Navigate to="/home" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    setIsLoading(true)
    const ok = await register(username, email, password)
    setIsLoading(false)
    if (ok) navigate('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070711] relative overflow-hidden font-sans">

      {/* ── AMBIENT BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-24 w-[550px] h-[550px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
            animation: 'floatBlob1 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            animation: 'floatBlob2 16s ease-in-out infinite',
          }}
        />
        <div className="absolute inset-0 grid-bg" />
        {[
          { top: '10%', left: '18%', delay: '0s', dur: '6s' },
          { top: '30%', left: '85%', delay: '1.2s', dur: '8s' },
          { top: '65%', left: '6%', delay: '0.6s', dur: '7s' },
          { top: '80%', left: '72%', delay: '2s', dur: '9s' },
        ].map((d, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 rounded-full opacity-60 ${['bg-indigo-400', 'bg-pink-400', 'bg-cyan-400', 'bg-indigo-400'][i]}`}
            style={{
              top: d.top, left: d.left,
              animation: `float ${d.dur} ease-in-out infinite`,
              animationDelay: d.delay,
            }}
          />
        ))}
      </div>

      {/* ── LOGO ── */}
      <div className="absolute top-6 left-8 z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
            style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }}
          >
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Vibe<span className="shimmer-text">Sync</span>
          </span>
        </Link>
      </div>

      {/* ── CARD ── */}
      <div
        className="card-glow relative z-10 w-full max-w-md"
        style={{ animation: 'fadeSlideUp 0.6s ease both' }}
      >
        <div
          className="relative rounded-3xl px-9 py-10 border border-white/[0.08]"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)' }}
        >

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border border-indigo-500/25"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(236,72,153,0.15))' }}
            >
              <Music className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">Create account</h1>
            <p className="text-white/40 text-sm">Start discovering music from your mood</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {error && (
              <div className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-white/45 tracking-widest uppercase mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="your_username"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-white/45 tracking-widest uppercase mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-white/45 tracking-widest uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-white/45 tracking-widest uppercase mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary relative z-10 flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl text-white font-bold text-base mt-1 border-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span
                    className="w-[18px] h-[18px] rounded-full border-2 border-white/30 border-t-white inline-block"
                    style={{ animation: 'spin-slow 0.7s linear infinite' }}
                  />
                  <span className="relative z-10">Creating account...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Create Account</span>
                  <ArrowRight className="w-4 h-4 relative z-10" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-white/25 text-xs">Already have an account?</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Login link */}
          <Link
            to="/login"
            className="block w-full text-center py-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/65 font-semibold text-sm hover:bg-indigo-500/10 hover:border-indigo-500/40 hover:text-white transition-all duration-200"
          >
            Sign in instead →
          </Link>
        </div>
      </div>
    </div>
  )
}
