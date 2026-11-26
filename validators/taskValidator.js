const { body, param } = require('express-validator');

const STATUSES = ['todo', 'in-progress', 'done'];

const createTaskValidation = () => [
  body('title')
    .exists({ checkFalsy: true }).withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1–200 characters'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 2000 }).withMessage('Description max 2000 characters'),
  body('status')
    .optional()
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
];

const updateStatusValidation = () => [
  param('id').isUUID().withMessage('Invalid task id'),
  body('status')
    .exists({ checkFalsy: true }).withMessage('Status is required')
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
];

const taskIdValidation = () => [
  param('id').isUUID().withMessage('Invalid task id'),
];

module.exports = { createTaskValidation, updateStatusValidation, taskIdValidation, STATUSES };