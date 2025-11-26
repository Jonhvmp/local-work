/**
 * File system utilities
 * @module utils/file
 */

const fs = require('fs');
const path = require('path');

/**
 * Ensure directory exists, creating it if necessary
 * @param {string} dir - Directory path to ensure
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Sanitize path to prevent path traversal attacks
 * @param {string} basePath - Base directory path
 * @param {string} relativePath - Relative path to sanitize
 * @returns {string} Sanitized absolute path
 */
function sanitizePath(basePath, relativePath) {
  const resolvedPath = path.resolve(basePath, relativePath);
  if (!resolvedPath.startsWith(basePath)) {
    throw new Error('Invalid path: path traversal detected');
  }
  return resolvedPath;
}

/**
 * Check if file exists
 * @param {string} filePath - Path to check
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Read file contents
 * @param {string} filePath - Path to read
 * @returns {string} File contents
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Write file contents
 * @param {string} filePath - Path to write
 * @param {string} content - Content to write
 */
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Delete file
 * @param {string} filePath - Path to delete
 */
function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * List files in directory
 * @param {string} dir - Directory path
 * @returns {string[]} List of file names
 */
function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir);
}

/**
 * List files with extension filter
 * @param {string} dir - Directory path
 * @param {string} ext - Extension to filter (e.g., '.md')
 * @returns {string[]} List of matching file names
 */
function listFilesByExtension(dir, ext) {
  return listFiles(dir).filter((f) => f.endsWith(ext));
}

/**
 * Get file stats
 * @param {string} filePath - Path to file
 * @returns {fs.Stats|null} File stats or null if not found
 */
function getFileStats(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

/**
 * Get modification time of file
 * @param {string} filePath - Path to file
 * @returns {Date|null} Modification time or null if not found
 */
function getModificationTime(filePath) {
  const stats = getFileStats(filePath);
  return stats ? stats.mtime : null;
}

/**
 * Copy file from source to destination
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 */
function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
}

/**
 * Create temp file with content
 * @param {string} content - Content to write
 * @param {string} ext - File extension (default: '.md')
 * @returns {string} Path to temp file
 */
function createTempFile(content, ext = '.md') {
  const os = require('os');
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `local-work-${Date.now()}${ext}`);
  writeFile(tempPath, content);
  return tempPath;
}

module.exports = {
  ensureDir,
  sanitizePath,
  fileExists,
  readFile,
  writeFile,
  deleteFile,
  listFiles,
  listFilesByExtension,
  getFileStats,
  getModificationTime,
  copyFile,
  createTempFile,
};
