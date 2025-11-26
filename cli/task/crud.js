/**
 * Task CRUD operations (Create, Read, Update, Delete)
 * @module task/crud
 */

const fs = require('fs');
const path = require('path');
const {
  success,
  error,
  warning,
  info,
  dim,
  icons,
  getCurrentDate,
  updateFrontmatter,
  colorize,
  getStatusColor,
} = require('../utils');

/**
 * Get next available task ID
 * Scans all task directories to find the highest ID and returns the next sequential number
 * Uses a lock file mechanism to prevent race conditions in concurrent task creation
 * @param {() => string} getTasksDir - Function to get tasks directory
 * @returns {string} Next task ID in format "XXX" (e.g., "001", "042")
 */
function getNextTaskId(getTasksDir) {
  const tasksDir = getTasksDir();
  const lockFile = path.join(tasksDir, '.task-id.lock');
  const idFile = path.join(tasksDir, '.last-task-id');

  // Simple file-based locking with retry mechanism
  const maxRetries = 10;
  const retryDelay = 50; // ms

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Try to create lock file exclusively
      fs.writeFileSync(lockFile, String(process.pid), { flag: 'wx' });

      try {
        // Read current max ID from all directories
        /** @type {number[]} */
        const allTasks = [];
        const dirs = ['active', 'backlog', 'completed', 'archived'];

        dirs.forEach((dir) => {
          const dirPath = path.join(tasksDir, dir);
          if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            files.forEach((file) => {
              const match = file.match(/^TASK-(\d+)/);
              if (match) {
                allTasks.push(parseInt(match[1]));
              }
            });
          }
        });

        // Also check stored last ID (in case files were deleted)
        let lastStoredId = 0;
        if (fs.existsSync(idFile)) {
          const storedId = parseInt(fs.readFileSync(idFile, 'utf8').trim());
          if (!isNaN(storedId)) {
            lastStoredId = storedId;
          }
        }

        const maxFromFiles = allTasks.length > 0 ? Math.max(...allTasks) : 0;
        const newId = Math.max(maxFromFiles, lastStoredId) + 1;

        // Store the new ID atomically
        fs.writeFileSync(idFile, String(newId));

        return String(newId).padStart(3, '0');
      } finally {
        // Always remove lock file
        try {
          fs.unlinkSync(lockFile);
        } catch {
          // Ignore errors removing lock
        }
      }
    } catch (err) {
      const e = /** @type {NodeJS.ErrnoException} */ (err);
      if (e.code === 'EEXIST') {
        // Lock file exists, wait and retry
        const start = Date.now();
        while (Date.now() - start < retryDelay) {
          // Busy wait (simple approach for short delays)
        }
        continue;
      }
      // Other error, fall back to simple method
      break;
    }
  }

  // Fallback: simple method without locking (for backward compatibility)
  /** @type {number[]} */
  const allTasks = [];
  const dirs = ['active', 'backlog', 'completed', 'archived'];

  dirs.forEach((dir) => {
    const dirPath = path.join(tasksDir, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        const match = file.match(/^TASK-(\d+)/);
        if (match) {
          allTasks.push(parseInt(match[1]));
        }
      });
    }
  });

  const maxId = allTasks.length > 0 ? Math.max(...allTasks) : 0;
  return String(maxId + 1).padStart(3, '0');
}

/**
 * Find task by ID across all status directories
 * @param {string} taskId - Task ID to search for (format: TASK-XXX or XXX)
 * @param {() => string} getTasksDir - Function to get tasks directory
 * @returns {{file: string, path: string, status: string}|null} Task location object or null if not found
 */
function findTask(taskId, getTasksDir) {
  const dirs = ['active', 'backlog', 'completed', 'archived'];
  const id = taskId.replace('TASK-', '');

  for (const dir of dirs) {
    const dirPath = path.join(getTasksDir(), dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      const found = files.find((f) => f.startsWith(`TASK-${id}`));
      if (found) {
        return {
          file: found,
          path: path.join(dirPath, found),
          status: dir,
        };
      }
    }
  }

  return null;
}

/**
 * Create a new task
 * @param {string} title - Task title
 * @param {() => string} getTasksDir - Function to get tasks directory
 * @param {string} [priority='medium'] - Task priority (low, medium, high)
 * @param {string} [assignee=''] - Person assigned to the task
 * @returns {{id: string, fileName: string, filePath: string}} Created task information
 */
