const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../models/User')
const memoryStore = require('../utils/memoryStore')

module.exports = async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' })
        }

        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        let user = null
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            user = await User.findById(decoded.userId)
        } else {
            user = await memoryStore.findUserById(decoded.userId)
        }

        if (!user) {
            return res.status(401).json({ message: 'User not found' })
        }

        req.user = user
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired, please log in again' })
        }
        return res.status(401).json({ message: 'Invalid token' })
    }
}
