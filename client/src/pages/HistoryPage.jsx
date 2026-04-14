import React, { useState, useEffect } from 'react'
import NavigationBar from '../components/NavigationBar'
import HistoryCard from '../components/HistoryCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      // Mock history data
      const mockHistory = [
        {
          id: '1',
          imageUrl: 'https://via.placeholder.com/80?text=Happy',
          detectedMood: 'Happy',
          detectedColors: ['#FFD93D', '#6BCB77', '#4D96FF'],
          suggestedSongs: [{ id: '1', title: 'Song 1' }, { id: '2', title: 'Song 2' }],
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          imageUrl: 'https://via.placeholder.com/80?text=Calm',
          detectedMood: 'Calm',
          detectedColors: ['#A8E6CF', '#FFD3B6', '#FFAAA5'],
          suggestedSongs: [{ id: '3', title: 'Song 3' }, { id: '4', title: 'Song 4' }],
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          imageUrl: 'https://via.placeholder.com/80?text=Energetic',
          detectedMood: 'Energetic',
          detectedColors: ['#FF6B6B', '#FFA07A', '#FF8C42'],
          suggestedSongs: [{ id: '5', title: 'Song 5' }],
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setHistory(mockHistory)
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewResults = (historyId) => {
    // Navigate to results or show details
    console.log('View results for:', historyId)
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
            Upload <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">History</span>
          </h1>
          <p className="text-muted">View all your past mood detections and recommendations</p>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading history..." />
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🕐</div>
            <p className="text-muted mb-4">No upload history yet</p>
            <p className="text-sm text-muted">Start by uploading an image from the home page</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <HistoryCard
                key={item.id}
                history={item}
                onView={handleViewResults}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
