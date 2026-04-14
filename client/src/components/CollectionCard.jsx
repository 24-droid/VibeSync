import React from 'react'
import { Link } from 'react-router-dom'

export default function CollectionCard({ collection, onDelete }) {
  return (
    <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1428] rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all group">
      <div className="h-24 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-primary to-secondary"></div>
      </div>

      <div className="p-4">
        <Link
          to={`/collection/${collection.id || collection._id}`}
          className="block mb-2"
        >
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {collection.name}
          </h3>
        </Link>

        <p className="text-sm text-muted mb-3 line-clamp-2">
          {collection.description || 'No description'}
        </p>

        <div className="flex items-center justify-between text-xs text-muted mb-3">
          <span>{collection.songs?.length || 0} songs</span>
          <span>
            {collection.createdAt
              ? new Date(collection.createdAt).toLocaleDateString()
              : 'Recently added'}
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/collection/${collection.id || collection._id}`}
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium py-2 rounded text-center hover:shadow-lg hover:shadow-primary/50 transition-all"
          >
            View
          </Link>
          <button
            onClick={() => onDelete && onDelete(collection.id || collection._id)}
            className="bg-red-500/20 text-red-400 text-sm font-medium px-3 rounded hover:bg-red-500/30 transition-all border border-red-500/30"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
