const express = require('express')
const router = express.Router()
const multer = require('multer')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const authMiddleware = require('../middleware/auth')
const Analysis = require('../models/Analysis')

// ── Multer: memory storage (no disk writes) ───────────────────────────────
const upload = multer({
    storage: multer.memoryStorage(),
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

        // Convert buffer to base64
        const base64Image = req.file.buffer.toString('base64')
        const mimeType = req.file.mimetype

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

        const prompt = `Analyze this image and determine the emotional mood it conveys.

Return ONLY a valid JSON object (no markdown, no explanation) in exactly this format:
{
  "mood": "one of: Happy, Sad, Energetic, Calm, Melancholic, Romantic, Peaceful, Angry, Nostalgic, Mysterious",
  "confidence": 0.0 to 1.0,
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "description": "one sentence describing the emotional atmosphere of this image"
}

Rules:
- mood must be exactly one of the listed options
- colors should be 5 dominant hex color codes from the image
- confidence should reflect how clearly the mood is conveyed
- description should be evocative and music-relevant`

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

        // Strip markdown code blocks if Gemini wraps it
        const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
        const parsed = JSON.parse(jsonText)

        // Validate required fields
        const { mood, confidence, colors, description } = parsed
        if (!mood || confidence === undefined || !colors) {
            throw new Error('Incomplete response from Gemini')
        }

        // Save to database for history
        const analysis = await Analysis.create({
            userId: req.user._id,
            mood,
            confidence: Math.min(1, Math.max(0, confidence)),
            colors: colors.slice(0, 5),
            description,
        })

        res.json({
            id: analysis._id,
            mood: analysis.mood,
            confidence: analysis.confidence,
            colors: analysis.colors,
            description: analysis.description,
        })
    } catch (err) {
        console.error('[analysis/mood]', err.message)

        if (err instanceof SyntaxError) {
            return res.status(500).json({ message: 'Failed to parse AI response. Please try again.' })
        }
        if (err.message?.includes('API_KEY')) {
            return res.status(500).json({ message: 'Invalid Gemini API key. Check server/.env' })
        }

        res.status(500).json({ message: err.message || 'Analysis failed. Please try again.' })
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
