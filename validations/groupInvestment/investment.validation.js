const Joi = require('joi');
const { validateBody, validateQuery } = require('../../helper/joiValidations');

const createMany = Joi.array().items(Joi.object({
    groupId: Joi.string().length(24).required(),
    memberId: Joi.string().length(24).required(),
    amount: Joi.number().required(),
    investmentDate: Joi.date().required(),
    notes: Joi.string()
}));


const getAllData = Joi.object({
    status: Joi.string().valid('Active', 'InActive').optional(),
    month: Joi.string().valid('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December').optional(),
    year: Joi.number().min(2000).max(2100).optional()
})

const update = Joi.object({
    _id: Joi.string().length(24).required(),
    groupId: Joi.string().length(24).optional(),
    memberId: Joi.string().length(24).optional(),
    amount: Joi.number().optional(),
    investmentDate: Joi.date().optional(),
    notes: Joi.string()

});

const updateStatus = Joi.object({
    _id: Joi.string().length(24).required(),
    status: Joi.string().valid('Active', 'Inactive', 'Delete')
})



module.exports = {
    createMany: validateBody(createMany),
    getAllData: validateQuery(getAllData),
    update: validateBody(update),
    updateStatus: validateBody(updateStatus)
};
