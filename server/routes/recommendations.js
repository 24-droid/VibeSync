const express = require('express')
const router = express.Router()
const axios = require('axios')
const authMiddleware = require('../middleware/auth')
const Groq = require('groq-sdk')

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Simple in-memory cache
const cache = new Map()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

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
        const limit = Math.min(parseInt(req.query.limit) || 12, 30)
        const offset = Math.max(parseInt(req.query.offset) || 0, 0)
        const promptOverride = req.query.prompt

        // Check cache
        const cacheKey = promptOverride 
            ? `${moodKey}-${lang}-${promptOverride.toLowerCase()}` 
            : `${moodKey}-${lang}`
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
        let curationPrompt
        if (promptOverride) {
            curationPrompt = `Act as a world-class music curator and trend analyst in April 2026.
Recommend exactly 50 currently trending hit songs based on the user's specific request: "${promptOverride}".
The original detected visual vibe of the image was: "${moodKey}". Blend this context if relevant, but prioritize the user's request.
Target Language: "${lang}"

Requirements:
- It is currently early 2026. Prioritize massive hits from 2025 and new 2026 releases.
- ENSURE VAST DIVERSITY: Return a mix of global chart-toppers, rising viral stars, and critically acclaimed deep cuts. DO NOT return only the same top 5 artists.
- STRICT LANGUAGE ENFORCEMENT: Recommend ONLY songs in the "${lang}" language. DO NOT mix languages. If the language is "hindi", recommend exclusively Hindi songs (no English, no pure Punjabi). If the language is "punjabi", recommend exclusively Punjabi songs. If the language is "english", recommend exclusively English songs.

Return ONLY a valid JSON array of objects (no markdown, no explanation) in this format:
[
  { 
    "title": "Song Title", 
    "artist": "Artist Name", 
    "album": "Album Name (if applicable)", 
    "itunesQuery": "Optimized search query for iTunes API" 
  }
]`
        } else {
            curationPrompt = `Act as a world-class music curator and trend analyst in April 2026.
Recommend exactly 50 currently trending hit songs for a "${moodKey}" mood in "${lang}" language.

Musical Fingerprint for "${moodKey}": ${moodInstruction}

Requirements:
- It is currently early 2026. Prioritize massive hits from 2025 and new 2026 releases.
- ENSURE VAST DIVERSITY: Return a mix of global chart-toppers, rising viral stars, and critically acclaimed deep cuts. DO NOT return only the same top 5 artists.
- STRICT LANGUAGE ENFORCEMENT: Recommend ONLY songs in the "${lang}" language. DO NOT mix languages. If the language is "hindi", recommend exclusively Hindi songs (no English, no pure Punjabi). If the language is "punjabi", recommend exclusively Punjabi songs. If the language is "english", recommend exclusively English songs.

Return ONLY a valid JSON array of objects (no markdown, no explanation) in this format:
[
  { 
    "title": "Song Title", 
    "artist": "Artist Name", 
    "album": "Album Name (if applicable)", 
    "itunesQuery": "Optimized search query for iTunes API" 
  }
]`
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: curationPrompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.85,
            max_tokens: 8000,
        })

        const text = chatCompletion.choices[0].message.content.trim()
        const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
        let trendingList = JSON.parse(jsonText)

        // SHUFFLE the list to ensure diversity even if Groq returns similar content
        trendingList = shuffleArray(trendingList)

        // Step 2: Fetch metadata with smart fallback
        // For Hindi/Punjabi: search IN store with broader queries since iTunes catalog is thin
        const country = lang === 'english' ? 'US' : 'IN'
        const isIndian = lang === 'hindi' || lang === 'punjabi'
        
        // Language-specific YouTube suffix for better search results
        const ytSuffix = {
            english: 'official music video',
            hindi: 'official video',
            punjabi: 'official video'
        }[lang] || 'official audio'

        const fetchTrackMetadata = async (item) => {
            // Build multiple query strategies, try each in order
            const queries = [
                item.itunesQuery,
                `${item.artist} ${item.title}`,
                item.title,
            ].filter(Boolean)

            for (const query of queries) {
                try {
                    const { data } = await axios.get('https://itunes.apple.com/search', {
                        params: {
                            term: query,
                            entity: 'song',
                            limit: isIndian ? 3 : 1, // fetch 3 results for Indian to pick best match
                            media: 'music',
                            country,
                            ...(isIndian && { lang: lang === 'hindi' ? 'hi' : 'pa' })
                        },
                        timeout: 5000,
                    })

                    if (data.results && data.results.length > 0) {
                        // For Indian languages, prefer result whose artist name most closely matches
                        let t = data.results[0]
                        if (isIndian && data.results.length > 1) {
                            const artistLower = item.artist.toLowerCase()
                            const better = data.results.find(r =>
                                r.artistName?.toLowerCase().includes(artistLower.split(' ')[0]) ||
                                artistLower.includes(r.artistName?.toLowerCase().split(' ')[0])
                            )
                            if (better) t = better
                        }

                        return {
                            id: String(t.trackId),
                            title: t.trackName || item.title,
                            artist: t.artistName || item.artist,
                            album: t.collectionName || item.album || '',
                            albumArt: t.artworkUrl100?.replace('100x100', '600x600') || null,
                            previewUrl: t.previewUrl || null,
                            externalUrl: t.trackViewUrl || null,
                            youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.artist + ' ' + item.title + ' ' + ytSuffix)}`,
                            duration: t.trackTimeMillis || 0,
                            isTrending: true,
                            mood: moodKey
                        }
                    }
                } catch (_) {
                    // Try next query strategy
                }
            }
            return null // All queries failed
        }

        const trackPromises = trendingList.map(async (item) => {
            try {
                const result = await fetchTrackMetadata(item)
                if (result) return result

                // Final fallback: use Groq AI metadata with a correct YouTube link
                return {
                    id: `ai-${Buffer.from(item.title + item.artist).toString('hex').slice(0, 10)}`,
                    title: item.title,
                    artist: item.artist,
                    album: item.album || '',
                    albumArt: null,
                    previewUrl: null,
                    externalUrl: null,
                    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.artist + ' ' + item.title + ' ' + ytSuffix)}`,
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

// ── GET /api/recommendations/global-trending ───────────────────────────────
router.get('/global-trending', authMiddleware, async (req, res) => {
    try {
        const cacheKey = 'global-trending-v4'
        const cached = cache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return res.json(cached.data)
        }

        const FEEDS = [
            'https://itunes.apple.com/us/rss/topsongs/limit=15/json',
            'https://itunes.apple.com/in/rss/topsongs/limit=15/json'
        ]

        const feedResponses = await Promise.all(FEEDS.map(url => axios.get(url).catch(() => null)))

        const [usRes, inRes] = feedResponses
        const usEntries = usRes?.data?.feed?.entry || []
        const inEntries = inRes?.data?.feed?.entry || []

        const interleaved = []
        const maxLen = Math.max(usEntries.length, inEntries.length)
        for (let i = 0; i < maxLen; i++) {
            if (usEntries[i]) interleaved.push(usEntries[i])
            if (inEntries[i]) interleaved.push(inEntries[i])
        }

        // De-duplicate by track ID and transform
        const seenIds = new Set()
        const tracks = interleaved
            .map(entry => {
                const trackId = entry.id?.attributes?.['im:id']
                if (!trackId || seenIds.has(trackId)) return null
                seenIds.add(trackId)

                return {
                    id: String(trackId),
                    title: entry['im:name']?.label,
                    artist: entry['im:artist']?.label,
                    albumArt: entry['im:image']?.[2]?.label?.replace('170x170', '600x600') || null,
                    previewUrl: entry.link?.[1]?.attributes?.href || null,
                    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(entry['im:artist']?.label + ' ' + entry['im:name']?.label + ' official audio')}`,
                    isTrending: true,
                }
            })
            .filter(t => t !== null)
            .slice(0, 15)
            .map((track, index) => ({
                ...track,
                score: 100 - (index * 2)
            }))

        cache.set(cacheKey, { data: tracks, timestamp: Date.now() })
        res.json(tracks)
    } catch (err) {
        console.error('[global-trending]', err.message)
        res.status(500).json({ message: 'Failed to fetch global trending from iTunes' })
    }
})

module.exports = router
