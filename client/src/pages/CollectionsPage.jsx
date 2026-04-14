import React, { useState, useEffect } from 'react'
import NavigationBar from '../components/NavigationBar'
import CollectionCard from '../components/CollectionCard'
import LoadingSpinner from '../components/LoadingSpinner'
import axiosInstance from '../api/axiosConfig'

export default function CollectionsPage() {
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    setIsLoading(true)
    try {
      // Mock data for demonstration
      const mockCollections = [
        {
          id: '1',
          name: 'Workout Mix',
          description: 'High energy tracks for gym sessions',
          songs: [{ id: '1', title: 'Song 1' }, { id: '2', title: 'Song 2' }],
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Chill Vibes',
          description: 'Relaxing songs for study and focus',
          songs: [{ id: '3', title: 'Song 3' }],
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Party Hits',
          description: 'Popular dance tracks',
          songs: [{ id: '4', title: 'Song 4' }, { id: '5', title: 'Song 5' }, { id: '6', title: 'Song 6' }],
          createdAt: new Date().toISOString(),
        },
      ]
      setCollections(mockCollections)
    } catch (err) {
      setError('Failed to load collections')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCollection = async (e) => {
    e.preventDefault()
    try {
      const newCollection = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        songs: [],
        createdAt: new Date().toISOString(),
      }
      setCollections([...collections, newCollection])
      setFormData({ name: '', description: '' })
      setShowCreateForm(false)
    } catch (err) {
      setError('Failed to create collection')
    }
  }

  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      setCollections(collections.filter((c) => c.id !== collectionId))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
              My <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Collections</span>
            </h1>
            <p className="text-muted">Organize and manage your music collections</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
          >
            New Collection
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1428] rounded-lg p-6 border border-border mb-8 fade-in">
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Collection Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Workout Mix"
                  required
                  className="w-full px-4 py-3 bg-[#0a0e27] border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your collection..."
                  rows="3"
                  className="w-full px-4 py-3 bg-[#0a0e27] border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary"
                ></textarea>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-border text-foreground font-semibold px-6 py-2 rounded-lg hover:bg-border/80 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading collections..." />
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-muted mb-4">No collections yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all"
            >
              Create Your First Collection
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onDelete={handleDeleteCollection}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
