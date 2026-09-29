const mongoose = require('mongoose')

const analyticsEventSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            index: true,
        },
        sessionId: {
            type: String,
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            index: true,
        },
        userEmail: String,
        eventType: {
            type: String,
            required: true,
            enum: [
                'page_view',
                'session_start',
                'mood_input',
                'vibe_analysis',
                'recommendation_click',
                'song_play',
                'song_save',
                'collection_create',
                'search_executed',
                'trending_view',
                'collection_view',
                'recommendation_feedback'
            ],
            index: true,
        },
        eventCategory: {
            type: String,
            enum: ['navigation', 'engagement', 'mood', 'recommendation', 'system'],
            default: 'engagement',
        },
        mood: {
            type: String,
            index: true,
        },
        path: String,
        referrer: String,
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        device: {
            browser: String,
            os: String,
            deviceType: String,
            screenSize: String,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema)
