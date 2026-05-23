const express = require('express')
const router = express.Router()
const multer = require('multer')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const authMiddleware = require('../middleware/auth')
const Analysis = require('../models/Analysis')

const fs = require('fs')
const path = require('path')

// ── Multer: disk storage ───────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads'
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true)
        else cb(new Error('Only image files are allowed'), false)
    },
})

// ── Gemini client ──────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ── POST /api/analysis/mood ────────────────────────────────────────────────
router.post('/mood', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' })
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'Gemini API key not configured' })
        }

        // Convert file on disk to base64 for Gemini
        const filePath = req.file.path
        const imageBuffer = fs.readFileSync(filePath)
        const base64Image = imageBuffer.toString('base64')
        const mimeType = req.file.mimetype

        const prompt = `Analyze this image and determine the emotional mood it conveys.
Return ONLY a valid JSON object (no markdown, no explanation) in exactly this format:
{
  "mood": "one of: Happy, Sad, Energetic, Calm, Melancholic, Romantic, Peaceful, Angry, Nostalgic, Mysterious",
  "confidence": 0.9,
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "description": "one sentence describing the emotional atmosphere of this image"
}`

        let parsed
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType,
                        data: base64Image,
                    },
                },
            ])

            const text = result.response.text().trim()
            const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
            parsed = JSON.parse(jsonText)
        } catch (err) {
            console.warn(`[Gemini Error: ${err.message || 'Service Unavailable'}]. Falling back to Groq Llama Vision...`)
            if (process.env.GROQ_API_KEY) {
                const Groq = require('groq-sdk')
                const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
                
                const chatCompletion = await groqClient.chat.completions.create({
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: prompt },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${mimeType};base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    model: "meta-llama/llama-4-scout-17b-16e-instruct",
                    temperature: 0.2
                })

                const text = chatCompletion.choices[0].message.content.trim()
                const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
                parsed = JSON.parse(jsonText)
            } else {
                throw err
            }
        }

        const { mood, confidence, colors, description } = parsed

        // Save to database for history
        const analysis = await Analysis.create({
            userId: req.user._id,
            mood,
            confidence: Math.min(1, Math.max(0, confidence)),
            colors: colors.slice(0, 5),
            description,
            imageUrl: `/uploads/${req.file.filename}`,
            songs: []
        })

        res.json({
            id: analysis._id,
            mood: analysis.mood,
            confidence: analysis.confidence,
            colors: analysis.colors,
            description: analysis.description,
            imageUrl: analysis.imageUrl
        })
    } catch (err) {
        console.error('[analysis/mood]', err.message)
        res.status(500).json({ message: err.message || 'Analysis failed' })
    }
})

// ── PATCH /api/analysis/:id/songs (Update history with recommendations) ──────
router.patch('/:id/songs', authMiddleware, async (req, res) => {
    try {
        const { songs } = req.body
        const analysis = await Analysis.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: { songs: songs || [] } },
            { new: true }
        )
        if (!analysis) return res.status(404).json({ message: 'Analysis not found' })
        res.json(analysis)
    } catch (err) {
        res.status(500).json({ message: 'Failed to update history songs' })
    }
})

// ── POST /api/analysis/:id/refine ──────────────────────────────────────────
router.post('/:id/refine', authMiddleware, async (req, res) => {
    try {
        const { prompt, lang } = req.body
        const analysisId = req.params.id

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' })
        }

        const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user._id })
        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' })
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'Gemini API key not configured' })
        }

        const refinementPrompt = `The user uploaded an image that was analyzed to have the emotional mood: "${analysis.mood}" and description: "${analysis.description}".
The user didn't like this prediction or wants to refine the recommendations using this specific text prompt: "${prompt}".

Act as a world-class music curator and AI vibe-analyzer. Based on the user's prompt and original visual vibe, perform the following:
1. Determine a refined "mood" (e.g., Romantic, Peaceful, Nostalgic, Happy, Energetic, Calm, Melancholic, Angry, etc.) matching their request.
2. Write a customized, engaging description (1 sentence) for their refined mood (e.g. "A romantic escape inspired by your beautiful couple photo").
3. Recommend 30 currently trending hit songs (mix of massive 2025/2026 releases, global chart-toppers, rising stars) for this refined vibe in "${lang || 'english'}" language.

STRICT LANGUAGE ENFORCEMENT: Recommend ONLY songs in the "${lang || 'english'}" language. DO NOT mix languages. If the language is "hindi", recommend exclusively Hindi songs (no English, no pure Punjabi). If the language is "punjabi", recommend exclusively Punjabi songs. If the language is "english", recommend exclusively English songs.

Return ONLY a valid JSON object (no markdown, no explanation) in exactly this format:
{
  "mood": "Refined Mood",
  "description": "Refined Description",
  "songs": [
    { 
      "title": "Song Title", 
      "artist": "Artist Name", 
      "album": "Album Name (if applicable)", 
      "itunesQuery": "Optimized search query for iTunes API" 
    }
  ]
}`

        let parsed
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
            const result = await model.generateContent([refinementPrompt])
            const text = result.response.text().trim()
            const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
            parsed = JSON.parse(jsonText)
        } catch (err) {
            console.warn(`[Gemini Error: ${err.message || 'Service Unavailable'}]. Falling back to Groq Llama Text...`)
            if (process.env.GROQ_API_KEY) {
                const Groq = require('groq-sdk')
                const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
                
                const chatCompletion = await groqClient.chat.completions.create({
                    messages: [{ role: 'user', content: refinementPrompt }],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.2
                })

                const text = chatCompletion.choices[0].message.content.trim()
                const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
                parsed = JSON.parse(jsonText)
            } else {
                throw err
            }
        }

        const { mood: refinedMood, description: refinedDescription, songs: curatedSongs } = parsed

        const axios = require('axios')
        const country = (lang || 'english').toLowerCase() === 'english' ? 'US' : 'IN'

        const trackPromises = curatedSongs.slice(0, 30).map(async (item) => {
            try {
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
                        mood: refinedMood
                    }
                }

                return {
                    id: `ai-${Buffer.from(item.title).toString('hex').slice(0, 8)}`,
                    title: item.title,
                    artist: item.artist,
                    album: item.album || '',
                    albumArt: null,
                    previewUrl: null,
                    externalUrl: null,
                    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.artist + ' ' + item.title + ' official audio')}`,
                    duration: 0,
                    isTrending: true,
                    mood: refinedMood
                }
            } catch (e) {
                return null
            }
        })

        const tracks = (await Promise.all(trackPromises)).filter(t => t !== null)

        analysis.mood = refinedMood
        analysis.description = refinedDescription
        analysis.songs = tracks.map(t => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            albumArt: t.albumArt,
            previewUrl: t.previewUrl,
            youtubeUrl: t.youtubeUrl
        }))
        await analysis.save()

        res.json({
            id: analysis._id,
            mood: analysis.mood,
            confidence: 1.0,
            colors: analysis.colors,
            description: analysis.description,
            imageUrl: analysis.imageUrl,
            tracks: tracks
        })
    } catch (err) {
        console.error('[analysis/refine]', err.message)
        res.status(500).json({ message: err.message || 'Refinement failed' })
    }
})

// ── GET /api/analysis/history ──────────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const history = await Analysis.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
        res.json(history)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch history' })
    }
})

module.exports = router

