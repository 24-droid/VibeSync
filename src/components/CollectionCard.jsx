import { FolderHeart, Music, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CollectionCard({ collection }) {
  return (
    <Link to={`/collections/${collection._id}`} className="block">
      <div className="glass-card rounded-2xl p-6 h-full group cursor-pointer hover:border-indigo-500/40 transition-all duration-300">
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(236,72,153,0.2))', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <FolderHeart className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-pink-500/10 text-pink-300 border border-pink-500/20">
            {collection.songs?.length || 0} songs
          </span>
        </div>

        <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
          {collection.name}
        </h3>
        <p className="text-sm text-white/35 line-clamp-2 mb-5">{collection.description || 'No description'}</p>

        <div className="flex items-center justify-between text-xs text-white/25">
          <div className="flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" />
            {collection.updatedAt ? new Date(collection.updatedAt).toLocaleDateString() : 'N/A'}
          </div>
          <ArrowRight className="w-4 h-4 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}
