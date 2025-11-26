/**
 * Task module - exports all task functions
 * @module task
 */

// Re-export all task modules
const crud = require('./crud');
const list = require('./list');
const stats = require('./stats');
const edit = require('./edit');
const standup = require('./standup');

module.exports = {
  // CRUD operations
  getNextTaskId: crud.getNextTaskId,
  findTask: crud.findTask,
  createTask: crud.createTask,
  moveTask: crud.moveTask,
  updateTask: crud.updateTask,
  archiveOldTasks: crud.archiveOldTasks,

  // List operations
  listTasks: list.listTasks,
  viewTask: list.viewTask,
  searchTasks: list.searchTasks,
  getAllTasks: list.getAllTasks,

  // Statistics
  getStats: stats.getStats,
  getStatsData: stats.getStatsData,

  // Edit operations
  editTask: edit.editTask,

  // Standup operations
  generateStandup: standup.generateStandup,
  printStandup: standup.printStandup,
  getWeeklySummary: standup.getWeeklySummary,
};
