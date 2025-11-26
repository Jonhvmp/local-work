/**
 * Task statistics and analytics
 * @module task/stats
 */

const fs = require('fs');
const path = require('path');
const {
  info,
  bold,
  icons,
  parseTime,
  formatTime,
  parseFrontmatter,
  colorize,
  getStatusColor,
  getPriorityColor,
} = require('../utils');

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * @typedef {Object} TaskStats
 * @property {string} [priority] - Task priority
 * @property {string} [estimated] - Estimated time
 * @property {string} [actual] - Actual time spent
 */

/**
 * Helper to safely get frontmatter as TaskStats
 * @param {Record<string, unknown>} frontmatter - Raw frontmatter object
 * @returns {TaskStats} Typed task stats
 */
function asTaskStats(frontmatter) {
  return /** @type {TaskStats} */ (frontmatter);
}

/**
 * Display task statistics
 * @param {() => string} getTasksDir - Function to get tasks directory
 */
function getStats(getTasksDir) {
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
    const dirPath = path.join(getTasksDir(), dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((f) => f.startsWith('TASK-'));

      stats.byStatus[dir] = files.length;
      stats.total += files.length;

      files.forEach((file) => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const meta = asTaskStats(parseFrontmatter(content));

        if (meta.priority) {
          const priority = String(meta.priority);
          if (priority === 'low' || priority === 'medium' || priority === 'high') {
            stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
          }
        }

        if (meta.estimated) {
          const estimated = parseTime(String(meta.estimated));
          if (estimated !== null) stats.totalEstimated += estimated;
        }

        if (meta.actual) {
          const actual = parseTime(String(meta.actual));
          if (actual !== null) stats.totalActual += actual;
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
      `  ${colorize(status.padEnd(12), /** @type {keyof typeof import('../utils').colors} */ (statusColor))}: ${count}`
    );
  });

  console.log(info('\nPriority Distribution:'));
  /** @type {Array<'low'|'medium'|'high'>} */
  const priorities = ['low', 'medium', 'high'];
  priorities.forEach((priority) => {
    const count = stats.byPriority[priority];
    const priorityColor = getPriorityColor(priority);
    console.log(
      `  ${colorize(priority.padEnd(12), /** @type {keyof typeof import('../utils').colors} */ (priorityColor))}: ${count}`
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

  return stats;
}

/**
 * Get detailed statistics object (for programmatic use)
 * @param {() => string} getTasksDir - Function to get tasks directory
 * @returns {{total: number, byStatus: Record<string, number>, byPriority: Record<string, number>, totalEstimated: number, totalActual: number}}
 */
function getStatsData(getTasksDir) {
  const dirs = ['active', 'backlog', 'completed', 'archived'];
  const stats = {
    total: 0,
    /** @type {Record<string, number>} */
    byStatus: {},
    /** @type {Record<string, number>} */
    byPriority: { low: 0, medium: 0, high: 0 },
    totalEstimated: 0,
    totalActual: 0,
  };

  dirs.forEach((dir) => {
    const dirPath = path.join(getTasksDir(), dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((f) => f.startsWith('TASK-'));

      stats.byStatus[dir] = files.length;
      stats.total += files.length;

      files.forEach((file) => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        const meta = asTaskStats(parseFrontmatter(content));

        if (meta.priority) {
          const priority = String(meta.priority);
          if (priority === 'low' || priority === 'medium' || priority === 'high') {
            stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
          }
        }

        if (meta.estimated) {
          const estimated = parseTime(String(meta.estimated));
          if (estimated !== null) stats.totalEstimated += estimated;
        }

        if (meta.actual) {
          const actual = parseTime(String(meta.actual));
          if (actual !== null) stats.totalActual += actual;
        }
      });
    }
  });

  return stats;
}

module.exports = {
  getStats,
  getStatsData,
};
