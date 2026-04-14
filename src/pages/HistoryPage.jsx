import { useState, useEffect } from 'react'
import NavigationBar from '../components/NavigationBar'
import HistoryCard from '../components/HistoryCard'
import { History, Loader2, AlertCircle } from 'lucide-react'
import api from '../api/api'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/history')
        setHistory(data)
      } catch (err) {
        setError('Failed to load history')
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this history entry?')) return
    try {
      await api.delete(`/history/${id}`)
      setHistory(prev => prev.filter(item => item._id !== id))
    } catch (err) {
      alert('Failed to delete history entry')
    }
  }

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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/20">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading your history...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/10 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : history.length > 0 ? (
          <div className="flex flex-col gap-3" style={{ animation: 'fadeSlideUp 0.6s 0.1s ease both' }}>
            {history.map(item => (
              <HistoryCard key={item._id} item={item} onDelete={handleDelete} />
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
