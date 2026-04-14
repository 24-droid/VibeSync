import React from 'react'

export default function ColorPalette({ colors = [], title = 'Extracted Colors' }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <div className="flex gap-2 flex-wrap">
        {colors.length > 0 ? (
          colors.map((color, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              title={color}
            >
              <div
                className="w-16 h-16 rounded-lg border-2 border-border group-hover:border-primary transition-all shadow-lg"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs text-muted font-mono group-hover:text-primary transition-colors">
                {color}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-muted text-sm py-4 w-full">
            Upload an image to see extracted colors
          </div>
        )}
      </div>
    </div>
  )
}
