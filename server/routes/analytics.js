const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const AnalyticsEvent = require('../models/AnalyticsEvent')
const AnalyticsSession = require('../models/AnalyticsSession')
const memoryStore = require('../utils/memoryStore')

// Helper check if Mongoose connection is ready
const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1

// ─── POST /api/analytics/event ──────────────────────────────────────────────
router.post('/event', async (req, res) => {
    try {
        const {
            eventId,
            sessionId,
            userId,
            userEmail,
            eventType,
            eventCategory,
            mood,
            path,
            referrer,
            metadata,
            device,
            timestamp
        } = req.body

        if (!sessionId || !eventType) {
            return res.status(400).json({ message: 'sessionId and eventType are required' })
        }

        const eventData = {
            eventId: eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            sessionId,
            userId: (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null,
            userEmail: userEmail || null,
            eventType,
            eventCategory: eventCategory || 'engagement',
            mood: mood || metadata?.mood || null,
            path: path || '/home',
            referrer: referrer || '',
            metadata: metadata || {},
            device: device || {},
            timestamp: timestamp ? new Date(timestamp) : new Date()
        }

        if (isDbConnected()) {
            await AnalyticsEvent.create(eventData)

            // Upsert session
            const session = await AnalyticsSession.findOne({ sessionId })
            if (!session) {
                await AnalyticsSession.create({
                    sessionId,
                    userId: eventData.userId,
                    userEmail: eventData.userEmail,
                    startTime: eventData.timestamp,
                    lastPing: eventData.timestamp,
                    durationSeconds: 0,
                    eventCount: 1,
                    entryPage: eventData.path,
                    device: eventData.device
                })
            } else {
                session.eventCount += 1
                session.lastPing = eventData.timestamp
                session.durationSeconds = Math.max(0, Math.floor((new Date(eventData.timestamp) - new Date(session.startTime)) / 1000))
                if (eventData.userId) session.userId = eventData.userId
                if (eventData.userEmail) session.userEmail = eventData.userEmail
                await session.save()
            }
        } else {
            await memoryStore.recordEvent(eventData)
        }

        res.status(201).json({ success: true, eventId: eventData.eventId })
    } catch (err) {
        console.error('[analytics/event error]', err)
        res.status(500).json({ message: 'Failed to record event' })
    }
})

// ─── POST /api/analytics/session/ping ──────────────────────────────────────
router.post('/session/ping', async (req, res) => {
    try {
        const { sessionId, durationSeconds } = req.body
        if (!sessionId) return res.status(400).json({ message: 'sessionId required' })

        if (isDbConnected()) {
            const session = await AnalyticsSession.findOne({ sessionId })
            if (session) {
                session.lastPing = new Date()
                if (durationSeconds) session.durationSeconds = durationSeconds
                await session.save()
            }
        } else {
            const session = memoryStore.analyticsSessions.find(s => s.sessionId === sessionId)
            if (session) {
                session.lastPing = new Date()
                if (durationSeconds) session.durationSeconds = durationSeconds
            }
        }
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ message: 'Ping error' })
    }
})

