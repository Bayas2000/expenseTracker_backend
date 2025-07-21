const Joi = require('joi');
const { validateBody, validateQuery, validateParams } = require('../helper/joiValidations');

const signup = Joi.object({
    userName: Joi.string().min(3).max(30).required(),
    emailId: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    profileImage: Joi.string()
});


const login = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required()
})

const updateProfile = Joi.object({
    userName: Joi.string().min(3).max(30).required(),
    profileImage: Joi.string(),

});



module.exports = {
    signup: validateBody(signup),
    login: validateBody(login),
    updateProfile: validateBody(updateProfile)
};
