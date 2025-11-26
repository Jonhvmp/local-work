/**
 * @fileoverview Task Standup Report
 * @description Generate standup reports based on task activity
 */

const fs = require('fs');
const path = require('path');
const { success, dim, bold, icons, colorize } = require('../utils/colors');
const { parseFrontmatter } = require('../utils/format');

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * @typedef {Object} StandupOptions
 * @property {boolean} [yesterday] - Include yesterday section
 * @property {boolean} [today] - Include today section
 * @property {boolean} [blockers] - Include blockers section
 * @property {'text'|'markdown'|'json'} [format] - Output format
 * @property {string} [output] - Output file path
 */

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a Date object is from yesterday
 * @param {Date} date - Date object to check
 * @returns {boolean} True if date is yesterday
 */
function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Check if a Date object is within this week (Monday to Sunday)
 * @param {Date} date - Date object to check
 * @returns {boolean} True if date is this week
 */
function isThisWeek(date) {
  const today = new Date();

  // Get Monday of current week
  const monday = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  // Get Sunday of current week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return date >= monday && date <= sunday;
}

/**
 * Get all tasks from a directory
 * @param {string} dirPath - Directory to scan
 * @returns {Array<{id: string, title: string, status: string, priority: string, updated: string, created: string, path: string}>}
 */
function getTasksFromDir(dirPath) {
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath)
    .filter((f) => f.startsWith('TASK-') && f.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(dirPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { frontmatter } = parseFrontmatter(content);
      /** @type {any} */
      const meta = frontmatter;

      return {
        id: meta.id || file.split('-')[0] + '-' + file.split('-')[1],
        title: meta.title || file,
        status: meta.status || path.basename(dirPath),
        priority: meta.priority || 'medium',
        updated: meta.updated || meta.created || '',
        created: meta.created || '',
        path: filePath,
      };
    });
}

/**
 * Filter tasks updated within a date range
 * @param {Array<{updated: string}>} tasks - Tasks to filter
 * @param {(date: Date) => boolean} dateFilter - Filter function
 * @returns {Array<any>}
 */
function filterByDate(tasks, dateFilter) {
  return tasks.filter((task) => {
    if (!task.updated) return false;
    const taskDate = new Date(task.updated);
    return dateFilter(taskDate);
  });
}

/**
 * Generate standup report
 * @param {() => string} getTasksDir - Function to get tasks directory
 * @param {Object} [options] - Options
 * @param {boolean} [options.yesterday] - Include yesterday's work (default: true)
 * @param {boolean} [options.today] - Include today's plan (default: true)
 * @param {boolean} [options.blockers] - Include blockers (default: true)
 * @param {'text'|'markdown'|'json'} [options.format] - Output format (default: 'text')
 * @returns {string} Formatted standup report
 */
function generateStandup(getTasksDir, options = {}) {
  const { yesterday = true, today = true, blockers = true, format = 'text' } = options;

  const tasksDir = getTasksDir();

  // Collect all tasks
  const allTasks = [
    ...getTasksFromDir(path.join(tasksDir, 'active')),
    ...getTasksFromDir(path.join(tasksDir, 'completed')),
    ...getTasksFromDir(path.join(tasksDir, 'backlog')),
  ];

  // Filter tasks by date
  const yesterdayTasks = filterByDate(allTasks, isYesterday).filter(
    (t) => t.status === 'completed' || t.status === 'active'
  );

  const todayTasks = allTasks.filter((t) => t.status === 'active');

  // High priority backlog items as potential blockers
  const blockerTasks = allTasks.filter(
    (t) => t.status === 'backlog' && (t.priority === 'high' || t.priority === 'urgent')
  );

  // Generate report based on format
  if (format === 'json') {
    return JSON.stringify(
      {
        yesterday: yesterdayTasks,
        today: todayTasks,
        blockers: blockerTasks,
        generated: new Date().toISOString(),
      },
      null,
      2
    );
  }

  if (format === 'markdown') {
    return generateMarkdownReport(yesterdayTasks, todayTasks, blockerTasks, {
      yesterday,
      today,
      blockers,
    });
  }

  // Default: text format
  return generateTextReport(yesterdayTasks, todayTasks, blockerTasks, {
    yesterday,
    today,
    blockers,
  });
}

/**
 * Generate text format report
 * @param {Array<any>} yesterdayTasks - Tasks from yesterday
 * @param {Array<any>} todayTasks - Tasks for today
 * @param {Array<any>} blockerTasks - Potential blockers
 * @param {StandupOptions} options - Standup options
 * @returns {string}
 */
