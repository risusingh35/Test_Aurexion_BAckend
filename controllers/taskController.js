const taskService = require('../services/taskService');

const getTasks = async (req, res) => {
  const tasks = await taskService.getTasks();
  res.status(200).json({ success: true, data: tasks });
};

const getTask = async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  res.status(200).json({ success: true, data: task });
};

const createTask = async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.status(201).json({ success: true, data: task });   // 201 Created
};

const updateStatus = async (req, res) => {
  const task = await taskService.updateTaskStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, data: task });
};

const deleteTask = async (req, res) => {
  const task = await taskService.deleteTask(req.params.id);
  res.status(200).json({ success: true, data: task, message: 'Task deleted' });
};

module.exports = { getTasks, getTask, createTask, updateStatus, deleteTask };