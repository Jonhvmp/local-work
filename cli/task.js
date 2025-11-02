#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  success,
  error,
  warning,
  info,
  dim,
  bold,
  getStatusColor,
  getPriorityColor,
  icons,
  formatDate,
  parseTime,
  formatTime,
  ensureDir,
  getCurrentDate,
  openInEditor,
  parseFrontmatter,
  updateFrontmatter,
  formatTable,
  colorize,
} = require('./utils');

// Import configuration system
const config = require('./config');

// Get tasks directory from config (supports workspaces and ENV overrides)
const TASKS_DIR = config.getTasksDir();

// Ensure all directories exist
['active', 'backlog', 'completed', 'archived'].forEach((dir) => {
  ensureDir(path.join(TASKS_DIR, dir));
});

/**
 * Get next available task ID
 * Scans all task directories to find the highest ID and returns the next sequential number
 * @returns {string} Next task ID in format "XXX" (e.g., "001", "042")
 */
function getNextTaskId() {
  /** @type {number[]} */
  const allTasks = [];
  const dirs = ['active', 'backlog', 'completed', 'archived'];

  dirs.forEach((dir) => {
    const dirPath = path.join(TASKS_DIR, dir);
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
 * @returns {{file: string, path: string, status: string}|null} Task location object or null if not found
 */
function findTask(taskId) {
  const dirs = ['active', 'backlog', 'completed', 'archived'];
  const id = taskId.replace('TASK-', '');

  for (const dir of dirs) {
    const dirPath = path.join(TASKS_DIR, dir);
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
 * @param {string} [priority='medium'] - Task priority (low, medium, high)
 * @param {string} [assignee=''] - Person assigned to the task
 * @returns {{id: string, fileName: string, filePath: string}} Created task information
 */
function createTask(title, priority = 'medium', assignee = '') {
  if (!title || title.trim() === '') {
    console.log(error('Error: Task title is required'));
    process.exit(1);
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    console.log(warning(`Invalid priority "${priority}". Using "medium" instead.`));
    priority = 'medium';
  }

  const taskId = getNextTaskId();
  const date = getCurrentDate();
  const fileName = `TASK-${taskId}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  const filePath = path.join(TASKS_DIR, 'backlog', fileName);

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
 */
function moveTask(taskId, targetStatus) {
  const task = findTask(taskId);

  if (!task) {
    console.log(error(`\n${icons.cross} Task ${taskId} not found\n`));
    return;
  }

  if (task.status === targetStatus) {
    console.log(warning(`\n${icons.warning} Task is already in ${targetStatus}\n`));
    return;
  }

  const targetPath = path.join(TASKS_DIR, targetStatus, task.file);

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
      `   ${task.status} ${icons.arrow} ${colorize(targetStatus, /** @type {keyof typeof import('./utils').colors} */ (statusColor))}\n`
    )
  );
}

/**
 * List tasks by status
 * @param {string|null} [status=null] - Specific status to filter by, or null for all active statuses
 */
function listTasks(status = null) {
  const dirs = status ? [status] : ['active', 'backlog', 'completed'];
  /** @type {Array<{id: string, title: string, status: string, priority: string, assignee: string, estimated: string, actual: string, created: string|string[]}>} */
  const allTasks = [];

  dirs.forEach((dir) => {
    const dirPath = path.join(TASKS_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((f) => f.startsWith('TASK-'));

      files.forEach((file) => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const meta = parseFrontmatter(content);

        allTasks.push({
          id: String(meta.id || file.split('-').slice(0, 2).join('-')),
          title: String(meta.title || 'Unknown'),
          status: String(meta.status || dir),
          priority: String(meta.priority || 'medium'),
          assignee: String(meta.assignee || '-'),
          estimated: String(meta.estimated || '0h'),
          actual: String(meta.actual || '0h'),
          created: meta.created,
        });
      });
    }
  });

  if (allTasks.length === 0) {
    console.log(dim(`\n${icons.info} No tasks found\n`));
    return;
  }

  console.log(bold(`\n${icons.task} Tasks Overview\n`));

  /** @type {Record<string, Array<{id: string, title: string, status: string, priority: string, assignee: string, estimated: string, actual: string, created: string|string[]}>>} */
  const groupedByStatus = {};
  allTasks.forEach((task) => {
    if (!groupedByStatus[task.status]) {
      groupedByStatus[task.status] = [];
    }
    groupedByStatus[task.status].push(task);
  });

  Object.keys(groupedByStatus).forEach((status) => {
    const tasks = groupedByStatus[status];
    const statusColor = getStatusColor(status);

    console.log(
      colorize(
        `\n▸ ${status.toUpperCase()} (${tasks.length})`,
        /** @type {keyof typeof import('./utils').colors} */ (statusColor)
      )
    );

    tasks.forEach((task) => {
      const priorityColor = getPriorityColor(task.priority);
      const priorityBadge = colorize(
        `[${task.priority}]`,
        /** @type {keyof typeof import('./utils').colors} */ (priorityColor)
      );
      const assigneeBadge = task.assignee !== '-' ? dim(`@${task.assignee}`) : '';

      console.log(
        `  ${icons.bullet} ${bold(task.id)}: ${task.title} ${priorityBadge} ${assigneeBadge}`
      );
      console.log(
        dim(
          `    Est: ${task.estimated} | Actual: ${task.actual} | Created: ${formatDate(String(task.created))}`
        )
      );
    });
  });

  console.log('');
}

/**
 * View detailed information about a task
 * @param {string} taskId - Task ID to view
 */
function viewTask(taskId) {
  const task = findTask(taskId);

  if (!task) {
    console.log(error(`\n${icons.cross} Task ${taskId} not found\n`));
    return;
  }

  const content = fs.readFileSync(task.path, 'utf8');
  const meta = parseFrontmatter(content);

  const statusStr = String(meta.status);
  const priorityStr = String(meta.priority);

  console.log(bold(`\n${icons.task} ${meta.title}\n`));
  console.log(
    formatTable(
      ['Field', 'Value'],
      [
        ['ID', meta.id],
        [
          'Status',
          colorize(
            statusStr,
            /** @type {keyof typeof import('./utils').colors} */ (getStatusColor(statusStr))
          ),
        ],
        [
          'Priority',
          colorize(
            priorityStr,
            /** @type {keyof typeof import('./utils').colors} */ (getPriorityColor(priorityStr))
          ),
        ],
        ['Assignee', meta.assignee || '-'],
        ['Created', formatDate(String(meta.created))],
        ['Updated', formatDate(String(meta.updated))],
        ['Estimated', meta.estimated],
        ['Actual', meta.actual],
        ['Tags', Array.isArray(meta.tags) ? meta.tags.join(', ') : meta.tags],
      ]
    )
  );

  // Show content without frontmatter
  const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  console.log(dim('\n─────────────────────────────────────────────────────\n'));
  console.log(bodyContent);
}

/**
 * Open task file in default editor
 * @param {string} taskId - Task ID to edit
 */
function editTask(taskId) {
  const task = findTask(taskId);

  if (!task) {
    console.log(error(`\n${icons.cross} Task ${taskId} not found\n`));
    return;
  }

  console.log(info(`\n${icons.info} Opening task in editor...\n`));

  openInEditor(task.path)
    .then(() => {
      // Update the 'updated' field
      let content = fs.readFileSync(task.path, 'utf8');
      content = updateFrontmatter(content, 'updated', getCurrentDate());
      fs.writeFileSync(task.path, content);

      console.log(success(`\n${icons.check} Task updated successfully!\n`));
    })
    .catch((err) => {
      console.log(error(`\n${icons.cross} Error opening editor: ${err.message}\n`));
    });
}

/**
 * Search for tasks by term
 * @param {string} searchTerm - Search query (searches in title, assignee, and tags)
 * @returns {Array<{id: string, title: string, status: string, priority: string, assignee: string, file: string, path: string}>} Array of matching tasks
 */
function searchTasks(searchTerm) {
  const dirs = ['active', 'backlog', 'completed'];
  /** @type {Array<{id: string, title: string, status: string, priority: string, assignee: string, file: string, path: string}>} */
  const results = [];

  dirs.forEach((dir) => {
    const dirPath = path.join(TASKS_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((f) => f.startsWith('TASK-'));

      files.forEach((file) => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const meta = parseFrontmatter(content);

        // Search in title, description, and content
        const searchContent = `${meta.title} ${content}`.toLowerCase();
        if (searchContent.includes(searchTerm.toLowerCase())) {
          results.push({
            id: String(meta.id),
            title: String(meta.title),
            status: String(meta.status),
            priority: String(meta.priority),
            assignee: String(meta.assignee || '-'),
            file,
            path: path.join(dirPath, file),
          });
        }
      });
    }
  });

  if (results.length === 0) {
    console.log(dim(`\n${icons.info} No tasks found matching "${searchTerm}"\n`));
    return results; // Return empty array
  }

  console.log(bold(`\n${icons.task} Search Results (${results.length})\n`));
  console.log(dim(`Searching for: "${searchTerm}"\n`));

  results.forEach((task) => {
    const statusColor = getStatusColor(task.status);
    const priorityColor = getPriorityColor(task.priority);

    console.log(`${icons.bullet} ${bold(task.id)}: ${task.title}`);
    console.log(
      dim(
        `  Status: ${colorize(task.status, /** @type {keyof typeof import('./utils').colors} */ (statusColor))} | Priority: ${colorize(task.priority, /** @type {keyof typeof import('./utils').colors} */ (priorityColor))}`
      )
    );
  });

  return results; // Always return results array
}

/**
 * Update task metadata field
 * @param {string} taskId - Task ID to update
 * @param {string} field - Field name to update (title, priority, assignee, estimated, actual, tags)
 * @param {string} value - New value for the field
 */
function updateTask(taskId, field, value) {
  const task = findTask(taskId);

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
    /** @type {string|string[]} */
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
 * Display task statistics
 */
function getStats() {
  const dirs = ['active', 'backlog', 'completed', 'archived'];
  const stats = {
    total: 0,
    /** @type {Record<string, number>} */
    byStatus: {},
    byPriority: { low: 0, medium: 0, high: 0 },
    totalEstimated: 0,
    totalActual: 0,
  };

  dirs.forEach((dir) => {
    const dirPath = path.join(TASKS_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((f) => f.startsWith('TASK-'));

      stats.byStatus[dir] = files.length;
      stats.total += files.length;

      files.forEach((file) => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const meta = parseFrontmatter(content);

        if (meta.priority) {
          const priority = String(meta.priority);
          if (priority === 'low' || priority === 'medium' || priority === 'high') {
            stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
          }
        }

        if (meta.estimated) {
          stats.totalEstimated += parseTime(String(meta.estimated));
        }

        if (meta.actual) {
          stats.totalActual += parseTime(String(meta.actual));
        }
      });
    }
  });

  console.log(bold(`\n${icons.star} Task Statistics\n`));

  console.log(info('Status Distribution:'));
  Object.keys(stats.byStatus).forEach((status) => {
    const count = stats.byStatus[status];
    const statusColor = getStatusColor(status);
    console.log(
      `  ${colorize(status.padEnd(12), /** @type {keyof typeof import('./utils').colors} */ (statusColor))}: ${count}`
    );
  });

  console.log(info('\nPriority Distribution:'));
  /** @type {Array<'low'|'medium'|'high'>} */
  const priorities = ['low', 'medium', 'high'];
  priorities.forEach((priority) => {
    const count = stats.byPriority[priority];
    const priorityColor = getPriorityColor(priority);
    console.log(
      `  ${colorize(priority.padEnd(12), /** @type {keyof typeof import('./utils').colors} */ (priorityColor))}: ${count}`
    );
  });

  console.log(info('\nTime Tracking:'));
  console.log(`  Estimated: ${formatTime(stats.totalEstimated)}`);
  console.log(`  Actual:    ${formatTime(stats.totalActual)}`);

  if (stats.totalEstimated > 0) {
    const variance = stats.totalActual - stats.totalEstimated;
    const varianceColor = variance > 0 ? 'red' : 'green';
    const varianceText = variance > 0 ? '(over)' : '(under)';
    console.log(
      `  Variance:  ${colorize(formatTime(Math.abs(variance)), varianceColor)} ${varianceText}`
    );
  }

  console.log(bold(`\nTotal Tasks: ${stats.total}\n`));
}

/**
 * Archive completed tasks older than specified days
 * @param {number} [days=30] - Number of days threshold for archiving
 */
function archiveOldTasks(days = 30) {
  const completedDir = path.join(TASKS_DIR, 'completed');
  const archivedDir = path.join(TASKS_DIR, 'archived');

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

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'new': {
    const title = args.slice(1).join(' ') || '';
    const priority =
      args[args.indexOf('-p') + 1] || args[args.indexOf('--priority') + 1] || 'medium';
    const assignee = args[args.indexOf('-a') + 1] || args[args.indexOf('--assignee') + 1] || '';

    if (!title) {
      console.log(error('\n Error: Task title is required\n'));
      console.log('Usage: task new <title> [-p priority] [-a assignee]');
      process.exit(1);
    }

    createTask(title, priority, assignee);
    break;
  }

  case 'start': {
    const startTaskId = args[1];
    if (!startTaskId) {
      console.log(error('\n Error: Task ID is required\n'));
      console.log('Usage: task start TASK-XXX');
      process.exit(1);
    }
    moveTask(startTaskId, 'active');
    break;
  }

  case 'done':
  case 'complete': {
    const doneTaskId = args[1];
    if (!doneTaskId) {
      console.log(error('\n Error: Task ID is required\n'));
      console.log('Usage: task done TASK-XXX');
      process.exit(1);
    }
    moveTask(doneTaskId, 'completed');
    break;
  }

  case 'list':
  case 'ls': {
    const status = args[1];
    listTasks(status);
    break;
  }

  case 'view':
  case 'show': {
    const viewTaskId = args[1];
    if (!viewTaskId) {
      console.log(error('\n Error: Task ID is required\n'));
      console.log('Usage: task view TASK-XXX');
      process.exit(1);
    }
    viewTask(viewTaskId);
    break;
  }

  case 'edit': {
    const editTaskId = args[1];
    if (!editTaskId) {
      console.log(error('\n Error: Task ID is required\n'));
      console.log('Usage: task edit TASK-XXX');
      process.exit(1);
    }
    editTask(editTaskId);
    break;
  }

  case 'search':
  case 'find': {
    const searchTerm = args.slice(1).join(' ');
    if (!searchTerm) {
      console.log(error('\n Error: Search term is required\n'));
      console.log('Usage: task search <term>');
      process.exit(1);
    }
    searchTasks(searchTerm);
    break;
  }

  case 'update': {
    const updateTaskId = args[1];
    const field = args[2];
    const value = args.slice(3).join(' ');

    if (!updateTaskId || !field || !value) {
      console.log(error('\n Error: Missing arguments\n'));
      console.log('Usage: task update TASK-XXX <field> <value>');
      console.log('Fields: priority, assignee, estimated, actual, tags');
      process.exit(1);
    }
    updateTask(updateTaskId, field, value);
    break;
  }

  case 'stats':
  case 'statistics': {
    getStats();
    break;
  }

  case 'archive': {
    const days = parseInt(args[1]) || 30;
    archiveOldTasks(days);
    break;
  }

  case 'workspace': {
    const subCommand = args[1];
    const workspaceName = args[2];

    switch (subCommand) {
      case 'list': {
        const workspaces = config.listWorkspaces();
        const activeWorkspace = config.getActiveWorkspace();

        console.log(`\n${bold('Workspaces:')}\n`);
        Object.values(workspaces).forEach((ws) => {
          /** @type {any} */ const workspace = ws;
          const active =
            workspace.name === activeWorkspace.name ? success('● active') : dim('○ inactive');
          console.log(`  ${active} ${bold(workspace.name)}`);
          console.log(`    ${dim(`Path: ${workspace.path}`)}`);
          if (workspace.description) {
            console.log(`    ${dim(`Description: ${workspace.description}`)}`);
          }
          console.log();
        });
        break;
      }

      case 'add': {
        const workspacePath = args[3];
        if (!workspaceName || !workspacePath) {
          error('Usage: task workspace add <name> <path>');
          process.exit(1);
        }

        const description = args[4] || '';
        const newWorkspace = config.addWorkspace(workspaceName, workspacePath, description);

        if (newWorkspace) {
          /** @type {any} */ const ws = newWorkspace;
          success(`✓ Workspace '${workspaceName}' created at ${ws.path}`);
        } else {
          error('Failed to create workspace');
          process.exit(1);
        }
        break;
      }

      case 'switch': {
        if (!workspaceName) {
          error('Usage: task workspace switch <name>');
          process.exit(1);
        }

        const workspace = config.switchWorkspace(workspaceName);
        if (workspace) {
          success(`✓ Switched to workspace '${workspaceName}'`);
          info(`  Tasks: ${config.getTasksDir()}`);
        } else {
          error('Failed to switch workspace');
          process.exit(1);
        }
        break;
      }

      case 'remove': {
        if (!workspaceName) {
          error('Usage: task workspace remove <name> [--delete-files]');
          process.exit(1);
        }

        const deleteFiles = args.includes('--delete-files');
        const removed = config.removeWorkspace(workspaceName, deleteFiles);

        if (removed) {
          success(`✓ Workspace '${workspaceName}' removed`);
          if (deleteFiles) {
            warning('  Files were deleted');
          } else {
            info('  Files were kept (use --delete-files to remove)');
          }
        } else {
          error('Failed to remove workspace');
          process.exit(1);
        }
        break;
      }

      default:
        console.log(`
${bold('Workspace Management')}

${info('Usage:')}
  task workspace list                      List all workspaces
  task workspace add <name> <path>         Create new workspace
  task workspace switch <name>             Switch to workspace
  task workspace remove <name>             Remove workspace

${info('Examples:')}
  task workspace list
  task workspace add project-x ~/projects/x
  task workspace switch project-x
  task workspace remove old-project --delete-files
        `);
    }
    break;
  }

  case 'config': {
    const subCommand = args[1];

    switch (subCommand) {
      case 'show': {
        const currentConfig = config.loadConfig();
        const workspace = config.getActiveWorkspace();

        console.log(`\n${bold('Configuration:')}\n`);
        console.log(`${info('Platform:')} ${config.getPlatform()}`);
        console.log(`${info('Config Dir:')} ${config.getConfigDir()}`);
        console.log(`${info('Data Dir:')} ${config.getDataDir()}\n`);

        /** @type {any} */ const ws = workspace;
        console.log(`${bold('Active Workspace:')} ${ws.name}`);
        console.log(`${info('Tasks Dir:')} ${config.getTasksDir()}`);
        console.log(`${info('Notes Dir:')} ${config.getNotesDir()}\n`);

        console.log(`${bold('Preferences:')}`);
        /** @type {any} */ const cfg = currentConfig;
        Object.entries(cfg.preferences || {}).forEach(([key, value]) => {
          console.log(`  ${dim(key)}: ${value}`);
        });
        console.log();
        break;
      }

      case 'set': {
        const key = args[2];
        const value = args[3];

        if (!key || value === undefined) {
          error('Usage: task config set <key> <value>');
          process.exit(1);
        }

        // Parse boolean and number values
        /** @type {any} */ let parsedValue = value;
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else if (!isNaN(Number(value))) parsedValue = Number(value);

        if (config.updatePreference(key, parsedValue)) {
          success(`✓ Set ${key} = ${parsedValue}`);
        } else {
          error('Failed to update config');
          process.exit(1);
        }
        break;
      }

      case 'get': {
        const key = args[2];
        if (!key) {
          error('Usage: task config get <key>');
          process.exit(1);
        }

        const value = config.getPreference(key);
        if (value !== null) {
          console.log(value);
        } else {
          warning(`Key '${key}' not found`);
        }
        break;
      }

      default:
        console.log(`
${bold('Configuration Management')}

${info('Usage:')}
  task config show                Show current configuration
  task config set <key> <value>   Set preference value
  task config get <key>           Get preference value

${info('Examples:')}
  task config show
  task config set colorOutput true
  task config set autoArchive false
  task config set archiveDays 60
  task config get editor
        `);
    }
    break;
  }

  case 'migrate': {
    const oldPath = args.find((arg, i) => args[i - 1] === '--from');

    if (!oldPath) {
      error('Usage: task migrate --from <old-path>');
      process.exit(1);
    }

    const newPath = config.getWorkDir();
    const migrated = config.migrateFromOldLocation(oldPath, newPath);

    if (migrated) {
      success('✓ Migration completed successfully');
    } else {
      error('Migration failed');
      process.exit(1);
    }
    break;
  }

  case 'open': {
    const openPath = config.getTasksDir();
    console.log(`\n${info('Opening tasks directory:')}`);
    console.log(`  ${openPath}\n`);

    // Try to open in file manager
    const { exec } = require('child_process');
    const platform = config.getPlatform();

    let openCommand;
    if (platform === 'darwin') {
      openCommand = `open "${openPath}"`;
    } else if (platform === 'win32') {
      openCommand = `explorer "${openPath}"`;
    } else {
      openCommand = `xdg-open "${openPath}"`;
    }

    exec(openCommand, (err) => {
      if (err) {
        warning('Could not open file manager automatically');
        info('Please open the path manually');
      }
    });
    break;
  }

  case 'init': {
    const tasksDir = args[1] || '.local-work/tasks';
    const notesDir = args[2] || '.local-work/notes';

    console.log(`${info('Initializing local-work in current project...')}\n`);

    const success = config.initLocalConfig({
      tasksDir,
      notesDir,
    });

    if (success) {
      console.log(`\n${bold('✓ Project initialized!')}`);
      console.log(
        `\nYou can now use ${bold('task')} and ${bold('note')} commands in this directory.`
      );
      console.log(`Tasks and notes will be stored in this project.\n`);
    }
    break;
  }

  default:
    console.log(`
${bold('Task Management CLI')}

${info('Usage:')}
  task init [tasks-dir] [notes-dir]             Initialize local-work in current project
  task new <title> [-p priority] [-a assignee]  Create a new task
  task start TASK-XXX                           Move task to active
  task done TASK-XXX                            Mark task as completed
  task list [status]                            List all tasks or by status
  task view TASK-XXX                            View task details
  task edit TASK-XXX                            Edit task in editor
  task search <term>                            Search tasks by term
  task update TASK-XXX <field> <value>          Update task field
  task stats                                    Show task statistics
  task archive [days]                           Archive old tasks (default: 30)
  task workspace <command>                      Manage workspaces
  task config <command>                         Manage configuration
  task migrate --from <path>                    Migrate from old location
  task open                                     Open tasks directory

${info('Examples:')}
  task init                                     # Use default .local-work/tasks and .local-work/notes
  task init ./my-tasks ./my-notes               # Custom directories (relative to project root)
  task new "Implement login" -p high -a jonhvmp
  task start TASK-001
  task done TASK-001
  task list active
  task view TASK-001
  task edit TASK-001
  task search "authentication"
  task update TASK-001 priority high
  task update TASK-001 tags "backend,auth"
  task stats
  task archive 60
  task workspace list
  task config show
  task open

${info('Statuses:')} backlog, active, completed, archived
${info('Priorities:')} low, medium, high
${info('Fields:')} priority, assignee, estimated, actual, tags
    `);
}

// Export functions for testing
module.exports = {
  getNextTaskId,
  findTask,
  createTask,
  moveTask,
  listTasks,
  viewTask,
  editTask,
  searchTasks,
  updateTask,
  getStats,
  archiveOldTasks,
};
