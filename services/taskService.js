const taskModel = require('../models/Task');
const AppError = require('../utils/appError');

const getTasks = async () => taskModel.findAll();

const getTaskById = async (id) => {
  const task = taskModel.findById(id);
  if (!task) throw new AppError(`Task with id ${id} not found`, 404);
  return task;
};

const createTask = async (payload) => {
  // Defensive: validators already checked, but never trust upstream blindly
  if (!payload.title?.trim()) throw new AppError('Title is required', 400);
  return taskModel.create(payload);
};

const updateTaskStatus = async (id, status) => {
  const updated = taskModel.updateStatus(id, status);
  if (!updated) throw new AppError(`Task with id ${id} not found`, 404);
  return updated;
};

const deleteTask = async (id) => {
  const task = taskModel.findById(id);
  if (!task) throw new AppError(`Task with id ${id} not found`, 404);
  taskModel.remove(id);
  return task;
};

module.exports = { getTasks, getTaskById, createTask, updateTaskStatus, deleteTask };