const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const {
  createTaskValidation,
  updateStatusValidation,
  taskIdValidation,
} = require('../validators/taskValidator');

router.get('/tasks', asyncHandler(taskController.getTasks));
router.get('/tasks/:id', taskIdValidation(), validate, asyncHandler(taskController.getTask));

router.post(
  '/tasks',
  createTaskValidation(),   // 1. validation rules
  validate,                 // 2. reject before handler runs
  asyncHandler(taskController.createTask)   // 3. only if valid
);

router.patch(
  '/tasks/:id',
  updateStatusValidation(),
  validate,
  asyncHandler(taskController.updateStatus)
);

router.delete(
  '/tasks/:id',
  taskIdValidation(),
  validate,
  asyncHandler(taskController.deleteTask)
);

module.exports = router;