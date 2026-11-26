const { randomUUID } = require('node:crypto');

// In-memory "table"
const tasks = new Map();

const findAll = () => Array.from(tasks.values());

const findById = (id) => tasks.get(id) || null;

const create = ({ title, description, status }) => {
  const task = {
    id: randomUUID(),
    title,
    description: description ?? '',
    status: status ?? 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.set(task.id, task);
  return task;
};

const updateStatus = (id, status) => {
  const task = tasks.get(id);
  if (!task) return null;
  task.status = status;
  task.updatedAt = new Date().toISOString();
  return task;
};

const remove = (id) => tasks.delete(id);

module.exports = { findAll, findById, create, updateStatus, remove };