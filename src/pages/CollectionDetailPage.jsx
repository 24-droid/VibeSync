import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar'
import SongCard from '../components/SongCard'
import { ArrowLeft, Trash2, Music } from 'lucide-react'

export default function CollectionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [songs] = useState([
    { id: 1, title: 'Electric Dreams', artist: 'The Synthesizers', mood: 'Energetic', confidence: 0.92 },
    { id: 2, title: 'Midnight Vibes', artist: 'Luna Echo', mood: 'Energetic', confidence: 0.88 },
    { id: 3, title: 'Cosmic Journey', artist: 'Space Waves', mood: 'Energetic', confidence: 0.85 },
    { id: 4, title: 'Neon Nights', artist: 'Digital Hearts', mood: 'Energetic', confidence: 0.90 },
  ])

  const collection = { id, name: 'Workout Mix', description: 'High energy songs for the gym', songCount: songs.length }

  return (
    <div className="min-h-screen bg-[#070711] font-sans">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', animation: 'floatBlob1 12s ease-in-out infinite' }} />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <NavigationBar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-10" style={{ animation: 'fadeSlideUp 0.5s ease both' }}>
          <button
            onClick={() => navigate('/collections')}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Collections
          </button>
          <button
            onClick={() => { if (confirm('Delete this collection?')) navigate('/collections') }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        {/* Collection info */}
        <div className="mb-10 glass-card rounded-3xl p-8" style={{ animation: 'fadeSlideUp 0.5s 0.1s ease both' }}>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }}>
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white mb-1 tracking-tight">{collection.name}</h1>
              <p className="text-white/40 mb-3">{collection.description}</p>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                {collection.songCount} songs
              </span>
            </div>
          </div>
        </div>

        {/* Songs */}
        {songs.length > 0 ? (
          <div style={{ animation: 'fadeSlideUp 0.5s 0.2s ease both' }}>
            <h2 className="text-lg font-bold text-white/60 mb-4 tracking-tight">Songs in this collection</h2>
            <div className="flex flex-col gap-3">
              {songs.map(song => <SongCard key={song.id} song={song} onRemove={() => alert(`Removed ${song.title}`)} />)}
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl py-20 text-center">
            <Music className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/25 text-sm">No songs yet</p>
          </div>
        )}
      </main>
    </div>
  )
}
