const { required } = require('joi')
const mongoose = require('mongoose')
const { Types } = mongoose
const { ObjectId } = Types

const monthlyTargetSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    targetAmount: {
        type: Number,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });


const existInvestmentSchema = new mongoose.Schema({
    investmentType: {
        type: String,
        enum: ['Gold', 'Stock', 'Crypto', 'Other'],
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    investAmount: {
        type: Number,
        required: true
    },
    investDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String
    }
}, { _id: false })


const groupInvestmentSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    monthlyTarget: {
        type: Number
    },
    monthlyTargetHistory: {
        type: [monthlyTargetSchema],
        default: []
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Delete'],
        default: 'Active'
    },
    createdBy: {
        type: ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date
    },
    existTotalAmount: {
        type: Number,
        default: 0
    },
    existInvest: {
        type: Boolean,
        default: false
    },
    existingInvestment: {
        type: [existInvestmentSchema],
        default: []
    }

},
    {
        timestamps: false,
        versionKey: false
    }
)
groupInvestmentSchema.index({ groupName: 1 })


module.exports = mongoose.model('group', groupInvestmentSchema)