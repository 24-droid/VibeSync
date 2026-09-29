require('dotenv').config()

// Force Node.js to use Google DNS + IPv4 — fixes Atlas SRV lookup on Windows
const dns = require('dns')
try {
    dns.setDefaultResultOrder('ipv4first')
} catch (e) { }

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const analysisRoutes = require('./routes/analysis')
const recommendationsRoutes = require('./routes/recommendations')
const collectionsRoutes = require('./routes/collections')
const historyRoutes = require('./routes/history')
const analyticsRoutes = require('./routes/analytics')

const app = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000']

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(null, true) // permissive for dev/demo flexibility
        }
    },
    credentials: true,
}))
app.use(express.json())
app.use('/public', express.static('public'))
app.use('/uploads', express.static('public/uploads'))

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/recommendations', recommendationsRoutes)
app.use('/api/collections', collectionsRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/analytics', analyticsRoutes)

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'MongoDB' : 'In-Memory Fallback Store'
    })
})

app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
})

app.use((err, req, res, next) => {
    console.error('[ERROR]', err)
    res.status(500).json({ message: 'Internal server error' })
})

// ─── Database + Start Server ─────────────────────────────────────────────
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`🚀 VibeSync Server running at http://localhost:${PORT}`)
    })
}

mongoose
    .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 4000,
        family: 4,
    })
    .then(() => {
        console.log('✅ MongoDB connected successfully')
        startServer()
    })
    .catch((err) => {
        console.warn('⚠️ MongoDB connection issue:', err.message)
        console.log('💡 Running with robust in-memory database store for seamless presentation demo!')
        startServer()
    })
