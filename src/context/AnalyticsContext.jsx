import { createContext, useContext, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent, startSessionHeartbeat } from '../lib/analytics'

const AnalyticsContext = createContext(null)

export function AnalyticsProvider({ children }) {
  const location = useLocation()
  const prevPathRef = useRef(null)

  useEffect(() => {
    // Start heartbeat
    const stopHeartbeat = startSessionHeartbeat()
    return () => stopHeartbeat()
  }, [])

  useEffect(() => {
    const currentPath = location.pathname
    if (prevPathRef.current !== currentPath) {
      trackEvent('page_view', 'navigation', { path: currentPath })
      prevPathRef.current = currentPath
    }
  }, [location])

  const track = (eventType, eventCategory, metadata, mood) => {
    trackEvent(eventType, eventCategory, metadata, mood)
  }

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    return { track: trackEvent }
  }
  return context
}
