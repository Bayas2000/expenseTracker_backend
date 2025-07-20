const { required } = require('joi')
const mongoose = require('mongoose')
const { Types } = mongoose
const { ObjectId } = Types

const recurringSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: false
    },
    dueDate: {
        type: Date,
        required: true
    },
    notes: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdAt: {
        type: Date,
        required: true
    },
    createdBy: {
        type: ObjectId,
        required: true
    }

})

module.exports = mongoose.model('recurring', recurringSchema)