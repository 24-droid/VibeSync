const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

// Helper: generate signed JWT
function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })
}

// ─── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        // Check duplicates
        const existingEmail = await User.findOne({ email: email.toLowerCase() })
        if (existingEmail) {
            return res.status(409).json({ message: 'An account with this email already exists' })
        }
        const existingUsername = await User.findOne({ username })
        if (existingUsername) {
            return res.status(409).json({ message: 'That username is already taken' })
        }

        const user = await User.create({ username, email, password })
        const token = generateToken(user._id)

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: user.toJSON(),
        })
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message)
            return res.status(400).json({ message: messages[0] })
        }
        console.error('[register]', err)
        res.status(500).json({ message: 'Server error, please try again' })
    }
})

// ─── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const token = generateToken(user._id)

        res.json({
            message: 'Login successful',
            token,
            user: user.toJSON(),
        })
    } catch (err) {
        console.error('[login]', err)
        res.status(500).json({ message: 'Server error, please try again' })
    }
})

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user.toJSON() })
})

module.exports = router
