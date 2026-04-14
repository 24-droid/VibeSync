const express = require('express')
const router = express.Router()
const axios = require('axios')
const authMiddleware = require('../middleware/auth')
const Groq = require('groq-sdk')

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Simple in-memory cache
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Helper: Fisher-Yates Shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

// ── GET /api/recommendations?mood=Happy&lang=hindi&limit=9&offset=0 ─────────
router.get('/', authMiddleware, async (req, res) => {
    try {
        const moodKey = (req.query.mood || 'energetic').toLowerCase()
        const lang = (req.query.lang || 'english').toLowerCase()
        const limit = Math.min(parseInt(req.query.limit) || 9, 20)
        const offset = Math.max(parseInt(req.query.offset) || 0, 0)

        // Check cache
        const cacheKey = `${moodKey}-${lang}`
        const cached = cache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            const tracks = cached.data.slice(offset, offset + limit)
            const hasMore = cached.data.length > offset + limit
            return res.json({ mood: moodKey, tracks, hasMore })
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ message: 'Groq API key not configured' })
        }

        // Define "Musical Fingerprints" for forced diversity
        const moodProfiles = {
            happy: "Upbeat, major keys, high BPM (>120), vibrant and optimistic production.",
            energetic: "Very high energy, driving rhythms, synth-heavy or dance-floor ready hits.",
            calm: "Ambient, acoustic, soft vocals, low BPM (<90), relaxing and minimal production.",
            peaceful: "Zen-like, nature-inspired, purely instrumental or whisper-quiet ballads.",
            sad: "Minor keys, emotional depth, soulful arrangements, piano or string-heavy.",
            melancholic: "Indie/Alternative, moody synths, introspective lyrics, mid-to-low tempo.",
            romantic: "Lush production, mid-tempo love songs, R&B or soft-pop influence.",
            angry: "Aggressive beats, intense vocals, distorted guitars or heavy bass."
        }

        const moodInstruction = moodProfiles[moodKey] || "Match the general vibe of the mood."

        // Step 1: Use Groq to curate TRENDING song names with rich metadata
        const curationPrompt = `Act as a world-class music curator and trend analyst in April 2026.
Recommend 30 currently trending hit songs for a "${moodKey}" mood in "${lang}" language.

Musical Fingerprint for "${moodKey}": ${moodInstruction}

Requirements:
- It is currently early 2026. Prioritize massive hits from 2025 and new 2026 releases.
- ENSURE VAST DIVERSITY: Return a mix of global chart-toppers, rising viral stars, and critically acclaimed deep cuts. DO NOT return only the same top 5 artists.
- For Hindi: Include latest Bollywood, Indie-Pop, and viral T-Series releases.
- For Punjabi: Include latest from Diljit, Karan Aujla, Shubh, AP Dhillon, etc.
- For English: Billboard Top 100, TikTok virals, and fresh streaming hits.

Return ONLY a valid JSON array of objects (no markdown, no explanation) in this format:
[
  { 
    "title": "Song Title", 
    "artist": "Artist Name", 
    "album": "Album Name (if applicable)", 
    "itunesQuery": "Optimized search query for iTunes API" 
  }
]`

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: curationPrompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 1.0, // Maximum variety
        })

        const text = chatCompletion.choices[0].message.content.trim()
        const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
        let trendingList = JSON.parse(jsonText)

        // SHUFFLE the list to ensure diversity even if Groq returns similar content
        trendingList = shuffleArray(trendingList)

        // Step 2: Fetch metadata with smart fallback
        const country = lang === 'english' ? 'US' : 'IN'
        const trackPromises = trendingList.map(async (item) => {
            try {
                // Primary search using rich query
                const query = item.itunesQuery || `${item.artist} ${item.title}`
                const { data } = await axios.get('https://itunes.apple.com/search', {
                    params: { term: query, entity: 'song', limit: 1, media: 'music', country },
                    timeout: 4000,
                })

                if (data.results && data.results.length > 0) {
                    const t = data.results[0]
                    return {
                        id: String(t.trackId),
                        title: t.trackName,
                        artist: t.artistName,
                        album: t.collectionName || item.album || '',
                        albumArt: t.artworkUrl100?.replace('100x100', '600x600') || null,
                        previewUrl: t.previewUrl || null,
                        externalUrl: t.trackViewUrl || null,
                        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(t.artistName + ' ' + t.trackName + ' official audio')}`,
                        duration: t.trackTimeMillis || 0,
                        isTrending: true,
                        mood: moodKey
                    }
                }

                // Fallback: Use Groq metadata if iTunes fails
                return {
                    id: `ai-${Buffer.from(item.title).toString('hex').slice(0, 8)}`,
                    title: item.title,
                    artist: item.artist,
                    album: item.album || '',
                    albumArt: null,
                    previewUrl: null,
                    externalUrl: null,
                    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.artist + ' ' + item.title + (lang === 'english' ? ' official video' : ' official audio'))}`,
                    duration: 0,
                    isTrending: true,
                    mood: moodKey
                }
            } catch (e) {
                return null
            }
        })

        const allTracks = (await Promise.all(trackPromises)).filter(t => t !== null)

        // Save to cache
        cache.set(cacheKey, { data: allTracks, timestamp: Date.now() })

        if (allTracks.length === 0) {
            return res.json({ mood: moodKey, tracks: [], hasMore: false })
        }

        const tracks = allTracks.slice(offset, offset + limit)
        const hasMore = allTracks.length > offset + limit

        res.json({ mood: moodKey, tracks, hasMore })
    } catch (err) {
        console.error('[recommendations]', err.message)
        res.status(500).json({ message: 'Failed to fetch trending recommendations: ' + err.message })
    }
})

module.exports = router
