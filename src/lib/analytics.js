import api from '../api/api'

// Helper to get browser & OS specs
function getDeviceInfo() {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  let os = 'Unknown'

  if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edg')) browser = 'Edge'

  if (ua.includes('Win')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'MacOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone')) os = 'iOS'

  return {
    browser,
    os,
    deviceType: /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop',
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  }
}

// Generate or retrieve persistent Session ID
export function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem('vibesync_analytics_session_id')
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('vibesync_analytics_session_id', sessionId)
  }
  return sessionId
}

let sessionStartTime = Date.now()

// Base Track Function
export async function trackEvent(eventType, eventCategory = 'engagement', metadata = {}, mood = null) {
  try {
    const sessionId = getOrCreateSessionId()
    const storedUser = localStorage.getItem('user')
    const user = storedUser ? JSON.parse(storedUser) : null

    const eventPayload = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sessionId,
      userId: user?._id || user?.id || null,
      userEmail: user?.email || user?.username || 'Guest',
      eventType,
      eventCategory,
      mood: mood || metadata?.mood || null,
      path: window.location.pathname,
      referrer: document.referrer || '',
      metadata,
      device: getDeviceInfo(),
      timestamp: new Date().toISOString()
    }

    // Fire and forget send
    api.post('/analytics/event', eventPayload).catch(() => {
      // Silently catch to avoid disrupting user experience
    })
  } catch (err) {
    // Graceful silent fallback
  }
}

// Session Ping Heartbeat
export function startSessionHeartbeat() {
  const ping = () => {
    const sessionId = getOrCreateSessionId()
    const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000)
    api.post('/analytics/session/ping', { sessionId, durationSeconds }).catch(() => { })
  }
  ping()
  const interval = setInterval(ping, 30000) // every 30 seconds
  return () => clearInterval(interval)
}
