const Joi = require('joi');
const { validateBody, validateQuery } = require('../helper/joiValidations');

const create = Joi.object({
    title: Joi.string().min(1).max(30).required(),
    amount: Joi.number().optional(),
    frequency: Joi.string().valid("daily", "weekly", "monthly", "yearly").optional(),
    dueDate: Joi.date().required(),
    lastPaidDueDate: Joi.date(),
    notes: Joi.string(),
    isActive: Joi.boolean().default(true)
});


const getAllData = Joi.object({
    status: Joi.string().valid('Active', 'InActive').optional()
})

const update = Joi.object({
    _id: Joi.string().length(24).required(),
    title: Joi.string().min(1).max(30).optional(),
    amount: Joi.number().optional(),
    frequency: Joi.string().valid("daily", "weekly", "monthly", "yearly").optional(),
    dueDate: Joi.date().optional(),
    lastPaidDueDate: Joi.date(),
    notes: Joi.string(),
    isActive: Joi.boolean().default(true)
});



module.exports = {
    create: validateBody(create),
    getAllData: validateQuery(getAllData),
    update: validateBody(update)
};
