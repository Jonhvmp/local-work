/**
 * Task listing and search operations
 * @module task/list
 */

const fs = require('fs');
const path = require('path');
const {
  dim,
  bold,
  icons,
  formatDate,
  parseFrontmatter,
  formatTable,
  colorize,
  getStatusColor,
  getPriorityColor,
  error,
} = require('../utils');

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * @typedef {Object} TaskMeta
 * @property {string} [id] - Task ID
 * @property {string} [title] - Task title
 * @property {string} [status] - Task status
 * @property {string} [priority] - Task priority
 * @property {string} [assignee] - Person assigned
 * @property {string} [estimated] - Estimated time
 * @property {string} [actual] - Actual time spent
 * @property {string} [created] - Creation date
 * @property {string} [updated] - Last update date
 * @property {string} [completedAt] - Completion date
 * @property {string|string[]} [tags] - Task tags
 */

/**
 * Helper to safely get frontmatter as TaskMeta
 * @param {Record<string, unknown>} frontmatter - Raw frontmatter object
 * @returns {TaskMeta} Typed task metadata
 */
function asTaskMeta(frontmatter) {
  return /** @type {TaskMeta} */ (frontmatter);
}

// ============================================================================
// List Tasks
// ============================================================================

/**
 * List tasks by status
 * @param {() => string} getTasksDir - Function to get tasks directory
 * @param {string|null} [status=null] - Specific status to filter by, or null for all active statuses
 */
