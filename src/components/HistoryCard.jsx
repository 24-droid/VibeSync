import { Calendar, Trash2, Music } from 'lucide-react'

const moodColors = {
  energetic: { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/20', dot: 'bg-orange-400' },
  calm: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
  happy: { bg: 'bg-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-500/20', dot: 'bg-yellow-400' },
  melancholic: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/20', dot: 'bg-purple-400' },
  sad: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  romantic: { bg: 'bg-pink-500/15', text: 'text-pink-300', border: 'border-pink-500/20', dot: 'bg-pink-400' },
}

export default function HistoryCard({ item, onDelete }) {
  const colors = moodColors[item.mood?.toLowerCase()] || { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/20', dot: 'bg-indigo-400' }
  const serverBase = 'http://localhost:5000'

  return (
    <div className="glass-card rounded-2xl p-5 flex gap-4 items-center group">
      {/* Mood thumbnail / image */}
      {item.imageUrl ? (
        <img src={`${serverBase}${item.imageUrl}`} alt="Upload" className="w-16 h-16 rounded-xl object-cover shrink-0" />
      ) : (
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15))', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <Music className="w-6 h-6 text-indigo-400/60" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {item.mood || 'Unknown'}
          </span>
          {item.confidence && (
            <span className="text-white/30 text-xs">{Math.round(item.confidence * 100)}% match</span>
          )}
        </div>
        <p className="text-white/45 text-sm">{item.songs?.length || 0} song recommendations</p>
        <div className="flex items-center gap-1.5 mt-2 text-white/25 text-xs">
          <Calendar className="w-3 h-3" />
          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(item._id)}
          className="p-2.5 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