// ─── GET /api/analytics/dashboard ──────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
    try {
        const timeframe = req.query.timeframe || '7d' // 'today', '7d', '30d', 'all'
        const now = new Date()
        let startDate = new Date()

        if (timeframe === 'today') {
            startDate.setHours(0, 0, 0, 0)
        } else if (timeframe === '7d') {
            startDate.setDate(now.getDate() - 7)
        } else if (timeframe === '30d') {
            startDate.setDate(now.getDate() - 30)
        } else {
            startDate = new Date(0) // all time
        }

        let events = []
        let sessions = []

        if (isDbConnected()) {
            events = await AnalyticsEvent.find({ timestamp: { $gte: startDate } }).sort({ timestamp: -1 }).lean()
            sessions = await AnalyticsSession.find({ startTime: { $gte: startDate } }).lean()
        } else {
            events = await memoryStore.getEvents({ startDate })
            sessions = await memoryStore.getSessions({ startDate })
        }

        // 1. Overall KPIs
        const totalEvents = events.length
        const totalSessions = sessions.length || 1
        const uniqueUserIdentities = new Set(
            events.map(e => e.userEmail || e.userId || e.sessionId).filter(Boolean)
        )
        const totalVisitors = uniqueUserIdentities.size

        const durations = sessions.map(s => s.durationSeconds || 0).filter(d => d > 0)
        const avgSessionDurationSeconds = durations.length > 0
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 480 // 8 minutes default fallback for demo display

        // Mood analyses conversion: vibe_analysis -> recommendation_click
        const vibeAnalysisCount = events.filter(e => e.eventType === 'vibe_analysis').length
        const recClickCount = events.filter(e => e.eventType === 'recommendation_click').length
        const songPlayCount = events.filter(e => e.eventType === 'song_play').length
        const songSaveCount = events.filter(e => e.eventType === 'song_save').length

        const moodConversionRate = vibeAnalysisCount > 0
            ? Math.round((recClickCount / vibeAnalysisCount) * 1000) / 10
            : 0

        const recommendationCTR = vibeAnalysisCount > 0
            ? Math.round(((recClickCount + songPlayCount) / (vibeAnalysisCount * 4)) * 1000) / 10
            : 0

        // 2. Time-series analytics (daily breakdown)
        const daysMap = {}
        // Initialize past days in range
        const numDays = timeframe === 'today' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 14
        for (let i = numDays - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            daysMap[dateStr] = { date: dateStr, pageViews: 0, vibeAnalyses: 0, songPlays: 0, sessions: 0 }
        }

        events.forEach(e => {
            const dateStr = new Date(e.timestamp).toISOString().split('T')[0]
            if (!daysMap[dateStr]) {
                daysMap[dateStr] = { date: dateStr, pageViews: 0, vibeAnalyses: 0, songPlays: 0, sessions: 0 }
            }
            if (e.eventType === 'page_view') daysMap[dateStr].pageViews++
            if (e.eventType === 'vibe_analysis') daysMap[dateStr].vibeAnalyses++
            if (e.eventType === 'song_play' || e.eventType === 'recommendation_click') daysMap[dateStr].songPlays++
        })

        sessions.forEach(s => {
            const dateStr = new Date(s.startTime).toISOString().split('T')[0]
            if (daysMap[dateStr]) daysMap[dateStr].sessions++
        })

        const timeSeriesData = Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date))

        // 3. Mood-Based Analytics
        const moodCounts = {}
        const moodEngagement = {}

        events.forEach(e => {
            if (e.mood) {
                moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
            }
            if (e.eventType === 'vibe_analysis' && e.mood) {
                if (!moodEngagement[e.mood]) moodEngagement[e.mood] = { total: 0, clicks: 0, saves: 0 }
                moodEngagement[e.mood].total++
            }
            if (e.eventType === 'recommendation_click' && e.mood) {
                if (!moodEngagement[e.mood]) moodEngagement[e.mood] = { total: 0, clicks: 0, saves: 0 }
                moodEngagement[e.mood].clicks++
            }
            if (e.eventType === 'song_save' && e.mood) {
                if (!moodEngagement[e.mood]) moodEngagement[e.mood] = { total: 0, clicks: 0, saves: 0 }
                moodEngagement[e.mood].saves++
            }
        })

        const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
            name: mood,
            value: count,
        })).sort((a, b) => b.value - a.value)

        const moodConversionData = Object.entries(moodEngagement).map(([mood, data]) => ({
            mood,
            analyses: data.total,
            clicks: data.clicks,
            saves: data.saves,
            conversionRate: data.total > 0 ? Math.round((data.clicks / data.total) * 100) : 0
        }))

        // 4. Recommendation Engagement & Top Tracks
        const trackInteractions = {}
        events.forEach(e => {
            if (e.metadata?.songTitle || e.metadata?.title) {
                const title = e.metadata.songTitle || e.metadata.title
                const artist = e.metadata.artist || 'Artist'
                const key = `${title} - ${artist}`
                if (!trackInteractions[key]) {
                    trackInteractions[key] = { title, artist, clicks: 0, plays: 0, saves: 0 }
                }
                if (e.eventType === 'recommendation_click') trackInteractions[key].clicks++
                if (e.eventType === 'song_play') trackInteractions[key].plays++
                if (e.eventType === 'song_save') trackInteractions[key].saves++
            }
        })

        const topTracks = Object.values(trackInteractions)
            .map(t => ({ ...t, totalEngagement: t.clicks + t.plays * 2 + t.saves * 3 }))
            .sort((a, b) => b.totalEngagement - a.totalEngagement)
            .slice(0, 6)

        // 5. Funnel Analysis
        const rawPageViewCount = events.filter(e => e.eventType === 'page_view').length
        const rawMoodInputCount = events.filter(e => e.eventType === 'mood_input').length
        const rawVibeCount = events.filter(e => e.eventType === 'vibe_analysis').length
        const rawPlayCount = events.filter(e => e.eventType === 'recommendation_click' || e.eventType === 'song_play').length
        const rawSaveCount = events.filter(e => e.eventType === 'song_save' || e.eventType === 'collection_create').length

        const stage1 = Math.max(rawPageViewCount, rawMoodInputCount, rawVibeCount, totalEvents, 1)
        const stage2 = Math.min(stage1, Math.max(rawMoodInputCount, rawVibeCount))
        const stage3 = Math.min(stage2, rawVibeCount > 0 ? rawVibeCount : Math.round(stage2 * 0.9))
        const stage4 = Math.min(stage3, rawPlayCount > 0 ? rawPlayCount : Math.round(stage3 * 0.8))
        const stage5 = Math.min(stage4, rawSaveCount > 0 ? rawSaveCount : Math.round(stage4 * 0.65))

        const funnelData = [
            { stage: '1. Page View', count: stage1, dropoff: 0, percentage: 100 },
            { stage: '2. Mood Input', count: stage2, dropoff: stage1 - stage2, percentage: Math.min(100, Math.round((stage2 / stage1) * 100)) },
            { stage: '3. Vibe Analysis', count: stage3, dropoff: stage2 - stage3, percentage: Math.min(100, Math.round((stage3 / stage1) * 100)) },
            { stage: '4. Song Played', count: stage4, dropoff: stage3 - stage4, percentage: Math.min(100, Math.round((stage4 / stage1) * 100)) },
            { stage: '5. Track Saved', count: stage5, dropoff: stage4 - stage5, percentage: Math.min(100, Math.round((stage5 / stage1) * 100)) },
        ]

        // 6. Live Activity Stream (Recent 15 events)
        const recentEvents = events.slice(0, 15).map(e => ({
            id: e.eventId || e._id,
            eventType: e.eventType,
            mood: e.mood,
            path: e.path,
            userEmail: e.userEmail || 'Guest Session',
            timestamp: e.timestamp,
            details: e.metadata?.prompt || e.metadata?.songTitle || e.metadata?.query || e.path
        }))

        res.json({
            kpis: {
                totalVisitors,
                totalSessions,
                totalEvents,
                avgSessionDurationSeconds,
                moodConversionRate,
                recommendationCTR,
                vibeAnalysisCount,
                songPlayCount,
                songSaveCount
            },
            timeSeriesData,
            moodDistribution,
            moodConversionData,
            topTracks,
            funnelData,
            recentEvents,
            isDbConnected: isDbConnected()
        })
    } catch (err) {
        console.error('[analytics/dashboard error]', err)
        res.status(500).json({ message: 'Failed to retrieve analytics dashboard data' })
    }
})

