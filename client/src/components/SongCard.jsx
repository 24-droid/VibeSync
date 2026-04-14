import React from 'react'

export default function SongCard({ song, onAdd, onRemove, isInCollection = false }) {
  return (
    <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1428] rounded-lg p-4 border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {song.title || song.name}
          </h3>
          <p className="text-sm text-muted">
            {song.artist || song.artistName}
          </p>
        </div>
        {song.coverUrl && (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-12 h-12 rounded ml-2 object-cover border border-border"
          />
        )}
      </div>

      {song.mood && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
            {song.mood}
          </span>
        </div>
      )}

      {song.album && (
        <p className="text-xs text-muted mb-3 line-clamp-1">
          Album: {song.album}
        </p>
      )}

      <div className="flex gap-2">
        {!isInCollection ? (
          <button
            onClick={() => onAdd && onAdd(song)}
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium py-2 rounded hover:shadow-lg hover:shadow-primary/50 transition-all"
          >
            Add to Collection
          </button>
        ) : (
          <button
            onClick={() => onRemove && onRemove(song.id || song._id)}
            className="flex-1 bg-red-500/20 text-red-400 text-sm font-medium py-2 rounded hover:bg-red-500/30 transition-all border border-red-500/30"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
