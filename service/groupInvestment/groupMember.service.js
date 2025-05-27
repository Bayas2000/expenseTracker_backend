const groupModel = require('../../models/groupInvestment/group.model');
const groupMemberModel = require('../../models/groupInvestment/groupMember.model');
const groupNotificationModel = require('../../models/groupInvestment/groupNotification.model');
const userModel = require('../../models/user.model');

module.exports.adminCheck = async (req, groupId) => {
    const createdBy = req.userId
    const adminCheck = await groupMemberModel.findOne({
        groupId,
        userId: createdBy,
        role: 'Admin',
        inviteStatus: 'Accepted',
        status: 'Active'
    });

    console.log("adminCheckSevrice", adminCheck)
    return adminCheck
}
module.exports.inviteMembers = async (req, inputData) => {
    try {
        const { groupId, memberIds } = inputData;
        const createdBy = req.userId;
        const users = await userModel.find({ _id: { $in: memberIds } }).select('userName');
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = user.userName;
        });

        const invites = memberIds
            .filter(memberId => memberId !== String(createdBy))
            .map(memberId => ({
                groupId,
                userId: memberId,
                memberName: userMap[memberId] || 'Unknown',
                role: 'Member',
                inviteStatus: 'Pending',
                status: 'Inactive',
                createdBy,
                createdAt: new Date()
            }));

        const existingMembers = await groupMemberModel.find({
            groupId,
            userId: { $in: memberIds }
        }).select('userId');

        const existingUserIds = existingMembers.map(m => m.userId.toString());
        const filteredInvites = invites.filter(invite => !existingUserIds.includes(invite.userId));
        if (filteredInvites.length > 0) {
            await groupMemberModel.insertMany(filteredInvites);

            const notifications = filteredInvites.map(invite => ({
                userId: invite.userId,
                groupId,
                icon: "https://i.postimg.cc/90TbdjRs/add-friend-5113007.png",
                type: 'Invitation',
                message: `You've been invited to join the group "${inputData.groupName || ''}".`,
                readStatus: false,
                createdBy,
                createdAt: new Date()
            }));

            await groupNotificationModel.insertMany(notifications);
        }
        return { success: true, addedCount: filteredInvites.length, alreadyInvited: existingUserIds };
    } catch (error) {
        console.error('Invite Members Service Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
};
module.exports.MatchInviteMember = async (groupId, userId) => {
    const member = await groupMemberModel.findOne({ groupId, userId });
    return member
}
module.exports.respondToGroupInvite = async (groupId, userId, inviteResponse) => {
    try {
        const update = await groupMemberModel.updateOne(
            { groupId, userId },
            {
                $set: {
                    inviteStatus: inviteResponse,
                    status: inviteResponse === 'Accepted' ? 'Active' : 'Inactive',
                    updatedAt: new Date()
                }
            }
        );
        return update;
    } catch (error) {
        console.error('Invite Response Service Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
};
module.exports.getAllData = async (mainFilter) => {
    try {
        const aggregateQuery = [
            { $match: mainFilter },
            { $sort: { createdAt: - 1 } },
            {
                $lookup: {
                    from: "groups",
                    localField: "groupId",
                    foreignField: "_id",
                    as: "groupDetails"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $project: {
                    _id: 1,
                    groupId: 1,
                    groupName: { $first: "$groupDetails.groupName" },
                    userId: 1,
                    userName: { $first: "$userDetails.userName" },
                    role: 1,
                    inviteStatus: 1,
                    monthlyTarget: 1,
                    createdAt: 1,
                    createdBy: 1
                }
            }
        ]
        const queryResult = await groupMemberModel.aggregate(aggregateQuery)
        return queryResult
    } catch (error) {
        console.error('Service File Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
}
module.exports.amountDetails = async (mainFilter) => {
    try {
        console.log("mainFilter", mainFilter)
        const aggregateQuery = [
            { $match: mainFilter },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $lookup: {
                    from: "group_transactions",
                    localField: "_id",
                    foreignField: "memberId",
                    as: "groupTransactionDetails"
                }
            },
            {
                $addFields: {
                    monthWise: {
                        $map: {
                            input: "$groupTransactionDetails",
                            as: "trans",
                            in: {
                                month: {
                                    $arrayElemAt: [
                                        [
                                            "",
                                            "January",
                                            "February",
                                            "March",
                                            "April",
                                            "May",
                                            "June",
                                            "July",
                                            "August",
                                            "September",
                                            "October",
                                            "November",
                                            "December"
                                        ],
                                        {
                                            $month: "$$trans.investmentDate"
                                        }
                                    ]
                                },
                                year: {
                                    $year: "$$trans.investmentDate"
                                },
                                amount: "$$trans.amount",
                                investmentDate:
                                    "$$trans.investmentDate"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    memberName: { $first: "$userDetails.userName" },
                    monthWise: "$monthWise"
                }
            }
        ]
        const queryResult = await groupMemberModel.aggregate(aggregateQuery)
        return queryResult
    } catch (error) {
        console.error('Service File Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
}
module.exports.getNotifications = async (req, mainFilter) => {
    const userId = req.userId
    try {
        const aggregateQuery = [
            { $match: mainFilter },
            { $sort: { createdAt: - 1 } },
            {
                $lookup: {
                    from: "groups",
                    localField: "groupId",
                    foreignField: "_id",
                    as: "groupDetails"
                }
            },
            {
                $lookup: {
                    from: "group_members",
                    localField: "groupId",
                    foreignField: "groupId",
                    as: "groupMemberDetails"
                }
            },
            {
                $addFields: {
                    userGroupMember: {
                        $filter: {
                            input: "$groupMemberDetails",
                            as: "member",
                            cond: {
                                $eq: ["$$member.userId", userId]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    inviteStatus: {
                        $cond: [
                            { $gt: [{ $size: "$userGroupMember" }, 0] },
                            { $arrayElemAt: ["$userGroupMember.inviteStatus", 0] },
                            null
                        ]
                    },
                    groupName: {
                        $first: "$groupDetails.groupName"
                    }
                }
            },
            {
                $project: {
                    groupMemberDetails: 0,
                    userGroupMember: 0,
                    groupDetails: 0
                }
            }
        ]
        const queryResult = await groupNotificationModel.aggregate(aggregateQuery)
        return queryResult
    } catch (error) {
        console.error('Service File Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
}

module.exports.update = async (req, _id, updateData) => {
    try {
        const afterUpdate = await groupMemberModel.findByIdAndUpdate(_id, {
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
        const afterUpdate = await groupMemberModel.findByIdAndUpdate(_id, {
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