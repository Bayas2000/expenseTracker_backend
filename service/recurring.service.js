const recurringModel = require('../models/recurring.model')


module.exports.create = async (req, inputData) => {
    try {
        const result = new recurringModel({
            ...inputData,
            createdBy: req.userId,
            createdAt: new Date()
        })
        await result.save()
        return result

    } catch (error) {
        console.error('Recurring Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
}

module.exports.findExist = async (name) => {
    const exist = await recurringModel.exists({ title })
    return exist
}

module.exports.getAllData = async () => {
    try {
        const aggregateQuery = [
            { $sort: { createdAt: - 1 } }
        ]
        const queryResult = await recurringModel.aggregate(aggregateQuery)
        return queryResult
    } catch (error) {
        console.error('Recurring Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
}

module.exports.update = async (req, _id, updateData) => {
    try {
        const afterUpdate = await recurringModel.findByIdAndUpdate(_id, {
            ...updateData,
            updatedAt: new Date()
        }, { new: true })
        console.log(afterUpdate)
        return afterUpdate
    } catch (error) {
        console.error('Recurring Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
}

module.exports.delete = async (req, _id, isActive) => {
    try {
        const afterUpdate = await recurringModel.findByIdAndUpdate(_id, {
            isActive,
            updatedAt: new Date()
        }, { new: true })
        return afterUpdate


    } catch (error) {
        console.error('Recurring Error:', error);
        return { success: false, message: 'Internal server error', error };
    }
}