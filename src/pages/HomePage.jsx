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
  
  // Custom prompt states
  const [customPrompt, setCustomPrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [activePrompt, setActivePrompt] = useState('')
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  const LANGUAGES = [
    { key: 'english', label: '🇺🇸 English' },
    { key: 'hindi', label: '🇮🇳 Hindi' },
    { key: 'punjabi', label: '🎵 Punjabi' },
  ]

  const fetchRecommendations = async (mood, newOffset, language, promptOverride) => {
    setLoadingTracks(true)
    setTracksError(null)
    try {
      const useLang = language || lang
      const promptToUse = typeof promptOverride !== 'undefined' ? promptOverride : activePrompt
      const promptParam = promptToUse ? `&prompt=${encodeURIComponent(promptToUse)}` : ''
      const { data: recData } = await api.get(`/recommendations?mood=${mood}&limit=12&offset=${newOffset}&lang=${useLang}${promptParam}`)
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
    setCustomPrompt('')
    setActivePrompt('')
    setHasAnalyzed(false)

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
      setHasAnalyzed(true)

      // Step 2 — recommendations for detected mood
      const { data: recData } = await api.get(`/recommendations?mood=${data.mood}&limit=9&offset=0&lang=${lang}`)
      setRecommendations(recData.tracks || [])
      setHasMore(recData.hasMore || false)
      setOffset(0)

      // Step 3 — Update history entry with initial recommendations
      if (data.id) {
        await api.patch(`/analysis/${data.id}/songs`, { songs: recData.tracks || [] })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.')
      setIsAnalyzing(false)
    }
  }

  const handleRefineVibe = async (e) => {
    e.preventDefault()
    if (!customPrompt.trim() || !analysisResult?.id) return

    setIsRefining(true)
    setTracksError(null)
    try {
      const { data } = await api.post(`/analysis/${analysisResult.id}/refine`, {
        prompt: customPrompt,
        lang: lang
      })
      setAnalysisResult(data)
      setCurrentMood(data.mood)
      setRecommendations(data.tracks || [])
      setOffset(0)
      setHasMore((data.tracks || []).length > 9)
      setActivePrompt(customPrompt)
    } catch (err) {
      setError(err.response?.data?.message || 'Refinement failed. Please try again.')
    } finally {
      setIsRefining(false)
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

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
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
            <div className="flex flex-col gap-6">
              <MoodIndicator
                mood={analysisResult.mood}
                confidence={analysisResult.confidence}
                description={analysisResult.description}
              />
              <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden"
                style={{ animation: 'fadeSlideUp 0.4s ease both' }}>
                <div className="absolute inset-0 pointer-events-none z-0"
                  style={{ background: 'radial-gradient(circle at 10% 20%, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />
                
                <div className="relative z-10">
                  <h4 className="text-white text-sm font-black mb-1.5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    Not quite your vibe? Custom Refine
                  </h4>
                  <p className="text-white/45 text-xs mb-4 leading-relaxed">
                    Specify who you're with or what you're doing in the picture, and get customized recommendations!
                  </p>
                  
                  <form onSubmit={handleRefineVibe} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="✨ E.g. 'Late night drive with friends, play some energetic Punjabi pop'"
                      disabled={isRefining}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder-white/20 text-sm focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] transition-all w-full"
                    />
                    <button
                      type="submit"
                      disabled={isRefining || !customPrompt.trim()}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-white/[0.04] disabled:text-white/20 text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.45)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
                    >
                      {isRefining ? (
                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      ) : (
                        <>
                          <span>Refine</span>
                          <Sparkles className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
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
        {(hasAnalyzed || loadingTracks || tracksError) && (
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
              <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 rounded-xl w-full sm:w-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.key}
                    onClick={() => {
                      setLang(l.key)
                      setOffset(0)
                      // Pass activePrompt explicitly so React state closure issue doesn't cause mixing
                      fetchRecommendations(currentMood, 0, l.key, activePrompt)
                    }}
                    disabled={loadingTracks}
                    className={`px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all text-center ${lang === l.key
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
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            )}

            {/* Pagination buttons */}
            {!loadingTracks && !tracksError && recommendations.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/[0.06]">
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 order-2 sm:order-1">
                  <button
                    onClick={() => fetchRecommendations(currentMood, Math.max(0, offset - 9))}
                    disabled={offset === 0}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.04] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous 9</span>
                  </button>

                  <button
                    onClick={() => fetchRecommendations(currentMood, offset + 9)}
                    disabled={!hasMore}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-white/[0.08] text-white/50 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Next 9</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-white/25 text-xs order-1 sm:order-2">
                  Songs {offset + 1}–{offset + recommendations.length}
                </span>
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
