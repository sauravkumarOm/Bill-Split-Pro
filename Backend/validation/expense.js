const Joi = require('joi');

const spliteSchema = Joi.object({
    user: Joi.string().required(),
    share: Joi.number().min(0).required(),
});

const createExpense = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    amount: Joi.number().positive().required(),
    paidBy: Joi.string().required(),
    splitType: Joi.string().valid('equal', 'custom', 'percentage').required(),
    splits: Joi.array().items(spliteSchema).min(1).required(),
    date: Joi.date().optional(),
    note: Joi.string().allow('').optional(),
})

module.exports = {createExpense};