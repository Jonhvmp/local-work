/**
 * ANSI color utilities for CLI output
 * @module utils/colors
 */

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

/**
 * Apply ANSI color to text
 * @param {string} text - Text to colorize
 * @param {keyof typeof colors} color - Color name from colors object
 * @returns {string} Colorized text with ANSI codes
 */
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Format text as success message (green)
 * @param {string} text - Text to format
 * @returns {string} Green colored text
 */
function success(text) {
  return colorize(text, 'green');
}

/**
 * Format text as error message (red)
 * @param {string} text - Text to format
 * @returns {string} Red colored text
 */
function error(text) {
  return colorize(text, 'red');
}

/**
 * Format text as warning message (yellow)
 * @param {string} text - Text to format
 * @returns {string} Yellow colored text
 */
function warning(text) {
  return colorize(text, 'yellow');
}

/**
 * Format text as info message (blue)
 * @param {string} text - Text to format
 * @returns {string} Blue colored text
 */
function info(text) {
  return colorize(text, 'blue');
}

/**
 * Format text as dimmed
 * @param {string} text - Text to format
 * @returns {string} Dimmed text
 */
function dim(text) {
  return colorize(text, 'dim');
}

/**
 * Format text as bold
 * @param {string} text - Text to format
 * @returns {string} Bold text
 */
function bold(text) {
  return colorize(text, 'bright');
}

/**
 * Get color for task status
 * @param {string} status - Task status (backlog, active, completed, archived)
 * @returns {string} Color name for the status
 */
function getStatusColor(status) {
  const statusColors = {
    backlog: 'blue',
    active: 'yellow',
    completed: 'green',
    archived: 'gray',
  };
  return statusColors[/** @type {keyof statusColors} */ (status)] || 'white';
}

/**
 * Get color for task priority
 * @param {string} priority - Task priority (low, medium, high)
 * @returns {string} Color name for the priority
 */
function getPriorityColor(priority) {
  const priorityColors = {
    low: 'gray',
    medium: 'yellow',
    high: 'red',
  };
  return priorityColors[/** @type {keyof priorityColors} */ (priority)] || 'white';
}

// Text-based icons (no emojis)
const icons = {
  task: '[T]',
  note: '[N]',
  check: '[*]',
  cross: '[X]',
  arrow: '->',
  bullet: '-',
  star: '*',
  info: '[i]',
  warning: '[!]',
  error: '[X]',
  success: '[*]',
  edit: '[E]',
  clock: '[~]',
  calendar: '[#]',
};

module.exports = {
  colors,
  colorize,
  success,
  error,
  warning,
  info,
  dim,
  bold,
  getStatusColor,
  getPriorityColor,
  icons,
};
