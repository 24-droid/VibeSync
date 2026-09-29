const mongoose = require('mongoose')

const analyticsSessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        userEmail: String,
        startTime: {
            type: Date,
            default: Date.now,
            index: true,
        },
        lastPing: {
            type: Date,
            default: Date.now,
        },
        durationSeconds: {
            type: Number,
            default: 0,
        },
        eventCount: {
            type: Number,
            default: 1,
        },
        entryPage: String,
        exitPage: String,
        device: {
            browser: String,
            os: String,
            deviceType: String,
            screenSize: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('AnalyticsSession', analyticsSessionSchema)
