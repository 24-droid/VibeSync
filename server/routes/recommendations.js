const express = require('express')
const router = express.Router()
const axios = require('axios')
const authMiddleware = require('../middleware/auth')

// ── Per-language mood search queries ───────────────────────────────────────
const QUERIES = {
    english: {
        energetic: 'dance pop upbeat EDM hits',
        happy: 'happy feel good pop sunshine',
        calm: 'calm relaxing acoustic indie',
        sad: 'sad emotional heartbreak',
        melancholic: 'melancholic alternative introspective',
        romantic: 'romantic love soul R&B',
        peaceful: 'peaceful ambient nature',
        angry: 'rock intense metal rage',
        nostalgic: 'classic 80s 90s retro pop',
        mysterious: 'dark atmospheric cinematic',
        uplifting: 'uplifting motivational inspiring',
        empowering: 'empowering confident anthems',
    },
    hindi: {
        energetic: 'bollywood dance party 2024',
        happy: 'bollywood happy songs Neha Kakkar',
        calm: 'Arijit Singh soft romantic hindi',
        sad: 'Arijit Singh sad hindi songs',
        melancholic: 'Atif Aslam hindi sad emotional',
        romantic: 'bollywood romantic love songs',
        peaceful: 'hindi sufi shanti peaceful',
        angry: 'Raftaar DIVINE hindi rap',
        nostalgic: 'bollywood 90s classic retro hindi',
        mysterious: 'bollywood suspense background score',
        uplifting: 'A R Rahman motivational hindi',
        empowering: 'Sunidhi Chauhan strong hindi songs',
    },
    punjabi: {
        energetic: 'Diljit Dosanjh punjabi party bhangra',
        happy: 'Guru Randhawa punjabi happy songs',
        calm: 'AP Dhillon slow punjabi songs',
        sad: 'Sidhu Moose Wala sad punjabi',
        melancholic: 'punjabi slow sad emotional songs',
        romantic: 'Satinder Sartaaj punjabi romantic',
        peaceful: 'Nooran Sisters punjabi sufi calm',
        angry: 'punjabi rap hard intense',
        nostalgic: 'punjabi old classic folk retro',
        mysterious: 'punjabi dark moody songs',
        uplifting: 'Diljit Dosanjh punjabi motivational',
        empowering: 'punjabi independent strong power',
    },
}

// ── GET /api/recommendations?mood=Happy&lang=hindi&limit=9&offset=0 ─────────
router.get('/', authMiddleware, async (req, res) => {
    try {
        const moodKey = (req.query.mood || 'energetic').toLowerCase()
        const lang = (req.query.lang || 'english').toLowerCase()
        const limit = Math.min(parseInt(req.query.limit) || 9, 20)
        const offset = Math.max(parseInt(req.query.offset) || 0, 0)

        const langQueries = QUERIES[lang] || QUERIES.english
        const query = langQueries[moodKey] || langQueries.energetic

        let allTracks = []

        if (lang === 'english') {
            // ── iTunes US — best for English ────────────────────────────────────
            const { data } = await axios.get('https://itunes.apple.com/search', {
                params: { term: query, entity: 'song', limit: 50, media: 'music', country: 'US' },
                timeout: 10000,
            })
            allTracks = (data.results || []).map(t => ({
                id: String(t.trackId),
                title: t.trackName,
                artist: t.artistName,
                album: t.collectionName || '',
                albumArt: t.artworkUrl100?.replace('100x100', '300x300') || null,
                previewUrl: t.previewUrl || null,
                spotifyUrl: t.trackViewUrl || null,
                duration: t.trackTimeMillis || 0,
            }))
        } else {
            // ── iTunes India — Hindi / Punjabi ───────────────────────────────────
            const { data } = await axios.get('https://itunes.apple.com/search', {
                params: { term: query, entity: 'song', limit: 50, media: 'music', country: 'IN' },
                timeout: 10000,
            })
            allTracks = (data.results || []).map(t => ({
                id: String(t.trackId),
                title: t.trackName,
                artist: t.artistName,
                album: t.collectionName || '',
                albumArt: t.artworkUrl100?.replace('100x100', '300x300') || null,
                previewUrl: t.previewUrl || null,
                spotifyUrl: t.trackViewUrl || null,
                duration: t.trackTimeMillis || 0,
            }))
        }

        if (allTracks.length === 0) {
            return res.json({ mood: moodKey, tracks: [], hasMore: false })
        }

        const tracks = allTracks.slice(offset, offset + limit)
        const hasMore = allTracks.length > offset + limit
        res.json({ mood: moodKey, tracks, hasMore })
    } catch (err) {
        console.error('[recommendations]', err.message)
        res.status(500).json({ message: 'Failed to fetch recommendations: ' + err.message })
    }
})

module.exports = router
