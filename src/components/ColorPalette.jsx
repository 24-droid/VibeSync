export default function ColorPalette({ colors }) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <p className="text-white/35 text-xs font-bold tracking-widest uppercase mb-4">Color Palette</p>
      <div className="flex gap-3">
        {colors && colors.length > 0 ? (
          colors.slice(0, 5).map((color, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full aspect-square rounded-xl cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg"
                style={{ backgroundColor: color, boxShadow: `0 8px 24px ${color}55` }}
                title={color}
              />
              <p className="text-[10px] text-white/30 font-mono">{color.replace('#', '')}</p>
            </div>
          ))
        ) : (
          <p className="text-white/25 text-sm">No colors extracted</p>
        )}
      </div>
    </div>
  )
}
