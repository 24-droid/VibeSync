import { useState } from 'react'
import NavigationBar from '../components/NavigationBar'
import HistoryCard from '../components/HistoryCard'
import { History } from 'lucide-react'

export default function HistoryPage() {
  const [history] = useState([
    { id: 1, mood: 'Energetic', confidence: 0.92, songCount: 3, createdAt: new Date(Date.now() - 86400000) },
    { id: 2, mood: 'Calm', confidence: 0.88, songCount: 5, createdAt: new Date(Date.now() - 172800000) },
    { id: 3, mood: 'Melancholic', confidence: 0.85, songCount: 4, createdAt: new Date(Date.now() - 259200000) },
    { id: 4, mood: 'Happy', confidence: 0.90, songCount: 6, createdAt: new Date(Date.now() - 345600000) },
  ])

  return (
    <div className="min-h-screen bg-[#070711] font-sans">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', animation: 'floatBlob2 15s ease-in-out infinite' }} />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <NavigationBar />

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10" style={{ animation: 'fadeSlideUp 0.6s ease both' }}>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-1">
            Your <span className="shimmer-text">History</span>
          </h1>
          <p className="text-white/40">Browse your past mood detections and recommendations</p>
        </div>

        {history.length > 0 ? (
          <div className="flex flex-col gap-3" style={{ animation: 'fadeSlideUp 0.6s 0.1s ease both' }}>
            {history.map(item => (
              <HistoryCard key={item.id} item={item} onDelete={(id) => { if (confirm('Delete this entry?')) alert(`Deleted ${id}`) }} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl py-24 text-center">
            <History className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">No history yet</p>
            <p className="text-white/15 text-xs mt-1">Upload an image on the Home page to get started</p>
          </div>
        )}
      </main>
    </div>
  )
}
