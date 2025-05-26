const Joi = require('joi');
const { validateBody, validateQuery } = require('../../helper/joiValidations');

const create = Joi.object({
    groupName: Joi.string().min(1).max(30).required(),
    monthlyTarget: Joi.number().required(),
    existTotalAmount: Joi.number(),
    existInvest: Joi.boolean().default(false),
    existingInvestment: Joi.alternatives().conditional('existInvest', {
        is: true,
        then: Joi.array().items(
            Joi.object({
                investmentType: Joi.string().valid('Gold', 'Stock', 'Crypto', 'Other').required(),
                quantity: Joi.string().required(),
                investAmount: Joi.number().required(),
                investDate: Joi.date().required(),
                notes: Joi.string().optional()
            })
        ).min(1).required(),
        otherwise: Joi.forbidden()
    })
});


const getAllData = Joi.object({
    status: Joi.string().valid('Active', 'InActive').optional(),
    groupId: Joi.string().length(24).optional()
})

const update = Joi.object({
    _id: Joi.string().length(24).required(),
    groupName: Joi.string().min(1).max(30).optional(),
    members: Joi.string().optional(),
});

const updateMonthlyTarget = Joi.object({
    _id: Joi.string().length(24).required(),
    newTarget: Joi.number().required()
});

const updateStatus = Joi.object({
    _id: Joi.string().length(24).required(),
    status: Joi.string().valid('Active', 'Inactive', 'Delete')
})



module.exports = {
    create: validateBody(create),
    getAllData: validateQuery(getAllData),
    update: validateBody(update),
    updateMonthlyTarget: validateBody(updateMonthlyTarget),
    updateStatus: validateBody(updateStatus)
};
