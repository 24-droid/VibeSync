import { Heart, ExternalLink, Play, Pause, Music } from 'lucide-react'
import { useState, useRef } from 'react'

export default function SongCard({ song, onAddToCollection, onRemove }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const togglePlay = (e) => {
    e.stopPropagation()
    if (!song.previewUrl) return
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      // Pause any other playing audio
      document.querySelectorAll('audio').forEach(a => a.pause())
      audioRef.current?.play()
      setIsPlaying(true)
    }
  }

  const handleAudioEnd = () => setIsPlaying(false)

  return (
    <div className="glass-card rounded-2xl p-4 flex gap-4 items-center group">
      {/* Album art / play button */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer" onClick={togglePlay}>
        {song.albumArt ? (
          <img src={song.albumArt} alt={song.album || song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(236,72,153,0.3))' }}>
            <Music className="w-6 h-6 text-indigo-400" />
          </div>
        )}

        {/* Play overlay */}
        {song.previewUrl && (
          <div className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-200 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            style={{ background: 'rgba(0,0,0,0.55)' }}>
            {isPlaying
              ? <Pause className="w-5 h-5 text-white" />
              : <Play className="w-5 h-5 text-white" />
            }
          </div>
        )}

        {/* Playing indicator ring */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-xl border-2 border-indigo-400"
            style={{ animation: 'pulse-ring 1.5s ease-in-out infinite' }} />
        )}
      </div>

      {/* Hidden audio element */}
      {song.previewUrl && (
        <audio ref={audioRef} src={song.previewUrl} onEnded={handleAudioEnd} preload="none" />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
        <p className="text-white/40 text-xs truncate mt-0.5">{song.artist}</p>
        {song.mood && (
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
              {song.mood}
            </span>
            {song.confidence && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/15 text-pink-300 border border-pink-500/20">
                {Math.round(song.confidence * 100)}%
              </span>
            )}
          </div>
        )}
        {!song.previewUrl && song.spotifyUrl && (
          <p className="text-white/20 text-[10px] mt-1">No preview · open in Spotify</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0">
        {song.spotifyUrl && (
          <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-xl text-white/30 hover:text-green-400 hover:bg-green-500/10 transition-all"
            title="Open on JioSaavn" onClick={e => e.stopPropagation()}>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        {onAddToCollection && (
          <button onClick={() => onAddToCollection(song)}
            className="p-2 rounded-xl text-white/30 hover:text-pink-400 hover:bg-pink-500/10 transition-all"
            title="Save to collection">
            <Heart className="w-4 h-4" />
          </button>
        )}
        {onRemove && (
          <button onClick={() => onRemove(song.id)}
            className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Remove">
            <Heart className="w-4 h-4 fill-current text-pink-500" />
          </button>
        )}
      </div>
    </div>
  )
}
