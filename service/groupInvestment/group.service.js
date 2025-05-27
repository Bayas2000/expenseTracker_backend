const groupModel = require('../../models/groupInvestment/group.model');
const groupMemberModel = require('../../models/groupInvestment/groupMember.model');
const userModel = require('../../models/user.model');

module.exports.create = async (req, inputData) => {
    try {
        const createdBy = req.userId;
        const user = await userModel.findOne({ _id: createdBy }).select('userName')
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();
        const monthlyTargetHistoryEntry = {
            month,
            year,
            targetAmount: inputData.monthlyTarget,
            updatedAt: now
        };

        const newGroup = new groupModel({
            ...inputData,
            monthlyTargetHistory: [monthlyTargetHistoryEntry],
            createdBy,
            createdAt: new Date()
        });
        await newGroup.save();

        const adminEntry = new groupMemberModel({
            groupId: newGroup._id,
            userId: createdBy,
            memberName: user.userName,
            role: 'Admin',
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
                $lookup: {
                    from: "group_transactions",
                    localField: "groupMemberDetails._id",
                    foreignField: "memberId",
                    as: "groupTransactionDetails"
                }
            },
            {
                $addFields: {
                    groupTransactionDetails: { $ifNull: ["$groupTransactionDetails", []] }
                }
            },
            {
                $addFields: {
                    acceptMembers: {
                        $filter: {
                            input: { $ifNull: ["$groupMemberDetails", []] },
                            as: "member",
                            cond: {
                                $eq: ["$$member.inviteStatus", "Accepted"]
                            }
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
                    totalMembers: { $size: { $ifNull: ["$acceptMembers", []] } }
                }
            },
            {
                $addFields: {
                    currentMonth: {
                        $toInt: {
                            $dateToString: {
                                date: new Date(),
                                format: "%m"
                            }
                        }
                    },
                    currentYear: {
                        $year: new Date()
                    }
                }
            },
            {
                $addFields: {
                    resolvedMonthlyTarget: {
                        $let: {
                            vars: {
                                matchingHistory: {
                                    $filter: {
                                        input: "$monthlyTargetHistory",
                                        as: "entry",
                                        cond: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        {
                                                            $toInt: {
                                                                $switch: {
                                                                    branches: [
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "January"
                                                                                ]
                                                                            },
                                                                            then: 1
                                                                        },
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "February"
                                                                                ]
                                                                            },
                                                                            then: 2
                                                                        },
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "March"
                                                                                ]
                                                                            },
                                                                            then: 3
                                                                        },
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "April"
                                                                                ]
                                                                            },
                                                                            then: 4
                                                                        },
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "May"
                                                                                ]
                                                                            },
                                                                            then: 5
                                                                        },
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "June"
                                                                                ]
                                                                            },
                                                                            then: 6
                                                                        },
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "July"
                                                                                ]
                                                                            },
                                                                            then: 7
                                                                        },
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "August"
                                                                                ]
                                                                            },
                                                                            then: 8
                                                                        },
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "September"
                                                                                ]
                                                                            },
                                                                            then: 9
                                                                        },
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "October"
                                                                                ]
                                                                            },
                                                                            then: 10
                                                                        },
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "November"
                                                                                ]
                                                                            },
                                                                            then: 11
                                                                        },
                                                                        {
                                                                            case: {
                                                                                $eq: [
                                                                                    "$$entry.month",
                                                                                    "December"
                                                                                ]
                                                                            },
                                                                            then: 12
                                                                        }
                                                                    ],
                                                                    default: 0
                                                                }
                                                            }
                                                        },
                                                        "$currentMonth"
                                                    ]
                                                },
                                                {
                                                    $eq: [
                                                        "$$entry.year",
                                                        "$currentYear"
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            in: {
                                $cond: [
                                    {
                                        $gt: [
                                            { $size: "$$matchingHistory" },
                                            0
                                        ]
                                    },
                                    {
                                        $arrayElemAt: [
                                            "$$matchingHistory.targetAmount",
                                            0
                                        ]
                                    },
                                    "$monthlyTarget"
                                ]
                            }
                        }
                    }
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
                                monthlyTarget: "$resolvedMonthlyTarget",
                                memberAmount: {
                                    $reduce: {
                                        input: {
                                            $filter: {
                                                input: "$groupTransactionDetails",
                                                as: "trans",
                                                cond: { $eq: ["$$trans.memberId", "$$member._id"] }
                                            }
                                        },
                                        initialValue: 0,
                                        in: { $add: ["$$value", "$$this.amount"] }
                                    }
                                },
                                createdAt: "$$member.createdAt",
                                joinedDate: "$$member.joinedDate",
                                createdBy: "$$member.createdBy"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    groupMemberDetails: 0,
                    groupTransactionDetails: 0,
                    groupUserDetails: 0,
                    acceptMembers: 0,
                    existingInvestAmount: 0,
                    resolvedMonthlyTarget: 0
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

