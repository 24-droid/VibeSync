import React, { useState } from 'react'
import NavigationBar from '../components/NavigationBar'
import ImageUpload from '../components/ImageUpload'
import MoodIndicator from '../components/MoodIndicator'
import ColorPalette from '../components/ColorPalette'
import SongCard from '../components/SongCard'
import axiosInstance from '../api/axiosConfig'

export default function HomePage() {
  const [file, setFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const handleImageUpload = async (uploadedFile) => {
    setFile(uploadedFile)
    setError('')
    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('image', uploadedFile)

      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockResults = {
        mood: 'Happy',
        confidence: 0.92,
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
        songs: [
          {
            id: '1',
            title: 'Walking on Sunshine',
            artist: 'Katrina & The Waves',
            album: 'Album Name',
            mood: 'Happy',
          },
          {
            id: '2',
            title: 'Good as Hell',
            artist: 'Lizzo',
            album: 'Cuz I Love You',
            mood: 'Happy',
          },
          {
            id: '3',
            title: 'Levitating',
            artist: 'Dua Lipa',
            album: 'Future Nostalgia',
            mood: 'Happy',
          },
          {
            id: '4',
            title: 'Shut Up and Dance',
            artist: 'Walk the Moon',
            album: 'Walk the Moon',
            mood: 'Energetic',
          },
        ],
      }

      setResults(mockResults)
    } catch (err) {
      setError('Failed to analyze image. Please try again.')
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAddToCollection = async (song) => {
    try {
      // Mock API call
      console.log('Adding song to collection:', song)
      alert(`Added "${song.title}" to your collection!`)
    } catch (err) {
      setError('Failed to add song to collection')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-3">
            Find Your{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Perfect Vibe
            </span>
          </h1>
          <p className="text-muted text-lg">
            Upload an image and let AI discover music that matches your mood
          </p>
        </div>

        {!results ? (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Upload Your Image
              </h2>
              <ImageUpload onUpload={handleImageUpload} isLoading={isAnalyzing} />
            </div>

            <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1428] rounded-lg p-8 border border-border flex flex-col justify-center items-center text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                How It Works
              </h3>
              <ul className="space-y-3 text-muted text-sm">
                <li>✓ Upload any image</li>
                <li>✓ AI detects mood & emotions</li>
                <li>✓ Extract color palette</li>
                <li>✓ Get personalized song recommendations</li>
                <li>✓ Save to your collections</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            <button
              onClick={() => setResults(null)}
              className="text-primary hover:text-secondary transition-colors font-medium mb-4"
            >
              ← Upload Another Image
            </button>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1428] rounded-lg p-8 border border-border">
                <MoodIndicator
                  mood={results.mood}
                  confidence={results.confidence}
                />
              </div>

              <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1428] rounded-lg p-8 border border-border">
                <ColorPalette
                  colors={results.colors}
                  title="Dominant Colors"
                />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">
                Recommended Songs
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.songs?.map((song) => (
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

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mt-4">
            {error}
          </div>
        )}
      </main>
    </div>
  )
}
