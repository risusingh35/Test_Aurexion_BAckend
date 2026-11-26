const AppError = require("../middleware/AppError");
const Task = require("../models/Task");

const getTaskRepository = async () => {
    try {
        return await Task.find({})
    } catch (error) {
        throw new AppError('Error fetching tasks', 500)
    }
};

const createTaskRepository = async (taskData) => {
    try {
        console.log("taskData",taskData)
        
        return await Task.create(taskData)
    } catch (error) {
        console.log("err------------",error)
        throw new AppError('Error creating task', 500)
    }
};
const updateTaskRepository = async (id, updateData) => {
    try {
        return await Task.findByIdAndUpdate(id, updateData, { new: true })
    } catch (error) {
        throw new AppError('Error updating task', 500)
    }
};
const deleteTaskRepository = async (id) => {
    try {
        return await Task.findByIdAndDelete(id)
    } catch (error) {
        throw new AppError('Error deleting task', 500)
    }
}
module.exports = {
    getTaskRepository,
    createTaskRepository,
    updateTaskRepository,
    deleteTaskRepository
}