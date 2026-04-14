const mongoose = require('mongoose')

const analysisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        mood: {
            type: String,
            required: true,
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
        },
        colors: [String],
        description: String,
        imageUrl: String,
        songs: [
            {
                id: String,
                title: String,
                artist: String,
                albumArt: String,
                previewUrl: String,
                youtubeUrl: String
            }
        ]
    },
    { timestamps: true }
)

module.exports = mongoose.model('Analysis', analysisSchema)
