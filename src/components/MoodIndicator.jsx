const moodConfig = {
  happy: { emoji: '😊', gradient: 'from-yellow-400 to-orange-400', glow: 'rgba(251,191,36,0.3)', label: 'Happy' },
  sad: { emoji: '😢', gradient: 'from-blue-400 to-indigo-500', glow: 'rgba(96,165,250,0.3)', label: 'Sad' },
  energetic: { emoji: '⚡', gradient: 'from-red-400 to-pink-500', glow: 'rgba(248,113,113,0.3)', label: 'Energetic' },
  calm: { emoji: '😌', gradient: 'from-emerald-400 to-cyan-400', glow: 'rgba(52,211,153,0.3)', label: 'Calm' },
  melancholic: { emoji: '🎻', gradient: 'from-purple-400 to-indigo-500', glow: 'rgba(167,139,250,0.3)', label: 'Melancholic' },
  romantic: { emoji: '💕', gradient: 'from-pink-400 to-rose-400', glow: 'rgba(244,114,182,0.3)', label: 'Romantic' },
  angry: { emoji: '🔥', gradient: 'from-red-500 to-orange-500', glow: 'rgba(239,68,68,0.3)', label: 'Angry' },
  peaceful: { emoji: '🌿', gradient: 'from-teal-400 to-green-400', glow: 'rgba(45,212,191,0.3)', label: 'Peaceful' },
}

export default function MoodIndicator({ mood, confidence, description }) {
  const key = mood?.toLowerCase()
  const cfg = moodConfig[key] || { emoji: '🎵', gradient: 'from-indigo-400 to-pink-400', glow: 'rgba(99,102,241,0.3)', label: mood || '?' }

  return (
    <div className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${cfg.glow} 0%, transparent 65%)` }} />

      <div className="relative z-10">
        <div className="text-5xl mb-4">{cfg.emoji}</div>
        <p className="text-white/35 text-xs font-bold tracking-widest uppercase mb-1">Detected Mood</p>
        <h3 className={`text-3xl font-black mb-2 bg-gradient-to-r ${cfg.gradient} bg-clip-text text-transparent`}>
          {cfg.label}
        </h3>
        {description && (
          <p className="text-white/40 text-sm italic mb-4 leading-relaxed">{description}</p>
        )}

        {confidence && (
          <div>
            <div className="flex justify-between text-xs text-white/30 mb-2">
              <span>Confidence</span>
              <span className="text-white/60 font-semibold">{Math.round(confidence * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-1000`}
                style={{ width: `${Math.round(confidence * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
