const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [2, 'Username must be at least 2 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
    },
    { timestamps: true }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    try {
        const salt = await bcrypt.genSalt(12)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (err) {
        next(err)
    }
})

// Compare plain password with hashed
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

// Strip password from JSON responses
userSchema.methods.toJSON = function () {
    const obj = this.toObject()
    delete obj.password
    return obj
}

module.exports = mongoose.model('User', userSchema)
