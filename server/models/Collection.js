const mongoose = require('mongoose')

const collectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Collection name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        songs: [
            {
                id: String,
                title: String,
                artist: String,
                album: String,
                albumArt: String,
                previewUrl: String,
                externalUrl: String,
                youtubeUrl: String,
                duration: Number,
                mood: String,
            },
        ],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Collection', collectionSchema)
