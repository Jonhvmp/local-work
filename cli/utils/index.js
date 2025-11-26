/**
 * Utilities module - exports all utility functions
 * @module utils
 */

// Re-export all utilities from submodules
const colors = require('./colors');
const date = require('./date');
const file = require('./file');
const format = require('./format');
const editor = require('./editor');

module.exports = {
  // Colors and formatting
  colors: colors.colors,
  colorize: colors.colorize,
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.info,
  dim: colors.dim,
  bold: colors.bold,
  getStatusColor: colors.getStatusColor,
  getPriorityColor: colors.getPriorityColor,
  icons: colors.icons,

  // Date utilities
  formatDate: date.formatDate,
  parseTime: date.parseTime,
  formatTime: date.formatTime,
  getCurrentDate: date.getCurrentDate,
  getCurrentTime: date.getCurrentTime,
  getCurrentDateTime: date.getCurrentDateTime,
  isToday: date.isToday,
  isYesterday: date.isYesterday,
  isThisWeek: date.isThisWeek,
  getDayName: date.getDayName,
  formatDateLong: date.formatDateLong,

  // File utilities
  ensureDir: file.ensureDir,
  sanitizePath: file.sanitizePath,
  fileExists: file.fileExists,
  readFile: file.readFile,
  writeFile: file.writeFile,
  deleteFile: file.deleteFile,
  listFiles: file.listFiles,
  listFilesByExtension: file.listFilesByExtension,
  getFileStats: file.getFileStats,
  getModificationTime: file.getModificationTime,
  copyFile: file.copyFile,
  createTempFile: file.createTempFile,

  // Format utilities
  parseFrontmatter: format.parseFrontmatter,
  updateFrontmatter: format.updateFrontmatter,
  updateFrontmatterBatch: format.updateFrontmatterBatch,
  formatTable: format.formatTable,
  progressBar: format.progressBar,
  truncate: format.truncate,
  pad: format.pad,
  center: format.center,
  wordWrap: format.wordWrap,
  formatNumber: format.formatNumber,
  indent: format.indent,

  // Editor utilities
  getDefaultEditor: editor.getDefaultEditor,
  openInEditor: editor.openInEditor,
  openInVSCode: editor.openInVSCode,
  openWithDefault: editor.openWithDefault,
};