function generateTextReport(yesterdayTasks, todayTasks, blockerTasks, options) {
  const lines = [];

  lines.push('');
  lines.push(bold(`${icons.task} Standup Report`));
  lines.push(dim(`Generated: ${new Date().toLocaleDateString()}`));
  lines.push('');

  // Yesterday section
  if (options.yesterday) {
    lines.push(colorize(`${icons.arrow} What I worked on yesterday:`, 'cyan'));
    if (yesterdayTasks.length === 0) {
      lines.push(dim('  No tasks updated yesterday'));
    } else {
      yesterdayTasks.forEach((task) => {
        const statusIcon = task.status === 'completed' ? icons.check : icons.clock;
        lines.push(`  ${statusIcon} ${task.title}`);
        lines.push(dim(`     ${task.id} - ${task.status}`));
      });
    }
    lines.push('');
  }

  // Today section
  if (options.today) {
    lines.push(colorize(`${icons.arrow} What I'm working on today:`, 'green'));
    if (todayTasks.length === 0) {
      lines.push(dim('  No active tasks'));
    } else {
      todayTasks.forEach((task) => {
        const priorityColor =
          task.priority === 'high' ? 'red' : task.priority === 'urgent' ? 'magenta' : 'yellow';
        lines.push(`  ${icons.bullet} ${task.title}`);
        lines.push(dim(`     ${task.id} - ${colorize(task.priority, priorityColor)}`));
      });
    }
    lines.push('');
  }

  // Blockers section
  if (options.blockers) {
    lines.push(colorize(`${icons.arrow} Blockers / Issues:`, 'red'));
    if (blockerTasks.length === 0) {
      lines.push(dim('  No blockers'));
    } else {
      blockerTasks.forEach((task) => {
        lines.push(`  ${icons.warning} ${task.title}`);
        lines.push(dim(`     ${task.id} - ${task.priority} priority in backlog`));
      });
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate markdown format report
 * @param {Array<any>} yesterdayTasks - Tasks from yesterday
 * @param {Array<any>} todayTasks - Tasks for today
 * @param {Array<any>} blockerTasks - Potential blockers
 * @param {StandupOptions} options - Standup options
 * @returns {string}
 */
function generateMarkdownReport(yesterdayTasks, todayTasks, blockerTasks, options) {
  const lines = [];

  lines.push(`# Standup Report - ${new Date().toLocaleDateString()}`);
  lines.push('');

  // Yesterday section
  if (options.yesterday) {
    lines.push('## What I worked on yesterday');
    lines.push('');
    if (yesterdayTasks.length === 0) {
      lines.push('- No tasks updated yesterday');
    } else {
      yesterdayTasks.forEach((task) => {
        const statusMark = task.status === 'completed' ? '[x]' : '[ ]';
        lines.push(`- ${statusMark} **${task.title}** (${task.id})`);
      });
    }
    lines.push('');
  }

  // Today section
  if (options.today) {
    lines.push("## What I'm working on today");
    lines.push('');
    if (todayTasks.length === 0) {
      lines.push('- No active tasks');
    } else {
      todayTasks.forEach((task) => {
        lines.push(`- [ ] **${task.title}** (${task.id}) - ${task.priority}`);
      });
    }
    lines.push('');
  }

  // Blockers section
  if (options.blockers) {
    lines.push('## Blockers / Issues');
    lines.push('');
    if (blockerTasks.length === 0) {
      lines.push('- No blockers');
    } else {
      blockerTasks.forEach((task) => {
        lines.push(`- ⚠️ **${task.title}** (${task.id}) - ${task.priority} priority`);
      });
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Print standup report to console
 * @param {() => string} getTasksDir - Function to get tasks directory
 * @param {Object} [options] - Options
 */
function printStandup(getTasksDir, options = {}) {
  const report = generateStandup(getTasksDir, options);
  console.log(report);
}

/**
 * Get weekly summary of completed tasks
 * @param {() => string} getTasksDir - Function to get tasks directory
 * @returns {string} Weekly summary report
 */
function getWeeklySummary(getTasksDir) {
  const tasksDir = getTasksDir();

  const completedTasks = getTasksFromDir(path.join(tasksDir, 'completed'));
  const weekTasks = filterByDate(completedTasks, isThisWeek);

  const lines = [];
  lines.push('');
  lines.push(bold(`${icons.task} Weekly Summary`));
  lines.push(dim(`Week of ${new Date().toLocaleDateString()}`));
  lines.push('');

  if (weekTasks.length === 0) {
    lines.push(dim('No tasks completed this week'));
  } else {
    lines.push(success(`${icons.check} ${weekTasks.length} tasks completed`));
    lines.push('');

    weekTasks.forEach((task) => {
      lines.push(`  ${icons.check} ${task.title}`);
      lines.push(dim(`     ${task.id} - completed`));
    });
  }

  lines.push('');
  return lines.join('\n');
}

module.exports = {
  generateStandup,
  printStandup,
  getWeeklySummary,
  getTasksFromDir,
  filterByDate,
};
