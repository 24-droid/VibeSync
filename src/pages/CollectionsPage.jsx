import { useState, useEffect } from 'react'
import NavigationBar from '../components/NavigationBar'
import CollectionCard from '../components/CollectionCard'
import SearchBar from '../components/SearchBar'
import { Plus, FolderHeart, Loader2, X, Info } from 'lucide-react'
import api from '../api/api'

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newColl, setNewColl] = useState({ name: '', description: '' })
  const [isCreating, setIsCreating] = useState(false)

  const fetchCollections = async () => {
    try {
      const { data } = await api.get('/collections')
      setCollections(data)
    } catch (err) {
      console.error('Failed to load collections')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newColl.name.trim()) return
    setIsCreating(true)
    try {
      await api.post('/collections', newColl)
      setNewColl({ name: '', description: '' })
      setShowModal(false)
      fetchCollections()
    } catch (err) {
      alert('Failed to create collection')
    } finally {
      setIsCreating(false)
    }
  }

  const filtered = collections.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#070711] font-sans">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 right-0 w-[450px] h-[450px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', animation: 'floatBlob2 15s ease-in-out infinite' }} />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', animation: 'floatBlob3 18s ease-in-out infinite' }} />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <NavigationBar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8" style={{ animation: 'fadeSlideUp 0.6s ease both' }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-1">
              Your <span className="shimmer-text">Collections</span>
            </h1>
            <p className="text-white/40">Organize and manage your music collections</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Collection
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search collections..." />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/20">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading collections...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ animation: 'fadeSlideUp 0.6s 0.1s ease both' }}>
            {filtered.map(c => <CollectionCard key={c._id} collection={c} />)}
          </div>
        ) : (
          <div className="glass-card rounded-2xl py-24 text-center">
            <FolderHeart className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm mb-4">No collections found</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
            >
              <span className="relative z-10 flex items-center gap-2"><Plus className="w-4 h-4" /> Create one</span>
            </button>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#070711]/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10" style={{ animation: 'fadeSlideUp 0.3s ease both' }}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">New Collection</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
                  <Info className="w-3 h-3" /> Name
                </label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newColl.name}
                  onChange={(e) => setNewColl({ ...newColl, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  placeholder="e.g. Summer Hits 2026"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
                  <Info className="w-3 h-3" /> Description (Optional)
                </label>
                <textarea
                  value={newColl.description}
                  onChange={(e) => setNewColl({ ...newColl, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all h-24 resize-none"
                  placeholder="The best tracks for..."
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/5 text-white font-bold text-sm hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn-primary flex-[2] py-3 px-4 rounded-xl text-white font-bold text-sm relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isCreating ? 'Creating...' : 'Create Collection'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
