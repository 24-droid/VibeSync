import React from 'react'

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="animate-spin w-12 h-12 border-4 border-border border-t-primary rounded-full"></div>
      <p className="text-muted text-sm">{message}</p>
    </div>
  )
}
