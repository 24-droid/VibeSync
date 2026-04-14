import { useState } from 'react'
import NavigationBar from '../components/NavigationBar'
import ImageUpload from '../components/ImageUpload'
import MoodIndicator from '../components/MoodIndicator'
import SongCard from '../components/SongCard'
import { Sparkles, Music, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../api/api'

export default function HomePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [tracksError, setTracksError] = useState(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [currentMood, setCurrentMood] = useState(null)
  const [lang, setLang] = useState('english')

  const LANGUAGES = [
    { key: 'english', label: '🇺🇸 English' },
    { key: 'hindi', label: '🇮🇳 Hindi' },
    { key: 'punjabi', label: '🎵 Punjabi' },
  ]

  const fetchRecommendations = async (mood, newOffset, language) => {
    setLoadingTracks(true)
    setTracksError(null)
    try {
      const useLang = language || lang
      const { data: recData } = await api.get(`/recommendations?mood=${mood}&limit=9&offset=${newOffset}&lang=${useLang}`)
      setRecommendations(recData.tracks || [])
      setHasMore(recData.hasMore || false)
      setOffset(newOffset)
    } catch (recErr) {
      setTracksError(recErr.response?.data?.message || 'Could not load song recommendations')
    } finally {
      setLoadingTracks(false)
    }
  }

  const handleImageUpload = async (file) => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    setRecommendations([])
    setTracksError(null)
    setOffset(0)
    setHasMore(false)
    setCurrentMood(null)

    try {
      // Step 1 — Gemini mood analysis
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await api.post('/analysis/mood', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAnalysisResult(data)
      setCurrentMood(data.mood)
      setIsAnalyzing(false)

      // Step 2 — recommendations for detected mood
      await fetchRecommendations(data.mood, 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.')
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070711] font-sans">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', animation: 'floatBlob1 12s ease-in-out infinite' }} />
        <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', animation: 'floatBlob2 15s ease-in-out infinite' }} />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <NavigationBar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10" style={{ animation: 'fadeSlideUp 0.6s ease both' }}>
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border"
            style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.25)' }}>
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-indigo-300 text-xs font-semibold tracking-wide">AI Powered</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
            Discover Your <span className="shimmer-text">Vibe</span>
          </h1>
          <p className="text-white/40 text-lg">Upload an image and let AI find the perfect songs for your mood</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/10 text-red-300 text-sm"
            style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Upload + Mood grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <ImageUpload onUpload={handleImageUpload} isLoading={isAnalyzing} />

          {analysisResult ? (
            <MoodIndicator
              mood={analysisResult.mood}
              confidence={analysisResult.confidence}
              description={analysisResult.description}
            />
          ) : (
            <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-16 text-center">
              {isAnalyzing ? (
                <>
                  <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-indigo-400 mb-4"
                    style={{ animation: 'spin-slow 0.8s linear infinite' }} />
                  <p className="text-white/40 text-sm font-medium">Gemini is reading your vibe...</p>
                </>
              ) : (
                <>
                  <Music className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-white/25 text-sm">Your mood analysis will appear here</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {(recommendations.length > 0 || loadingTracks || tracksError) && (
          <div style={{ animation: 'fadeSlideUp 0.5s ease both' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white tracking-tight">Recommended Songs</h2>
                {loadingTracks ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-indigo-400"
                    style={{ animation: 'spin-slow 0.8s linear infinite' }} />
                ) : !tracksError && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-500/15 text-pink-300 border border-pink-500/20">
                    {recommendations.length} tracks
                  </span>
                )}
              </div>

              {/* Language selector */}
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.key}
                    onClick={() => {
                      setLang(l.key)
                      setOffset(0)
                      fetchRecommendations(currentMood, 0, l.key)
                    }}
                    disabled={loadingTracks}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${lang === l.key
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-white/35 hover:text-white/60'
                      }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {tracksError ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/10 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {tracksError}
              </div>
            ) : loadingTracks ? (
              /* Skeleton loaders */
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-xl bg-white/[0.05] shrink-0 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 rounded-full bg-white/[0.05] animate-pulse w-3/4" />
                      <div className="h-2 rounded-full bg-white/[0.04] animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map(song => (
                  <SongCard key={song.id} song={song} onAddToCollection={() => alert(`Added ${song.title}`)} />
                ))}
              </div>
            )}

            {/* Pagination buttons */}
            {!loadingTracks && !tracksError && recommendations.length > 0 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
                <button
                  onClick={() => fetchRecommendations(currentMood, Math.max(0, offset - 9))}
                  disabled={offset === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.04] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous 9
                </button>

                <span className="text-white/25 text-xs">
                  Songs {offset + 1}–{offset + recommendations.length}
                </span>

                <button
                  onClick={() => fetchRecommendations(currentMood, offset + 9)}
                  disabled={!hasMore}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-white/50 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                >
                  Next 9
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {!analysisResult && !isAnalyzing && !error && (
          <div className="text-center py-12 text-white/20 text-sm">
            Upload an image above to get started ↑
          </div>
        )}
      </main>
    </div>
  )
}
