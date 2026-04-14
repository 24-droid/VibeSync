import { Heart, ExternalLink, Play, Pause, Music, Plus, Loader2, Check, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import api from '../api/api'

export default function SongCard({ song, onRemove }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCollections, setShowCollections] = useState(false)
  const [collections, setCollections] = useState([])
  const [isLoadingColl, setIsLoadingColl] = useState(false)
  const [isSaving, setIsSaving] = useState(null) // ID of collection being saved to
  const dropdownRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCollections(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchCollections = async () => {
    if (collections.length > 0) return
    setIsLoadingColl(true)
    try {
      const { data } = await api.get('/collections')
      setCollections(data)
    } catch (err) {
      console.error('Failed to load collections')
    } finally {
      setIsLoadingColl(false)
    }
  }

  const toggleCollections = (e) => {
    e.stopPropagation()
    setShowCollections(!showCollections)
    if (!showCollections) fetchCollections()
  }

  const addToCollection = async (e, collectionId) => {
    e.stopPropagation()
    setIsSaving(collectionId)
    try {
      await api.post(`/collections/${collectionId}/songs`, { song })
      // Success feedback
      setTimeout(() => {
        setIsSaving(null)
        setShowCollections(false)
      }, 1000)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add song')
      setIsSaving(null)
    }
  }

  const togglePlay = (e) => {
    e.stopPropagation()
    if (!song.previewUrl) return
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      document.querySelectorAll('audio').forEach(a => a.pause())
      audioRef.current?.play()
      setIsPlaying(true)
    }
  }

  const handleAudioEnd = () => setIsPlaying(false)

  return (
    <div className="glass-card rounded-2xl p-4 flex gap-4 items-center group relative">
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

        {song.previewUrl && (
          <div className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-200 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            style={{ background: 'rgba(0,0,0,0.55)' }}>
            {isPlaying
              ? <Pause className="w-5 h-5 text-white" />
              : <Play className="w-5 h-5 text-white" />
            }
          </div>
        )}

        {isPlaying && (
          <div className="absolute inset-0 rounded-xl border-2 border-indigo-400"
            style={{ animation: 'pulse-ring 1.5s ease-in-out infinite' }} />
        )}
      </div>

      {song.previewUrl && (
        <audio ref={audioRef} src={song.previewUrl} onEnded={handleAudioEnd} preload="none" />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm truncate">{song.title}</h3>
        <p className="text-white/40 text-xs truncate mt-0.5">{song.artist}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {song.isTrending && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              🔥 Trending
            </span>
          )}
          {song.mood && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
              {song.mood}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0 items-center relative">
        {song.youtubeUrl && (
          <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Play Full Song on YouTube" onClick={e => e.stopPropagation()}>
            <Play className="w-4 h-4" />
          </a>
        )}

        {/* ADD TO COLLECTION DROPDOWN */}
        {!onRemove && (
          <div className="relative" ref={dropdownRef}>
            <button onClick={toggleCollections}
              className={`p-2 rounded-xl transition-all ${showCollections ? 'bg-pink-500/20 text-pink-400' : 'text-white/30 hover:text-pink-400 hover:bg-pink-500/10'}`}
              title="Save to collection">
              <Heart className={`w-4 h-4 ${showCollections ? 'fill-current' : ''}`} />
            </button>

            {showCollections && (
              <div className="absolute right-0 bottom-full mb-2 w-56 glass-card rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[60]"
                style={{ animation: 'fadeSlideUp 0.2s ease-out both' }}>
                <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Add to Collection</span>
                  <Plus className="w-3 h-3 text-white/20 cursor-pointer hover:text-white" onClick={() => window.location.href = '/collections'} />
                </div>

                <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
                  {isLoadingColl ? (
                    <div className="p-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-white/20" /></div>
                  ) : collections.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-[11px] text-white/30 mb-2">No collections found</p>
                      <button onClick={() => window.location.href = '/collections'} className="text-[10px] text-indigo-400 font-bold hover:underline">Create one</button>
                    </div>
                  ) : (
                    collections.map(c => (
                      <button
                        key={c._id}
                        onClick={(e) => addToCollection(e, c._id)}
                        disabled={isSaving === c._id}
                        className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all group/item"
                      >
                        <span className="truncate pr-2">{c.name}</span>
                        {isSaving === c._id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                        ) : (
                          <div className="flex items-center">
                            {/* Check if song might be in there already (simple check) */}
                            {c.songs?.some(s => s.id === song.id) ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-all text-white/30" />
                            )}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
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
