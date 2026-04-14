import { useState } from 'react'
import NavigationBar from '../components/NavigationBar'
import CollectionCard from '../components/CollectionCard'
import SearchBar from '../components/SearchBar'
import { Plus, FolderHeart } from 'lucide-react'

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [collections] = useState([
    { id: 1, name: 'Workout Mix', description: 'High energy songs for the gym', songCount: 24, updatedAt: new Date() },
    { id: 2, name: 'Chill Vibes', description: 'Relaxing tracks for studying', songCount: 18, updatedAt: new Date() },
    { id: 3, name: 'Late Night', description: 'Perfect for midnight drives', songCount: 32, updatedAt: new Date() },
    { id: 4, name: 'Focus Flow', description: 'Concentration boosting music', songCount: 15, updatedAt: new Date() },
  ])

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
          <button className="btn-primary flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm">
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
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ animation: 'fadeSlideUp 0.6s 0.1s ease both' }}>
            {filtered.map(c => <CollectionCard key={c.id} collection={c} />)}
          </div>
        ) : (
          <div className="glass-card rounded-2xl py-24 text-center">
            <FolderHeart className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm mb-4">No collections found</p>
            <button className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm">
              <span className="relative z-10 flex items-center gap-2"><Plus className="w-4 h-4" /> Create one</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
