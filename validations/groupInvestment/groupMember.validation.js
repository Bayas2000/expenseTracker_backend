const Joi = require('joi');
const { validateBody, validateQuery } = require('../../helper/joiValidations');

const inviteMembers = Joi.object({
    groupId: Joi.string().length(24).required(),
    memberIds: Joi.array().items(Joi.string()),
});

const inviteResponse = Joi.object({
    groupId: Joi.string().length(24).required(),
    inviteResponse: Joi.string().valid().required()
});


const getAllData = Joi.object({
    status: Joi.string().valid('Active', 'InActive').optional()
})

const memberAmountDetails = Joi.object({
    groupId: Joi.string().length(24).required()
})

const groupOverview = Joi.object({
    groupId: Joi.string().length(24).required()
})

const update = Joi.object({
    _id: Joi.string().length(24).required(),
    groupId: Joi.string().length(24).optional(),
    userId: Joi.string().length(24).optional(),
    role: Joi.string().valid('Admin', 'Member'),
    monthlyTarget: Joi.number().optional()
});

const updateStatus = Joi.object({
    _id: Joi.string().length(24).required(),
    status: Joi.string().valid('Active', 'Inactive', 'Delete')
})



module.exports = {
    inviteMembers: validateBody(inviteMembers),
    inviteResponse: validateBody(inviteResponse),
    getAllData: validateQuery(getAllData),
    memberAmountDetails: validateQuery(memberAmountDetails),
    groupOverview: validateQuery(groupOverview),
    update: validateBody(update),
    updateStatus: validateBody(updateStatus)
};
