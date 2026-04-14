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

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

        const prompt = `Analyze this image and determine the emotional mood it conveys.
Return ONLY a valid JSON object (no markdown, no explanation) in exactly this format:
{
  "mood": "one of: Happy, Sad, Energetic, Calm, Melancholic, Romantic, Peaceful, Angry, Nostalgic, Mysterious",
  "confidence": 0.9,
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "description": "one sentence describing the emotional atmosphere of this image"
}`

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
        const parsed = JSON.parse(jsonText)

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

module.exports = router
