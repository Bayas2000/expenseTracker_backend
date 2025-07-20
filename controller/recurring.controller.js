const response = require('../helper/response')
const recurringService = require('../service/recurring.service')
const mongoose = require('mongoose')
const { Types } = mongoose
const { ObjectId } = Types

module.exports.create = async (req, res) => {
    try {
        const { ...inputData } = req.body
        const result = await recurringService.create(req, inputData)
        if (result._id) {
            response.successResponse(res, 'Recurring Created SuccessFully', result)
        } else return response.errorResponse(res, 'Recurring Creation Failed')
    } catch (error) {
        console.error('Controller Signup Error:', error);
        response.catchError(res, 'Catch Error In SignUp', error.message)
    }
}


module.exports.getAllData = async (req, res) => {
    try {
        const { isActive } = req.query
        const userId = req.userId
        const mainFilter = {
            ...({ isActive: isActive ? isActive : { $ne: 'false' } }),
            ...(userId ? { createdBy: new ObjectId(userId) } : {}),

        }
        const data = await recurringService.getAllData(mainFilter)
        response.successResponse(res, 'Recurring Data List Fetch SuccesFully', data)
    } catch (error) {
        console.error('Controller GetAllData Error:', error);
        response.catchError(res, 'Catch Error In getAllData', error.message)
    }
}

module.exports.update = async (req, res) => {
    try {
        const { _id, ...updateData } = req.body
        const result = await recurringService.update(req, _id, updateData)
        if (result) {
            response.successResponse(res, 'Recurring Updated SuccesFully', result)
        } else return response.errorResponse(res, 'Recurring Update Failed')
    } catch (error) {
        console.error('Controller update Error:', error);
        response.catchError(res, 'Catch Error In update', error.message)
    }
}

module.exports.delete = async (req, res) => {
    try {
        const { _id, isActive } = req.body
        const result = await recurringService.delete(req, _id, isActive)
        if (result?.isActive === true) {
            response.successResponse(res, "This Scheduled Expense plan is activated")
        } else return response.successResponse(res, 'This Schedule Expense plan is InActive')
    } catch (error) {
        console.error('Controller update Error:', error);
        response.catchError(res, 'Catch Error In update', error.message)
    }
}