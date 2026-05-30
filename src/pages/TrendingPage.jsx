import { useState, useEffect } from 'react'
import NavigationBar from '../components/NavigationBar'
import SongCard from '../components/SongCard'
import { TrendingUp, Flame, Loader2, AlertCircle } from 'lucide-react'
import api from '../api/api'

const rankColors = ['from-yellow-400 to-orange-400', 'from-gray-300 to-gray-400', 'from-orange-500 to-amber-600']

export default function TrendingPage() {
  const [songs, setSongs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data } = await api.get('/recommendations/global-trending')
        setSongs(data)
      } catch (err) {
        setError('Failed to load trending songs')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTrending()
  }, [])

  return (
    <div className="min-h-screen bg-[#070711] font-sans">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', animation: 'floatBlob1 12s ease-in-out infinite' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', animation: 'floatBlob3 18s ease-in-out infinite' }} />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <NavigationBar />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-10" style={{ animation: 'fadeSlideUp 0.6s ease both' }}>
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border"
            style={{ background: 'rgba(236,72,153,0.1)', borderColor: 'rgba(236,72,153,0.25)' }}>
            <Flame className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-pink-300 text-xs font-semibold tracking-wide">Live Rankings</span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-pink-400" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Trending <span className="shimmer-text">Now</span>
            </h1>
          </div>
          <p className="text-white/40 mt-2">The hottest songs right now, globally</p>
        </div>

        {/* Song list */}
        <div className="flex flex-col gap-3" style={{ animation: 'fadeSlideUp 0.6s 0.1s ease both' }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-white/20">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Fetching global trends...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/10 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          ) : songs.map((song, i) => (
            <div key={song.id} className="flex items-center gap-2 sm:gap-4">
              {/* Rank badge */}
              <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black text-white bg-gradient-to-br ${rankColors[i] || 'from-indigo-500/40 to-purple-500/40'}`}
                style={i >= 3 ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' } : {}}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <SongCard song={song} />
              </div>
              {/* Trending score */}
              <div className="shrink-0 text-right hidden sm:block">
                <p className="text-white/20 text-[10px] font-bold tracking-widest uppercase mb-0.5">Score</p>
                <p className="text-white/60 text-sm font-bold">{song.score}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
