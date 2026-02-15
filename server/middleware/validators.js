const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    
    // Simplified: Get the first error message directly
    const firstError = errors.array()[0];
    throw new ApiError(400, firstError.msg);
};

const registerValidator = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate
];

const loginValidator = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

const expenseValidator = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number')
        .custom(val => val > 0).withMessage('Amount must be greater than 0'),
    body('category').notEmpty().withMessage('Category is required'),
    body('date').isISO8601().withMessage('Please provide a valid date'),
    body('type').optional().isIn(['expense', 'income']).withMessage('Invalid type'),
    validate
];

module.exports = {
    registerValidator,
    loginValidator,
    expenseValidator
};
