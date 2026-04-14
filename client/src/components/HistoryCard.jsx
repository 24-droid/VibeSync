import React from 'react'

export default function HistoryCard({ history, onView }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1f3a] to-[#0f1428] rounded-lg p-4 border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all group">
      <div className="flex gap-4">
        {history.imageUrl && (
          <img
            src={history.imageUrl}
            alt="Upload"
            className="w-20 h-20 rounded-lg object-cover border border-border"
          />
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-muted mb-1">
                {formatDate(history.timestamp)}
              </p>
              {history.detectedMood && (
                <div className="inline-block bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-semibold">
                  {history.detectedMood}
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-muted mb-3">
            {history.suggestedSongs?.length || 0} songs recommended
          </p>

          {history.detectedColors && history.detectedColors.length > 0 && (
            <div className="flex gap-1 mb-3">
              {history.detectedColors.slice(0, 4).map((color, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                  title={color}
                ></div>
              ))}
            </div>
          )}

          <button
            onClick={() => onView && onView(history.id || history._id)}
            className="text-sm bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded hover:shadow-lg hover:shadow-primary/50 transition-all"
          >
            View Results
          </button>
        </div>
      </div>
    </div>
  )
}
