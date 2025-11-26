#!/usr/bin/env node

/**
 * Task CLI - Thin wrapper that delegates to modular components
 *
 * This file serves as the main entry point for the task CLI.
 * All business logic is implemented in ./task/ modules.
 * CLI handling is implemented in ./task/cli.js.
 *
 * @module cli/task
 */

// Re-export all task functions for backward compatibility
const task = require('./task/index');

module.exports = {
  // CRUD operations
  getNextTaskId: task.getNextTaskId,
  findTask: task.findTask,
  createTask: task.createTask,
  moveTask: task.moveTask,
  updateTask: task.updateTask,
  archiveOldTasks: task.archiveOldTasks,

  // List operations
  listTasks: task.listTasks,
  viewTask: task.viewTask,
  searchTasks: task.searchTasks,
  getAllTasks: task.getAllTasks,

  // Statistics
  getStats: task.getStats,
  getStatsData: task.getStatsData,

  // Edit operations
  editTask: task.editTask,

  // Standup operations
  generateStandup: task.generateStandup,
  printStandup: task.printStandup,
  getWeeklySummary: task.getWeeklySummary,
};

// Run CLI if called directly
if (require.main === module) {
  const { run } = require('./task/cli');
  run().catch((err) => {
    const { error, icons } = require('./utils');
    console.error(error(`\n${icons.error} ${err.message}\n`));
    process.exit(1);
  });
}
