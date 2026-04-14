const express = require('express')
const router = express.Router()
const Analysis = require('../models/Analysis')
const authMiddleware = require('../middleware/auth')

// ── GET /api/history ─────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
    try {
        const history = await Analysis.find({ userId: req.user._id }).sort({ createdAt: -1 })
        res.json(history)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch history' })
    }
})

// ── DELETE /api/history/:id ──────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const result = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
        if (!result) return res.status(404).json({ message: 'Entry not found' })
        res.json({ message: 'Entry deleted' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete entry' })
    }
})

module.exports = router