function createTask(title, getTasksDir, priority = 'medium', assignee = '') {
  if (!title || title.trim() === '') {
    console.log(error('Error: Task title is required'));
    process.exit(1);
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    console.log(warning(`Invalid priority "${priority}". Using "medium" instead.`));
    priority = 'medium';
  }

  const taskId = getNextTaskId(getTasksDir);
  const date = getCurrentDate();
  const fileName = `TASK-${taskId}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  const filePath = path.join(getTasksDir(), 'backlog', fileName);

  const template = `---
id: TASK-${taskId}
title: "${title}"
status: backlog
priority: ${priority}
created: ${date}
updated: ${date}
assignee: ${assignee}
tags: []
estimated: 0h
actual: 0h
---

## Description

[Detailed description of the task]

## Objectives

- [ ] Objective 1
- [ ] Objective 2

## Technical Requirements

- Requirement 1
- Requirement 2

## Notes

[Observations and notes during execution]

## Links/References

- [relevant link]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
`;

  fs.writeFileSync(filePath, template);
  console.log(success(`\n${icons.check} Task created successfully!`));
  console.log(info(`${icons.task} ID: TASK-${taskId}`));
  console.log(dim(`   Location: ${filePath}\n`));

  return { id: taskId, fileName, filePath };
}

/**
 * Move task to a different status directory
 * @param {string} taskId - Task ID to move
 * @param {string} targetStatus - Target status directory (active, backlog, completed, archived)
 * @param {() => string} getTasksDir - Function to get tasks directory
 */
function moveTask(taskId, targetStatus, getTasksDir) {
  const task = findTask(taskId, getTasksDir);

  if (!task) {
    console.log(error(`\n${icons.cross} Task ${taskId} not found\n`));
    return;
  }

  if (task.status === targetStatus) {
    console.log(warning(`\n${icons.warning} Task is already in ${targetStatus}\n`));
    return;
  }

  const targetPath = path.join(getTasksDir(), targetStatus, task.file);

  // Read and update the file
  let content = fs.readFileSync(task.path, 'utf8');
  content = updateFrontmatter(content, 'status', targetStatus);
  content = updateFrontmatter(content, 'updated', getCurrentDate());

  // Move the file
  fs.writeFileSync(targetPath, content);
  fs.unlinkSync(task.path);

  const statusColor = getStatusColor(targetStatus);
  console.log(success(`\n${icons.check} Task moved successfully!`));
  console.log(info(`   ${task.file}`));
  console.log(
    dim(
      `   ${task.status} ${icons.arrow} ${colorize(targetStatus, /** @type {keyof typeof import('../utils').colors} */ (statusColor))}\n`
    )
  );
}

/**
 * Update task metadata field
 * @param {string} taskId - Task ID to update
 * @param {string} field - Field name to update (title, priority, assignee, estimated, actual, tags)
 * @param {string} value - New value for the field
 * @param {() => string} getTasksDir - Function to get tasks directory
 */
function updateTask(taskId, field, value, getTasksDir) {
  const task = findTask(taskId, getTasksDir);

  if (!task) {
    console.log(error(`\n${icons.cross} Task ${taskId} not found\n`));
    return;
  }

  const validFields = ['priority', 'assignee', 'estimated', 'actual', 'tags'];
  if (!validFields.includes(field)) {
    console.log(
      error(`\n${icons.cross} Invalid field "${field}". Valid fields: ${validFields.join(', ')}\n`)
    );
    return;
  }

  let content = fs.readFileSync(task.path, 'utf8');

  // Parse value for specific fields
  if (field === 'tags') {
    const processedValue = value.split(',').map((/** @type {string} */ t) => t.trim());
    content = updateFrontmatter(content, field, processedValue);
  } else if (field === 'priority') {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(value)) {
      console.log(error(`\n${icons.cross} Invalid priority. Use: low, medium, or high\n`));
      return;
    }
    content = updateFrontmatter(content, field, value);
  } else {
    content = updateFrontmatter(content, field, value);
  }
  content = updateFrontmatter(content, 'updated', getCurrentDate());

  fs.writeFileSync(task.path, content);

  console.log(success(`\n${icons.check} Task updated successfully!`));
  console.log(info(`   ${field}: ${value}\n`));
}

/**
 * Archive completed tasks older than specified days
 * @param {() => string} getTasksDir - Function to get tasks directory
 * @param {number} [days=30] - Number of days threshold for archiving
 */
function archiveOldTasks(getTasksDir, days = 30) {
  const completedDir = path.join(getTasksDir(), 'completed');
  const archivedDir = path.join(getTasksDir(), 'archived');

  if (!fs.existsSync(completedDir)) {
    console.log(dim(`\n${icons.info} No completed tasks to archive\n`));
    return;
  }

  const files = fs.readdirSync(completedDir);
  const now = new Date();
  let archivedCount = 0;

  files.forEach((file) => {
    const filePath = path.join(completedDir, file);
    const stats = fs.statSync(filePath);
    const daysSinceModified = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceModified > days) {
      const targetPath = path.join(archivedDir, file);
      fs.renameSync(filePath, targetPath);
      archivedCount++;
    }
  });

  if (archivedCount > 0) {
    console.log(
      success(`\n${icons.check} Archived ${archivedCount} tasks older than ${days} days\n`)
    );
  } else {
    console.log(dim(`\n${icons.info} No tasks to archive\n`));
  }
}

module.exports = {
  getNextTaskId,
  findTask,
  createTask,
  moveTask,
  updateTask,
  archiveOldTasks,
};
