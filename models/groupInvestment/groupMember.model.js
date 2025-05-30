const { required } = require('joi')
const mongoose = require('mongoose')
const { Types } = mongoose
const { ObjectId } = Types


const groupMemberSchema = new mongoose.Schema({
    groupId: {
        type: ObjectId,
        required: true,
        ref: 'group'
    },
    userId: {
        type: ObjectId,
        required: true,
        ref: 'user'
    },
    memberName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Member'],
        required: true
    },
    inviteStatus: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Delete'],
        default: 'Active'
    },
    createdBy: {
        type: ObjectId,
        required: true,
        ref: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    joinedDate: {
        type: Date
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
groupMemberSchema.virtual('currentMonthlyTarget').get(function () {
    if (!this.monthlyTargetHistory || this.monthlyTargetHistory.length === 0) {
        return this.monthlyTarget;
    }
    const latest = this.monthlyTargetHistory[this.monthlyTargetHistory.length - 1];
    return latest.targetAmount;
});

groupMemberSchema.index({ memberName: 1 })
groupMemberSchema.index({ emailId: 1 })


module.exports = mongoose.model('group_members', groupMemberSchema)