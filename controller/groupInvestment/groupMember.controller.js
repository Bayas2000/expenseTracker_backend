const { sendPushNotification } = require('../../helper/commonFunctions')
const response = require('../../helper/response')
const userModel = require('../../models/user.model')
const groupMemberService = require('../../service/groupInvestment/groupMember.service')
const mongoose = require('mongoose')
const { Types } = mongoose
const { ObjectId } = Types

module.exports.inviteMembers = async (req, res) => {
    try {
        const inputData = req.body;
        const adminCheck = await groupMemberService.adminCheck(req, inputData.groupId)
        if (!adminCheck) {
            return response.errorResponse(res, 'Only Admins can invite members.')
        }
        const result = await groupMemberService.inviteMembers(req, inputData);
        console.log(result)
        if (result.success) {
            let message = `Group members invited successfully.`;
            if (result.alreadyInvited && result.alreadyInvited.length > 0) {
                message += ` Some members were already invited: ${result.alreadyInvited.join(', ')}`;
            }

            return response.successResponse(res, message, {
                addedCount: result.addedCount,
                alreadyInvited: result.alreadyInvited
            });
        } else {
            response.errorResponse(res, 'Group member invitation failed');
        }
    } catch (error) {
        console.error('Controller Invite Error:', error);
        response.catchError(res, 'Catch Error In Invite', error.message);
    }
};
module.exports.respondToGroupInvite = async (req, res) => {
    try {
        const { groupId, inviteResponse } = req.body;
        const userId = req.userId;

        const member = await groupMemberService.MatchInviteMember(groupId, userId);

        if (!member) {
            return response.errorResponse(res, 'Invitation not found');
        }

        if (member.inviteStatus !== 'Pending') {
            return response.successResponse(res, `You have already responded: ${member.inviteStatus}`);
        }

        const user = await userModel.findById(userId).select('deviceToken');
        if (user?.deviceToken) {
            const title = 'Group Invite Request';
            const body = `You have a group invite request to respond to.`;
            await sendPushNotification(user.deviceToken, title, body);
        }

        const result = await groupMemberService.respondToGroupInvite(groupId, userId, inviteResponse);

        if (result.modifiedCount > 0) {
            return response.successResponse(res, `You have successfully ${inviteResponse} the invite`);
        } else {
            return response.errorResponse(res, 'Failed to update invite response');
        }

    } catch (error) {
        console.error('Controller Invite Error:', error);
        response.catchError(res, 'Catch Error In Invite', error.message);
    }
};
module.exports.getAllData = async (req, res) => {
    try {
        const { status } = req.query
        const mainFilter = {
            ...({ status: status ? status : { $ne: 'Deleted' } }),
        }
        const data = await groupMemberService.getAllData(mainFilter)
        response.successResponse(res, 'Group Member Data List Fetch SuccesFully', data)
    } catch (error) {
        console.error('Controller GetAllData Error:', error);
        response.catchError(res, 'Catch Error In getAllData', error.message)
    }
}
module.exports.memberAmountDetails = async (req, res) => {
    try {
        const { groupId } = req.query
        const userId = req.userId
        const mainFilter = {
            ...(userId ? { userId: new ObjectId(userId) } : {}),
            ...(groupId ? { groupId: new ObjectId(groupId) } : {})
        }
        const data = await groupMemberService.amountDetails(mainFilter)
        response.successResponse(res, 'Member transactions Data List Fetch SuccesFully', data)
    } catch (error) {
        console.error('Controller GetAllData Error:', error);
        response.catchError(res, 'Catch Error In getAllData', error.message)
    }
}
module.exports.getNotification = async (req, res) => {
    try {
        const { status } = req.query
        const userId = req.userId
        const user = await userModel.findById(userId).select('deviceToken');

        const mainFilter = {
            ...({ status: status ? status : { $ne: 'Deleted' } }),
            ...(userId ? { userId: new ObjectId(userId) } : {})

        }
        const data = await groupMemberService.getNotifications(req, mainFilter)
        console.log("data", data)
        if (data.length > 0) {
            const hasUnreadNotification = data.some(notification => notification.inviteStatus === "Pending");
            console.log(hasUnreadNotification)
            if (hasUnreadNotification && user?.deviceToken) {
                await sendPushNotification(
                    user.deviceToken,
                    "Notification🔔",
                    "You have been invited to join the group 😉"
                );
            }
            response.successResponse(res, 'Group Member Data List Fetch SuccesFully', data)
        } else {
            await sendPushNotification(
                user.deviceToken,
                "Notification🔔",
                "Silre illa Pongadiiii🤡"
            )
            return response.successResponse(res, "No data Found", data)
        }

    } catch (error) {
        console.error('Controller GetAllData Error:', error);
        response.catchError(res, 'Catch Error In getAllData', error.message)
    }
}

module.exports.update = async (req, res) => {
    try {
        const { _id, ...updateData } = req.body
        const result = await groupMemberService.update(req, _id, updateData)
        console.log(result)
        if (result) {
            response.successResponse(res, 'Group Member Updated SuccesFully', result)
        } else return response.errorResponse(res, 'Group Member Update Failed')
    } catch (error) {
        console.error('Controller update Error:', error);
        response.catchError(res, 'Catch Error In update', error.message)
    }
}
module.exports.delete = async (req, res) => {
    try {
        const { _id, status } = req.body
        const result = await groupMemberService.delete(req, _id, status)
        if (result)
            console.log(result)
        if (result) {
            response.successResponse(res, 'Group Member Updated SuccesFully', result)
        } else return response.errorResponse(res, 'Group Member Update Failed')
    } catch (error) {
        console.error('Controller update Error:', error);
        response.catchError(res, 'Catch Error In update', error.message)
    }
}