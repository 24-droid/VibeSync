const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Collection = require('../models/Collection')
const memoryStore = require('../utils/memoryStore')
const authMiddleware = require('../middleware/auth')

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1

// ── GET /api/collections (List all) ──────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id
        if (isDbConnected()) {
            const collections = await Collection.find({ userId }).sort({ updatedAt: -1 })
            return res.json(collections)
        } else {
            const collections = await memoryStore.getCollectionsByUser(userId)
            return res.json(collections)
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch collections' })
    }
})

// ── POST /api/collections (Create) ───────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body
        const userId = req.user._id || req.user.id

        if (isDbConnected()) {
            const collection = new Collection({
                name,
                description,
                userId,
                songs: []
            })
            await collection.save()
            return res.status(201).json(collection)
        } else {
            const collection = await memoryStore.createCollection({
                name,
                description,
                userId,
                songs: []
            })
            return res.status(201).json(collection)
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to create collection' })
    }
})

// ── GET /api/collections/:id (Details) ──────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id
        if (isDbConnected()) {
            const collection = await Collection.findOne({ _id: req.params.id, userId })
            if (!collection) return res.status(404).json({ message: 'Collection not found' })
            return res.json(collection)
        } else {
            const collection = await memoryStore.getCollectionById(req.params.id)
            if (!collection || String(collection.userId) !== String(userId)) {
                return res.status(404).json({ message: 'Collection not found' })
            }
            return res.json(collection)
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch collection' })
    }
})

// ── POST /api/collections/:id/songs (Add song) ───────────────────────────────
router.post('/:id/songs', authMiddleware, async (req, res) => {
    try {
        const { song } = req.body
        const userId = req.user._id || req.user.id

        if (isDbConnected()) {
            const collection = await Collection.findOne({ _id: req.params.id, userId })
            if (!collection) return res.status(404).json({ message: 'Collection not found' })

            if (collection.songs.find(s => s.id === song.id)) {
                return res.status(400).json({ message: 'Song already in collection' })
            }

            collection.songs.push(song)
            await collection.save()
            return res.json(collection)
        } else {
            const collection = await memoryStore.getCollectionById(req.params.id)
            if (!collection || String(collection.userId) !== String(userId)) {
                return res.status(404).json({ message: 'Collection not found' })
            }

            if (collection.songs.find(s => s.id === song.id)) {
                return res.status(400).json({ message: 'Song already in collection' })
            }

            collection.songs.push(song)
            await memoryStore.updateCollection(req.params.id, { songs: collection.songs })
            return res.json(collection)
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to add song' })
    }
})

// ── DELETE /api/collections/:id (Delete) ─────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id
        if (isDbConnected()) {
            const result = await Collection.findOneAndDelete({ _id: req.params.id, userId })
            if (!result) return res.status(404).json({ message: 'Collection not found' })
            return res.json({ message: 'Collection deleted' })
        } else {
            const result = await memoryStore.deleteCollection(req.params.id)
            if (!result) return res.status(404).json({ message: 'Collection not found' })
            return res.json({ message: 'Collection deleted' })
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete collection' })
    }
})

module.exports = router