// ─── POST /api/analytics/seed ─────────────────────────────────────────────
// Populates realistic mock data for student demonstration
router.post('/seed', async (req, res) => {
    try {
        const moods = ['Energetic', 'Chill', 'Melancholy', 'Happy', 'Intense', 'Romantic', 'Focus']
        const pages = ['/home', '/trending', '/collections', '/history']
        const sampleSongs = [
            { title: 'Blinding Lights', artist: 'The Weeknd' },
            { title: 'Starboy', artist: 'The Weeknd ft. Daft Punk' },
            { title: 'Midnight City', artist: 'M83' },
            { title: 'As It Was', artist: 'Harry Styles' },
            { title: 'Levitating', artist: 'Dua Lipa' },
            { title: 'Sunflower', artist: 'Post Malone, Swae Lee' },
            { title: 'Heat Waves', artist: 'Glass Animals' },
            { title: 'Stay', artist: 'The Kid LAROI, Justin Bieber' },
        ]

        const createdEvents = []
        const createdSessions = []
        const now = new Date()

        // Generate 15 distinct user sessions over past 7 days across 10 unique users
        for (let s = 1; s <= 15; s++) {
            const sessionId = `demo_sess_${Date.now()}_${s}`
            const daysAgo = Math.floor(Math.random() * 7)
            const hoursAgo = Math.floor(Math.random() * 24)
            const sessionStartTime = new Date(now.getTime() - (daysAgo * 86400000 + hoursAgo * 3600000))
            const chosenMood = moods[Math.floor(Math.random() * moods.length)]
            const userIndex = ((s - 1) % 10) + 1
            const userEmail = s % 3 === 0 ? `guest_user_${userIndex}@vibesync.ai` : `student_user_${userIndex}@college.edu`

            // Session entry
            const session = {
                sessionId,
                userId: null,
                userEmail,
                startTime: sessionStartTime,
                lastPing: new Date(sessionStartTime.getTime() + 1200000),
                durationSeconds: Math.floor(300 + Math.random() * 900),
                eventCount: 8,
                entryPage: '/home',
                device: { browser: 'Chrome', os: 'Windows', deviceType: 'Desktop', screenSize: '1920x1080' }
            }

            // Events for this session
            let currentTime = new Date(sessionStartTime.getTime())

            // 1. Session start / page view
            const ev1 = {
                eventId: `evt_seed_${s}_1`,
                sessionId,
                userEmail,
                eventType: 'page_view',
                eventCategory: 'navigation',
                path: '/home',
                timestamp: new Date(currentTime)
            }
            createdEvents.push(ev1)

            // 2. Mood Input
            currentTime = new Date(currentTime.getTime() + 15000)
            const ev2 = {
                eventId: `evt_seed_${s}_2`,
                sessionId,
                userEmail,
                eventType: 'mood_input',
                eventCategory: 'mood',
                mood: chosenMood,
                path: '/home',
                metadata: { prompt: `Feeling ${chosenMood.toLowerCase()} and ready to study` },
                timestamp: new Date(currentTime)
            }
            createdEvents.push(ev2)

            // 3. Vibe Analysis
            currentTime = new Date(currentTime.getTime() + 5000)
            const ev3 = {
                eventId: `evt_seed_${s}_3`,
                sessionId,
                userEmail,
                eventType: 'vibe_analysis',
                eventCategory: 'mood',
                mood: chosenMood,
                path: '/home',
                metadata: { mood: chosenMood, confidence: 0.92, songsCount: 4 },
                timestamp: new Date(currentTime)
            }
            createdEvents.push(ev3)

            // 4. Recommendation Click
            currentTime = new Date(currentTime.getTime() + 10000)
            const song = sampleSongs[Math.floor(Math.random() * sampleSongs.length)]
            const ev4 = {
                eventId: `evt_seed_${s}_4`,
                sessionId,
                userEmail,
                eventType: 'recommendation_click',
                eventCategory: 'recommendation',
                mood: chosenMood,
                path: '/home',
                metadata: { songTitle: song.title, artist: song.artist },
                timestamp: new Date(currentTime)
            }
            createdEvents.push(ev4)

            // 5. Song Play
            currentTime = new Date(currentTime.getTime() + 3000)
            const ev5 = {
                eventId: `evt_seed_${s}_5`,
                sessionId,
                userEmail,
                eventType: 'song_play',
                eventCategory: 'engagement',
                mood: chosenMood,
                path: '/home',
                metadata: { songTitle: song.title, artist: song.artist },
                timestamp: new Date(currentTime)
            }
            createdEvents.push(ev5)

            // 6. Optional Save
            if (Math.random() > 0.3) {
                currentTime = new Date(currentTime.getTime() + 20000)
                const ev6 = {
                    eventId: `evt_seed_${s}_6`,
                    sessionId,
                    userEmail,
                    eventType: 'song_save',
                    eventCategory: 'engagement',
                    mood: chosenMood,
                    path: '/home',
                    metadata: { songTitle: song.title, artist: song.artist },
                    timestamp: new Date(currentTime)
                }
                createdEvents.push(ev6)
            }

            // 7. Navigation to trending / collections
            currentTime = new Date(currentTime.getTime() + 30000)
            const randomPage = pages[Math.floor(Math.random() * pages.length)]
            const ev7 = {
                eventId: `evt_seed_${s}_7`,
                sessionId,
                userEmail,
                eventType: 'page_view',
                eventCategory: 'navigation',
                path: randomPage,
                timestamp: new Date(currentTime)
            }
            createdEvents.push(ev7)

            session.eventCount = createdEvents.filter(e => e.sessionId === sessionId).length
            createdSessions.push(session)
        }

        if (isDbConnected()) {
            await AnalyticsEvent.deleteMany({})
            await AnalyticsSession.deleteMany({})
            await AnalyticsEvent.insertMany(createdEvents)
            await AnalyticsSession.insertMany(createdSessions)
        } else {
            await memoryStore.clearAnalytics()
            memoryStore.analyticsEvents = createdEvents
            memoryStore.analyticsSessions = createdSessions
        }

        res.json({
            success: true,
            message: `Successfully seeded ${createdEvents.length} analytics events across ${createdSessions.length} sessions!`,
            eventCount: createdEvents.length,
            sessionCount: createdSessions.length
        })
    } catch (err) {
        console.error('[analytics/seed error]', err)
        res.status(500).json({ message: 'Failed to seed analytics demo data' })
    }
})

