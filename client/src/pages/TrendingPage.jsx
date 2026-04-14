import React, { useState, useEffect } from 'react'
import NavigationBar from '../components/NavigationBar'
import SongCard from '../components/SongCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function TrendingPage() {
  const [trendingSongs, setTrendingSongs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrendingSongs()
  }, [])

  const fetchTrendingSongs = async () => {
    setIsLoading(true)
    try {
      // Mock trending songs
      const mockTrending = [
        { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', mood: 'Energetic', popularity: 98 },
        { id: '2', title: 'Levitating', artist: 'Dua Lipa', mood: 'Happy', popularity: 96 },
        { id: '3', title: 'Anti-Hero', artist: 'Taylor Swift', mood: 'Melancholic', popularity: 94 },
        { id: '4', title: 'Flowers', artist: 'Miley Cyrus', mood: 'Happy', popularity: 92 },
        { id: '5', title: 'As It Was', artist: 'Harry Styles', mood: 'Calm', popularity: 90 },
        { id: '6', title: 'Despecha', artist: 'Rosalía', mood: 'Energetic', popularity: 88 },
        { id: '7', title: 'Heat Waves', artist: 'Glass Animals', mood: 'Dreamy', popularity: 86 },
        { id: '8', title: 'Sunroof', artist: 'Nicky Youre', mood: 'Happy', popularity: 84 },
      ]
      setTrendingSongs(mockTrending)
    } catch (err) {
      console.error('Failed to load trending songs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCollection = (song) => {
    alert(`Added "${song.title}" to your collection!`)
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
            Trending <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Now</span>
          </h1>
          <p className="text-muted">Most popular songs discovered by VibeSync users</p>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading trending songs..." />
        ) : trendingSongs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔥</div>
            <p className="text-muted">No trending songs available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top 3 Featured */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Top This Week</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {trendingSongs.slice(0, 3).map((song, idx) => (
                  <div
                    key={song.id}
                    className="relative bg-gradient-to-br from-[#1a1f3a] to-[#0f1428] rounded-lg p-6 border border-border overflow-hidden group"
                  >
                    <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="text-5xl font-bold text-primary/50 mb-2">
                        #{idx + 1}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {song.title}
                      </h3>
                      <p className="text-muted mb-3">{song.artist}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            style={{ width: `${song.popularity}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted">{song.popularity}%</span>
                      </div>
                      <button
                        onClick={() => handleAddToCollection(song)}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-medium py-2 rounded hover:shadow-lg hover:shadow-primary/50 transition-all"
                      >
                        Add to Collection
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Trending */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">All Trending Songs</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    onAdd={handleAddToCollection}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
