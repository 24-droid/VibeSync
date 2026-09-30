const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Analysis = require('../models/Analysis')
const memoryStore = require('../utils/memoryStore')
const authMiddleware = require('../middleware/auth')

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1

// ── GET /api/history ─────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id
        if (isDbConnected()) {
            const history = await Analysis.find({ userId }).sort({ createdAt: -1 })
            return res.json(history)
        } else {
            const history = await memoryStore.getAnalysesByUser(userId)
            return res.json(history)
        }
    } catch (err) {
        console.error('[history GET error]', err)
        res.status(500).json({ message: 'Failed to fetch history' })
    }
})

// ── DELETE /api/history/:id ──────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id
        if (isDbConnected()) {
            const result = await Analysis.findOneAndDelete({ _id: req.params.id, userId })
            if (!result) return res.status(404).json({ message: 'Entry not found' })
            return res.json({ message: 'Entry deleted' })
        } else {
            const index = memoryStore.analyses.findIndex(a => String(a._id) === String(req.params.id) && String(a.userId) === String(userId))
            if (index !== -1) {
                memoryStore.analyses.splice(index, 1)
                return res.json({ message: 'Entry deleted' })
            }
            return res.status(404).json({ message: 'Entry not found' })
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete entry' })
    }
})

module.exports = router
