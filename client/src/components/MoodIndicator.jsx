import React from 'react'

const moodEmojis = {
  happy: '😊',
  sad: '😢',
  energetic: '⚡',
  calm: '😌',
  angry: '😠',
  relaxed: '😎',
  excited: '🤩',
  melancholic: '🎹',
  peaceful: '🧘',
  intense: '🔥',
}

export default function MoodIndicator({ mood, confidence }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-6xl animate-pulse">
        {moodEmojis[mood?.toLowerCase()] || '🎵'}
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground capitalize mb-1">
          {mood || 'Analyzing...'}
        </h3>
        {confidence && (
          <div className="space-y-2">
            <p className="text-sm text-muted">
              Confidence: {(confidence * 100).toFixed(0)}%
            </p>
            <div className="w-32 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                style={{ width: `${confidence * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
