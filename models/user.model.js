const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
    },
    deviceToken: {
        type: String
    },
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date
    }
},
    {
        timestamps: false,
        versionKey: false
    }
)
    .index({ userName: 1 })
    .index({ emailId: 1 })


userSchema.methods.verifyPassword = async function (inputPasswordByUser) {
    const user = this
    const passwordHash = user.password
    const isValidPassword = await bcrypt.compare(inputPasswordByUser, passwordHash)
    return isValidPassword
}

userSchema.methods.jwt = async function () {
    const user = this
    const token = await jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '10d' })
    return token

}

module.exports = mongoose.model('user', userSchema)