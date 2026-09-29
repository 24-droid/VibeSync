const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const memoryStore = require('../utils/memoryStore')
const authMiddleware = require('../middleware/auth')

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1

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

        if (isDbConnected()) {
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

            return res.status(201).json({
                message: 'Account created successfully',
                token,
                user: user.toJSON(),
            })
        } else {
            const existingEmail = await memoryStore.findUserByEmail(email)
            if (existingEmail) {
                return res.status(409).json({ message: 'An account with this email already exists' })
            }
            const existingUsername = await memoryStore.findUserByUsername(username)
            if (existingUsername) {
                return res.status(409).json({ message: 'That username is already taken' })
            }

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
            const user = await memoryStore.createUser({
                username,
                email: email.toLowerCase(),
                password: hashedPassword
            })
            const token = generateToken(user._id)

            return res.status(201).json({
                message: 'Account created successfully',
                token,
                user: user.toJSON(),
            })
        }
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

        if (isDbConnected()) {
            const user = await User.findOne({ email: email.toLowerCase() })
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' })
            }

            const isMatch = await user.comparePassword(password)
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' })
            }

            const token = generateToken(user._id)

            return res.json({
                message: 'Login successful',
                token,
                user: user.toJSON(),
            })
        } else {
            const user = await memoryStore.findUserByEmail(email)
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' })
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' })
            }

            const token = generateToken(user._id)

            return res.json({
                message: 'Login successful',
                token,
                user: user.toJSON(),
            })
        }
    } catch (err) {
        console.error('[login]', err)
        res.status(500).json({ message: 'Server error, please try again' })
    }
})

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
    const userObj = typeof req.user.toJSON === 'function' ? req.user.toJSON() : req.user
    res.json({ user: userObj })
})

module.exports = router