module.exports.groupOverview = async (mainFilter) => {
    try {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentMonthName = monthNames[currentMonth];
        const currentYear = currentDate.getFullYear();

        const aggregateQuery = [
            { $match: mainFilter },
            {
                $lookup: {
                    from: "group_members",
                    localField: "_id",
                    foreignField: "groupId",
                    as: "groupMembers"
                }
            },
            {
                $lookup: {
                    from: "group_transactions",
                    localField: "_id",
                    foreignField: "groupId",
                    as: "groupTransactions"
                }
            },
            {
                $addFields: {
                    acceptMembers: {
                        $filter: {
                            input: "$groupMembers",
                            as: "member",
                            cond: {
                                $eq: ["$$member.inviteStatus", "Accepted"]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    totalMembers: { $size: "$acceptMembers" },
                    balance: { $add: [{ $sum: "$groupTransactions.amount" }, "$existTotalAmount"] },
                    groupTransactionsInMonth: {
                        $filter: {
                            input: "$groupTransactions",
                            as: "tran",
                            cond: {
                                $and: [
                                    { $eq: [{ $month: "$$tran.investmentDate" }, currentMonth + 1] },
                                    { $eq: [{ $year: "$$tran.investmentDate" }, currentYear] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    collectedAmount: { $sum: "$groupTransactionsInMonth.amount" },
                    currentTargetEntry: {
                        $first: {
                            $filter: {
                                input: "$monthlyTargetHistory",
                                as: "target",
                                cond: {
                                    $and: [
                                        { $eq: ["$$target.month", currentMonthName] },
                                        { $eq: ["$$target.year", currentYear] }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    targetAmount: {
                        $multiply: [
                            { $ifNull: ["$totalMembers", 0] },
                            { $ifNull: ["$currentTargetEntry.targetAmount", 0] }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    pendingAmount: {
                        $subtract: [
                            { $ifNull: ["$targetAmount", 0] },
                            { $ifNull: ["$collectedAmount", 0] }
                        ]
                    }
                }
            },
            {
                $project: {
                    summaryCarts: [
                        {
                            title: "Balance",
                            value: "$balance"
                        },
                        {
                            title: "Target Amount",
                            value: "$targetAmount"
                        },
                        {
                            title: "Collected Amount",
                            value: "$collectedAmount"
                        },
                        {
                            title: "Pending Amount",
                            value: "$pendingAmount"
                        }
                    ]
                }
            }
        ];

        const queryResult = await groupModel.aggregate(aggregateQuery);

        return queryResult;
    } catch (error) {
        console.error('Service File Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
};



module.exports.dashBoard = async (mainFilter) => {
    try {
        const aggregateQuery = [
            { $match: mainFilter },
            {
                $lookup: {
                    from: "group_transactions",
                    localField: "_id",
                    foreignField: "memberId",
                    as: "transactionsDetails"
                }
            },
            {
                $addFields: {
                    totalAmountSpending: {
                        $sum: "$transactionsDetails.amount"
                    }
                }
            },
            {
                $group: {
                    _id: "$userId",
                    memberName: { $first: "$memberName" },
                    totalGroups: { $addToSet: "$groupId" },
                    totalAmountSpending: { $sum: "$totalAmountSpending" }
                }
            },
            {
                $addFields: {
                    totalGroups: { $size: "$totalGroups" }
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

module.exports.updateMonthlyTarget = async (req, _id, newTarget) => {
    try {
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();

        const group = await groupModel.findById(_id);
        if (!group) return { success: false, message: 'Group not found' };
        const existingIndex = group.monthlyTargetHistory?.findIndex(entry => entry.month === month && entry.year === year);
        const updateOps = {
            $set: { monthlyTarget: newTarget }
        };
        if (existingIndex !== -1) {
            const updatePath = `monthlyTargetHistory.${existingIndex}`;
            updateOps.$set[updatePath] = {
                month,
                year,
                targetAmount: newTarget,
                updatedAt: now
            };
        } else {
            updateOps.$push = {
                monthlyTargetHistory: {
                    month,
                    year,
                    targetAmount: newTarget,
                    updatedAt: now
                }
            };
        }

        const result = await groupModel.updateOne({ _id }, updateOps);
        return { success: true, message: existingIndex !== -1 ? 'Target updated for existing month/year' : 'Target added for new month/year', result };
    } catch (error) {
        console.error('Service File Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
};


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