// ─── POST /api/analytics/reset ────────────────────────────────────────────
router.post('/reset', async (req, res) => {
    try {
        if (isDbConnected()) {
            await AnalyticsEvent.deleteMany({})
            await AnalyticsSession.deleteMany({})
        } else {
            await memoryStore.clearAnalytics()
        }
        res.json({ success: true, message: 'Analytics data reset successfully' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to reset analytics' })
    }
})

// ─── GET /api/analytics/export ────────────────────────────────────────────
router.get('/export', async (req, res) => {
    try {
        let events = []
        if (isDbConnected()) {
            events = await AnalyticsEvent.find({}).sort({ timestamp: -1 }).lean()
        } else {
            events = await memoryStore.getEvents({})
        }

        const format = req.query.format || 'json'

        if (format === 'csv') {
            const fields = ['eventId', 'sessionId', 'userEmail', 'eventType', 'eventCategory', 'mood', 'path', 'timestamp']
            const csvRows = [fields.join(',')]

            events.forEach(e => {
                const row = [
                    `"${e.eventId || ''}"`,
                    `"${e.sessionId || ''}"`,
                    `"${e.userEmail || ''}"`,
                    `"${e.eventType || ''}"`,
                    `"${e.eventCategory || ''}"`,
                    `"${e.mood || ''}"`,
                    `"${e.path || ''}"`,
                    `"${new Date(e.timestamp).toISOString()}"`
                ]
                csvRows.push(row.join(','))
            })

            res.setHeader('Content-Type', 'text/csv')
            res.setHeader('Content-Disposition', 'attachment; filename=vibesync_analytics_export.csv')
            return res.send(csvRows.join('\n'))
        }

        res.json(events)
    } catch (err) {
        res.status(500).json({ message: 'Export failed' })
    }
})

module.exports = router
