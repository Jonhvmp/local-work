/**
 * Utility functions for CLI scripts
 * Re-exports from modular utils/ directory for backward compatibility
 * @module cli/utils
 */

const utils = require('./utils/index');

// Re-export all utilities from modular structure
module.exports = {
  // Colors and formatting
  colors: utils.colors,
  colorize: utils.colorize,
  success: utils.success,
  error: utils.error,
  warning: utils.warning,
  info: utils.info,
  dim: utils.dim,
  bold: utils.bold,
  getStatusColor: utils.getStatusColor,
  getPriorityColor: utils.getPriorityColor,
  icons: utils.icons,

  // Date utilities
  formatDate: utils.formatDate,
  parseTime: utils.parseTime,
  formatTime: utils.formatTime,
  getCurrentDate: utils.getCurrentDate,
  getCurrentTime: utils.getCurrentTime,
  getCurrentDateTime: utils.getCurrentDateTime,

  // File utilities
  ensureDir: utils.ensureDir,

  // Editor utilities
  openInEditor: utils.openInEditor,

  // Format utilities
  parseFrontmatter: utils.parseFrontmatter,
  updateFrontmatter: utils.updateFrontmatter,
  formatTable: utils.formatTable,
  progressBar: utils.progressBar,
};
