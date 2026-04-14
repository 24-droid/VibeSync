import { useState } from 'react'
import NavigationBar from '../components/NavigationBar'
import SongCard from '../components/SongCard'
import { TrendingUp, Flame } from 'lucide-react'

const SONGS = [
  { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', mood: 'Energetic', confidence: 0.95, score: 98 },
  { id: 2, title: 'As It Was', artist: 'Harry Styles', mood: 'Uplifting', confidence: 0.92, score: 96 },
  { id: 3, title: 'Levitating', artist: 'Dua Lipa', mood: 'Happy', confidence: 0.94, score: 94 },
  { id: 4, title: 'Good 4 U', artist: 'Olivia Rodrigo', mood: 'Melancholic', confidence: 0.91, score: 92 },
  { id: 5, title: 'Flowers', artist: 'Miley Cyrus', mood: 'Empowering', confidence: 0.93, score: 90 },
  { id: 6, title: 'Midnight Rain', artist: 'Taylor Swift', mood: 'Reflective', confidence: 0.89, score: 88 },
]

const rankColors = ['from-yellow-400 to-orange-400', 'from-gray-300 to-gray-400', 'from-orange-500 to-amber-600']

export default function TrendingPage() {
  const [songs] = useState(SONGS)

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

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
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
          {songs.map((song, i) => (
            <div key={song.id} className="flex items-center gap-4">
              {/* Rank badge */}
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white bg-gradient-to-br ${rankColors[i] || 'from-indigo-500/40 to-purple-500/40'}`}
                style={i >= 3 ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' } : {}}>
                {i + 1}
              </div>
              <div className="flex-1">
                <SongCard song={song} onAddToCollection={() => alert(`Added ${song.title}`)} />
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
