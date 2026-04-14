import { Link } from 'react-router-dom'
import { Music, Sparkles, Heart, ArrowRight, Upload, Brain, Headphones, FolderHeart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Floating dot positions (deterministic, no random)
const DOTS = [
  { top: '8%', left: '12%', size: 3, color: 'bg-indigo-400', delay: '0s', dur: '6s' },
  { top: '15%', left: '78%', size: 2, color: 'bg-pink-400', delay: '0.7s', dur: '8s' },
  { top: '28%', left: '5%', size: 2, color: 'bg-cyan-400', delay: '1.4s', dur: '7s' },
  { top: '40%', left: '92%', size: 3, color: 'bg-indigo-400', delay: '0.3s', dur: '9s' },
  { top: '55%', left: '20%', size: 2, color: 'bg-pink-400', delay: '2s', dur: '6s' },
  { top: '62%', left: '65%', size: 3, color: 'bg-cyan-400', delay: '1s', dur: '8s' },
  { top: '75%', left: '38%', size: 2, color: 'bg-indigo-400', delay: '0.5s', dur: '7s' },
  { top: '82%', left: '88%', size: 2, color: 'bg-pink-400', delay: '1.8s', dur: '9s' },
  { top: '90%', left: '10%', size: 3, color: 'bg-cyan-400', delay: '0.9s', dur: '6s' },
  { top: '33%', left: '50%', size: 2, color: 'bg-indigo-400', delay: '2.5s', dur: '8s' },
]

const FEATURES = [
  {
    icon: <Brain className="w-7 h-7" />,
    textColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15 border border-indigo-500/25',
    title: 'AI Mood Detection',
    desc: 'Advanced vision AI scans your images and reads emotional cues to understand your current vibe.',
  },
  {
    icon: <Headphones className="w-7 h-7" />,
    textColor: 'text-pink-400',
    iconBg: 'bg-pink-500/15 border border-pink-500/25',
    title: 'Smart Playlists',
    desc: 'Hyper-personalized song recommendations that evolve as your mood shifts throughout the day.',
  },
  {
    icon: <FolderHeart className="w-7 h-7" />,
    textColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border border-cyan-500/25',
    title: 'Mood Collections',
    desc: 'Save, organize, and revisit curated playlists for every color, emotion, and moment in your life.',
  },
]

const STEPS = [
  { icon: <Upload className="w-5 h-5" />, num: '01', title: 'Upload Image', desc: 'Drag & drop any photo' },
  { icon: <Brain className="w-5 h-5" />, num: '02', title: 'AI Analysis', desc: 'Mood & color detection' },
  { icon: <Music className="w-5 h-5" />, num: '03', title: 'Get Songs', desc: 'Curated recommendations' },
  { icon: <Heart className="w-5 h-5" />, num: '04', title: 'Save & Enjoy', desc: 'Build your collection' },
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  return (
    <div className="min-h-screen bg-[#070711] text-white overflow-x-hidden font-sans">

      {/* ── AMBIENT BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Blobs */}
        <div
          className="absolute -top-32 -left-24 w-[600px] h-[600px] rounded-full opacity-100"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
            animation: 'floatBlob1 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/3 -right-36 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            animation: 'floatBlob2 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-24 left-1/3 w-[550px] h-[550px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
            animation: 'floatBlob3 18s ease-in-out infinite',
          }}
        />

        {/* Grid */}
        <div className="absolute inset-0 grid-bg" />

        {/* Floating dots */}
        {DOTS.map((d, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${d.color} opacity-60`}
            style={{
              top: d.top,
              left: d.left,
              width: d.size,
              height: d.size,
              animation: `float ${d.dur} ease-in-out infinite`,
              animationDelay: d.delay,
            }}
          />
        ))}
      </div>

      {/* ── NAVBAR ── */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }}>
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-[22px] font-black tracking-tight">
              Vibe<span className="shimmer-text">Sync</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="nav-link text-white/45 text-sm font-medium">Features</a>
            <a href="#how-it-works" className="nav-link text-white/45 text-sm font-medium">How it Works</a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {!isAuthenticated && <Link to="/login"
              className="nav-link px-5 py-2 text-white/60 text-sm font-medium rounded-lg hover:text-white transition-colors">
              Login
            </Link>}
            <Link to="/register"
              className="btn-primary relative z-10 px-5 py-2 text-white text-sm font-bold rounded-xl">
              <span className="relative z-10">Get Started →</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border"
          style={{
            background: 'rgba(99,102,241,0.12)',
            borderColor: 'rgba(99,102,241,0.3)',
            animation: 'fadeSlideUp 0.7s ease both',
          }}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-indigo-300 text-sm font-semibold tracking-wide">AI-Powered Music Discovery</span>
        </div>

        {/* Heading */}
        <h1
          className="text-6xl md:text-8xl font-black leading-none mb-6 tracking-tighter"
          style={{ animation: 'fadeSlideUp 0.7s ease both' }}
        >
          Music that <br />
          <span className="shimmer-text">feels you.</span>
        </h1>

        {/* Subtext */}
        <p
          className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          style={{ animation: 'fadeSlideUp 0.7s 0.2s ease both' }}
        >
          Upload a photo. Our AI reads your mood, then curates songs that match your vibe — perfectly, every time.
        </p>

        {/* Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24"
          style={{ animation: 'fadeSlideUp 0.7s 0.4s ease both' }}
        >
          <Link
            to="/register"
            className="btn-primary relative z-10 flex items-center gap-2 px-8 py-4 text-white font-bold rounded-2xl text-base"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start for Free <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
          <button className="btn-secondary flex items-center gap-2 px-8 py-4 text-white/75 font-semibold rounded-2xl text-base">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping inline-block" />
            Watch Demo
          </button>
        </div>

        {/* ── FEATURE CARDS ── */}
        <div id="features" className="grid md:grid-cols-3 gap-5 mb-28">
          {FEATURES.map((card, i) => (
            <div key={i} className="glass-card rounded-3xl p-8 text-left">
              <div className={`feature-icon inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 ${card.iconBg} ${card.textColor}`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
              <p className="text-white/40 leading-relaxed text-sm">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS ── */}
        <div id="how-it-works" className="glass-card rounded-3xl p-12">
          <div
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border"
            style={{ background: 'rgba(244,114,182,0.1)', borderColor: 'rgba(244,114,182,0.25)' }}
          >
            <span className="text-pink-400 text-xs font-bold tracking-widest uppercase">Simple Process</span>
          </div>
          <h2 className="text-4xl font-black mb-16 tracking-tight">
            How It <span className="shimmer-text">Works</span>
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="relative flex items-center justify-center w-full mb-6">
                  {/* Connector */}
                  {i < STEPS.length - 1 && (
                    <div
                      className="absolute left-1/2 top-1/2 w-full h-px hidden md:block"
                      style={{ background: 'linear-gradient(90deg,rgba(99,102,241,0.35),transparent)', transform: 'translateY(-50%)' }}
                    />
                  )}
                  <div
                    className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-white group-hover:[animation:pulse-ring_1.4s_ease_infinite]"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }}
                  >
                    {step.icon}
                  </div>
                </div>
                <span className="text-xs font-bold tracking-widest text-white/25 mb-1">{step.num}</span>
                <h3 className="font-bold text-white mb-1 text-sm">{step.title}</h3>
                <p className="text-xs text-white/40">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div
          className="relative rounded-3xl overflow-hidden p-12 text-center border border-white/[0.08]"
          style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.22),rgba(168,85,247,0.18),rgba(236,72,153,0.18))' }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(139,92,246,0.28) 0%,transparent 60%)' }}
          />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Ready to sync your <span className="shimmer-text">vibe?</span>
            </h2>
            <p className="text-white/45 mb-8 text-lg">Join thousands discovering music through a whole new lens.</p>
            <Link
              to="/register"
              className="btn-primary relative z-10 inline-flex items-center gap-2 px-10 py-4 text-white font-bold rounded-2xl text-base"
            >
              <span className="relative z-10 flex items-center gap-2">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }}
            >
              <Music className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white/75 text-sm">VibeSync</span>
          </div>
          <p className="text-white/25 text-sm">© 2025 VibeSync — Discover music from your mood.</p>
          <div className="flex gap-6 text-sm text-white/25">
            <a href="#" className="hover:text-white/55 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/55 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