function listTasks(getTasksDir, status = null) {
  const dirs = status ? [status] : ['active', 'backlog', 'completed'];
  /** @type {Array<{id: string, title: string, status: string, priority: string, assignee: string, estimated: string, actual: string, created: string}>} */
  const allTasks = [];

  dirs.forEach((dir) => {
    const dirPath = path.join(getTasksDir(), dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((f) => f.startsWith('TASK-'));

      files.forEach((file) => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const meta = asTaskMeta(parseFrontmatter(content));

        allTasks.push({
          id: String(meta.id || file.split('-').slice(0, 2).join('-')),
          title: String(meta.title || 'Unknown'),
          status: String(meta.status || dir),
          priority: String(meta.priority || 'medium'),
          assignee: String(meta.assignee || '-'),
          estimated: String(meta.estimated || '0h'),
          actual: String(meta.actual || '0h'),
          created: String(meta.created || ''),
        });
      });
    }
  });

  if (allTasks.length === 0) {
    console.log(dim(`\n${icons.info} No tasks found\n`));
    return;
  }

  console.log(bold(`\n${icons.task} Tasks Overview\n`));

  /** @type {Record<string, Array<{id: string, title: string, status: string, priority: string, assignee: string, estimated: string, actual: string, created: string}>>} */
  const groupedByStatus = {};
  allTasks.forEach((task) => {
    if (!groupedByStatus[task.status]) {
      groupedByStatus[task.status] = [];
    }
    groupedByStatus[task.status].push(task);
  });

  Object.keys(groupedByStatus).forEach((statusKey) => {
    const tasks = groupedByStatus[statusKey];
    const statusColor = getStatusColor(statusKey);

    console.log(
      colorize(
        `\n> ${statusKey.toUpperCase()} (${tasks.length})`,
        /** @type {keyof typeof import('../utils').colors} */ (statusColor)
      )
    );

    tasks.forEach((task) => {
      const priorityColor = getPriorityColor(task.priority);
      const priorityBadge = colorize(
        `[${task.priority}]`,
        /** @type {keyof typeof import('../utils').colors} */ (priorityColor)
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
 * @param {(taskId: string, getTasksDir: () => string) => {file: string, path: string, status: string}|null} findTask - Function to find task
 * @param {() => string} getTasksDir - Function to get tasks directory
 */
function viewTask(taskId, findTask, getTasksDir) {
  const task = findTask(taskId, getTasksDir);

  if (!task) {
    console.log(error(`\n${icons.cross} Task ${taskId} not found\n`));
    return;
  }

  const content = fs.readFileSync(task.path, 'utf8');
  const meta = asTaskMeta(parseFrontmatter(content));

  const statusStr = String(meta.status);
  const priorityStr = String(meta.priority);

  console.log(bold(`\n${icons.task} ${meta.title}\n`));
  console.log(
    formatTable(
      ['Field', 'Value'],
      [
        ['ID', meta.id || '-'],
        [
          'Status',
          colorize(
            statusStr,
            /** @type {keyof typeof import('../utils').colors} */ (getStatusColor(statusStr))
          ),
        ],
        [
          'Priority',
          colorize(
            priorityStr,
            /** @type {keyof typeof import('../utils').colors} */ (getPriorityColor(priorityStr))
          ),
        ],
        ['Assignee', meta.assignee || '-'],
        ['Created', formatDate(String(meta.created))],
        ['Updated', formatDate(String(meta.updated))],
        ['Estimated', meta.estimated || '-'],
        ['Actual', meta.actual || '-'],
        ['Tags', Array.isArray(meta.tags) ? meta.tags.join(', ') : meta.tags || '-'],
      ]
    )
  );

  // Show content without frontmatter
  const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  console.log(dim('\n' + '-'.repeat(53) + '\n'));
  console.log(bodyContent);
}

/**
 * Search for tasks by term
 * @param {string} searchTerm - Search query (searches in title, assignee, and tags)
 * @param {() => string} getTasksDir - Function to get tasks directory
 * @param {boolean} [includeArchived=false] - Whether to include archived tasks
 * @returns {Array<{id: string, title: string, status: string, priority: string, assignee: string, file: string, path: string}>} Array of matching tasks
 */
function searchTasks(searchTerm, getTasksDir, includeArchived = false) {
  const dirs = includeArchived
    ? ['active', 'backlog', 'completed', 'archived']
    : ['active', 'backlog', 'completed'];
  /** @type {Array<{id: string, title: string, status: string, priority: string, assignee: string, file: string, path: string}>} */
  const results = [];

  dirs.forEach((dir) => {
    const dirPath = path.join(getTasksDir(), dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((f) => f.startsWith('TASK-'));

      files.forEach((file) => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const meta = asTaskMeta(parseFrontmatter(content));

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
        `  Status: ${colorize(task.status, /** @type {keyof typeof import('../utils').colors} */ (statusColor))} | Priority: ${colorize(task.priority, /** @type {keyof typeof import('../utils').colors} */ (priorityColor))}`
      )
    );
  });

  return results; // Always return results array
}

/**
 * Get all tasks data for external use (e.g., standup)
 * @param {() => string} getTasksDir - Function to get tasks directory
 * @param {string[]} [statusFilter] - Statuses to include
 * @returns {Array<{id: string, title: string, status: string, priority: string, assignee: string, estimated: string, actual: string, created: string, updated: string, completedAt?: string}>}
 */
function getAllTasks(getTasksDir, statusFilter = ['active', 'backlog', 'completed', 'archived']) {
  /** @type {Array<{id: string, title: string, status: string, priority: string, assignee: string, estimated: string, actual: string, created: string, updated: string, completedAt?: string}>} */
  const allTasks = [];

  statusFilter.forEach((dir) => {
    const dirPath = path.join(getTasksDir(), dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((f) => f.startsWith('TASK-'));

      files.forEach((file) => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const meta = asTaskMeta(parseFrontmatter(content));

        allTasks.push({
          id: String(meta.id || file.split('-').slice(0, 2).join('-')),
          title: String(meta.title || 'Unknown'),
          status: String(meta.status || dir),
          priority: String(meta.priority || 'medium'),
          assignee: String(meta.assignee || ''),
          estimated: String(meta.estimated || '0h'),
          actual: String(meta.actual || '0h'),
          created: String(meta.created || ''),
          updated: String(meta.updated || ''),
          completedAt: meta.completedAt ? String(meta.completedAt) : undefined,
        });
      });
    }
  });

  return allTasks;
}

module.exports = {
  listTasks,
  viewTask,
  searchTasks,
  getAllTasks,
};
