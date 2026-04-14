const express = require('express')
const router = express.Router()
const Collection = require('../models/Collection')
const authMiddleware = require('../middleware/auth')

// ── GET /api/collections (List all) ──────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
    try {
        const collections = await Collection.find({ userId: req.user._id }).sort({ updatedAt: -1 })
        res.json(collections)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch collections' })
    }
})

// ── POST /api/collections (Create) ───────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body
        const collection = new Collection({
            name,
            description,
            userId: req.user._id,
            songs: []
        })
        await collection.save()
        res.status(201).json(collection)
    } catch (err) {
        res.status(500).json({ message: 'Failed to create collection' })
    }
})

// ── GET /api/collections/:id (Details) ──────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const collection = await Collection.findOne({ _id: req.params.id, userId: req.user._id })
        if (!collection) return res.status(404).json({ message: 'Collection not found' })
        res.json(collection)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch collection' })
    }
})

// ── POST /api/collections/:id/songs (Add song) ───────────────────────────────
router.post('/:id/songs', authMiddleware, async (req, res) => {
    try {
        const { song } = req.body
        const collection = await Collection.findOne({ _id: req.params.id, userId: req.user._id })
        if (!collection) return res.status(404).json({ message: 'Collection not found' })

        // Avoid duplicates
        if (collection.songs.find(s => s.id === song.id)) {
            return res.status(400).json({ message: 'Song already in collection' })
        }

        collection.songs.push(song)
        await collection.save()
        res.json(collection)
    } catch (err) {
        res.status(500).json({ message: 'Failed to add song' })
    }
})

// ── DELETE /api/collections/:id (Delete) ─────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const result = await Collection.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
        if (!result) return res.status(404).json({ message: 'Collection not found' })
        res.json({ message: 'Collection deleted' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete collection' })
    }
})

module.exports = router
