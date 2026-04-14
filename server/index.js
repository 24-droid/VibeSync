require('dotenv').config()

// Force Node.js to use Google DNS + IPv4 — fixes Atlas SRV lookup on Windows
const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const analysisRoutes = require('./routes/analysis')
const recommendationsRoutes = require('./routes/recommendations')
const collectionsRoutes = require('./routes/collections')
const historyRoutes = require('./routes/history')

const app = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() })
})

app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
})

app.use((err, req, res, next) => {
    console.error('[ERROR]', err)
    res.status(500).json({ message: 'Internal server error' })
})

// ─── Database + Start ─────────────────────────────────────────────────────
mongoose
    .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        family: 4,
    })
    .then(() => {
        console.log('✅ MongoDB connected')
        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`)
        })
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message)
        process.exit(1)
    })
