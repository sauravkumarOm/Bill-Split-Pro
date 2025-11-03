const Joi = require('joi');

const createGroup = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    currency: Joi.string().max(5),
});

const addMember = Joi.object({
    email: Joi.string().email().required(),
});

module.exports = {createGroup, addMember};