import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar'
import SongCard from '../components/SongCard'
import LoadingSpinner from '../components/LoadingSpinner'
import axiosInstance from '../api/axiosConfig'

export default function CollectionDetailPage() {
  const { collectionId } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCollection()
  }, [collectionId])

  const fetchCollection = async () => {
    setIsLoading(true)
    try {
      // Mock data
      const mockCollection = {
        id: collectionId,
        name: 'Workout Mix',
        description: 'High energy tracks for gym sessions',
        songs: [
          { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
          { id: '2', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia' },
          { id: '3', title: 'Don\'t Start Now', artist: 'Dua Lipa', album: 'Future Nostalgia' },
          { id: '4', title: 'Physical', artist: 'Dua Lipa', album: 'Future Nostalgia' },
        ],
        createdAt: new Date().toISOString(),
      }
      setCollection(mockCollection)
    } catch (err) {
      setError('Failed to load collection')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSong = (songId) => {
    if (window.confirm('Remove this song from the collection?')) {
      setCollection({
        ...collection,
        songs: collection.songs.filter((s) => s.id !== songId),
      })
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading collection..." />

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/collections')}
          className="text-primary hover:text-secondary transition-colors font-medium mb-6"
        >
          ← Back to Collections
        </button>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : collection ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
                {collection.name}
              </h1>
              <p className="text-muted text-lg mb-4">{collection.description}</p>
              <p className="text-sm text-muted">
                {collection.songs.length} songs • Created{' '}
                {new Date(collection.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Songs</h2>
              {collection.songs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted">No songs in this collection yet</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collection.songs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isInCollection={true}
                      onRemove={handleRemoveSong}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
