const groupModel = require('../../models/groupInvestment/group.model');
const groupMemberModel = require('../../models/groupInvestment/groupMember.model');
const userModel = require('../../models/user.model');

module.exports.create = async (req, inputData) => {
    try {
        const createdBy = req.userId;
        const user = await userModel.findOne({ _id: createdBy }).select('userName')
        console.log(user)

        const newGroup = new groupModel({
            ...inputData,
            createdBy,
            createdAt: new Date()
        });
        await newGroup.save();

        const adminEntry = new groupMemberModel({
            groupId: newGroup._id,
            userId: createdBy,
            memberName: user.userName,
            role: 'Admin',
            monthlyTarget: inputData.monthlyTarget || 0,
            inviteStatus: 'Accepted',
            status: 'Active',
            createdBy,
            createdAt: new Date()
        });
        await adminEntry.save();
        return newGroup;
    } catch (error) {
        console.error('Service File Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
};


module.exports.findExist = async (groupName) => {
    const exist = await groupModel.exists({ groupName })
    return exist
}

module.exports.getGroupMember = async (userId) => {
    const member = await groupMemberModel.distinct('groupId', {
        inviteStatus: "Accepted",
        userId: userId
    })
    console.log("member", member)
    return member
}

module.exports.getAllData = async (mainFilter) => {
    try {
        console.log(mainFilter)
        const aggregateQuery = [
            { $match: mainFilter },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "group_members",
                    localField: "_id",
                    foreignField: "groupId",
                    as: "groupMemberDetails"
                }
            },
            {
                $addFields: {
                    acceptMembers: {
                        $filter: {
                            input: "$groupMemberDetails",
                            as: "member",
                            cond: { $eq: ["$$member.inviteStatus", "Accepted"] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    existingInvestAmount: {
                        $first: "$existingInvestment.investAmount"
                    }
                }
            },
            {
                $addFields: {
                    groupBalance: {
                        $add: [

                            { $ifNull: ["$existTotalAmount", 0] },
                            { $ifNull: ["$existingInvestAmount", 0] }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    totalMembers: { $size: "$acceptMembers" }
                }
            },
            {
                $addFields: {
                    groupDetails: {
                        $map: {
                            input: "$acceptMembers",
                            as: "member",
                            in: {
                                _id: "$$member._id",
                                memberName: "$$member.memberName",
                                role: "$$member.role",
                                inviteStatus: "$$member.inviteStatus",
                                monthlyTarget:
                                    "$$member.monthlyTarget",
                                createdAt: "$$member.createdAt",
                                joinedDate : "$$member.joinedDate",
                                createdBy: "$$member.createdBy"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    groupMemberDetails: 0,
                    groupUserDetails: 0,
                    acceptMembers: 0,
                    existingInvestAmount: 0
                }
            }
        ]
        const queryResult = await groupModel.aggregate(aggregateQuery)
        return queryResult
    } catch (error) {
        console.error('Service File Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
}

module.exports.update = async (req, _id, updateData) => {
    try {
        const afterUpdate = await groupModel.findByIdAndUpdate(_id, {
            ...updateData,
            updatedAt: new Date()
        })
        console.log(afterUpdate)
        return afterUpdate


    } catch (error) {
        console.error('Service File Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
}

module.exports.delete = async (req, _id, status) => {
    try {
        const afterUpdate = await groupModel.findByIdAndUpdate(_id, {
            status,
            updatedAt: new Date()
        })
        console.log(afterUpdate)
        return afterUpdate


    } catch (error) {
        console.error('Service File Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
}



module.exports.findExist = async (name) => {
    const exist = await transactionModel.exists({ name })
    return exist
}