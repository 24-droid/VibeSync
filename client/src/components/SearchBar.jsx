import React, { useState, useCallback } from 'react'

export default function SearchBar({ onSearch, placeholder = 'Search songs, artists, collections...' }) {
  const [query, setQuery] = useState('')

  const handleChange = useCallback((e) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }, [onSearch])

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-[#0a0e27] border border-border rounded-lg px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
        <svg
          className="w-5 h-5 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-foreground placeholder-muted outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-muted hover:text-foreground transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
