/**
 * Platform detection and directory paths utilities
 * @module config/paths
 */

const os = require('os');
const path = require('path');
const fs = require('fs');

// ============================================================================
// Platform Detection
// ============================================================================

/**
 * Get current platform
 * @returns {string} Platform identifier
 */
function getPlatform() {
  return os.platform();
}

/**
 * Check if running on Windows
 * @returns {boolean}
 */
function isWindows() {
  return getPlatform() === 'win32';
}

/**
 * Check if running on macOS
 * @returns {boolean}
 */
function isMac() {
  return getPlatform() === 'darwin';
}

/**
 * Check if running on Linux
 * @returns {boolean}
 */
function isLinux() {
  return getPlatform() === 'linux';
}

// ============================================================================
// Directory Resolution (Cross-Platform)
// ============================================================================

/**
 * Get platform-specific configuration directory
 * - Windows: %APPDATA%\local-work
 * - macOS: ~/Library/Application Support/local-work
 * - Linux: ~/.config/local-work (XDG_CONFIG_HOME)
 * @returns {string} Configuration directory path
 */
function getConfigDir() {
  if (isWindows()) {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    return path.join(appData, 'local-work');
  } else if (isMac()) {
    return path.join(os.homedir(), 'Library', 'Application Support', 'local-work');
  } else {
    // Linux - XDG Base Directory
    const xdgConfig = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
    return path.join(xdgConfig, 'local-work');
  }
}

/**
 * Get platform-specific data directory
 * - Windows: %LOCALAPPDATA%\local-work
 * - macOS: ~/Library/Application Support/local-work
 * - Linux: ~/.local/share/local-work (XDG_DATA_HOME)
 * @returns {string} Data directory path
 */
function getDataDir() {
  if (isWindows()) {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    return path.join(localAppData, 'local-work');
  } else if (isMac()) {
    return path.join(os.homedir(), 'Library', 'Application Support', 'local-work');
  } else {
    // Linux - XDG Base Directory
    const xdgData = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
    return path.join(xdgData, 'local-work');
  }
}

/**
 * Get configuration file path
 * @returns {string} Full path to config.json
 */
function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

/**
 * Find local project configuration file
 * Searches from current directory up to root for .local-work/config.json
 * @param {string} [startDir] - Directory to start search from (defaults to cwd)
 * @returns {string|null} Path to local config file or null if not found
 */
function findLocalConfig(startDir = process.cwd()) {
  let currentDir = path.resolve(startDir);
  const rootDir = path.parse(currentDir).root;

  while (currentDir !== rootDir) {
    const configPath = path.join(currentDir, '.local-work', 'config.json');
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    currentDir = path.dirname(currentDir);
  }

  // Check root directory
  const rootConfigPath = path.join(rootDir, '.local-work', 'config.json');
  if (fs.existsSync(rootConfigPath)) {
    return rootConfigPath;
  }

  return null;
}

/**
 * Load local project configuration
 * @param {string} configPath - Path to local config file
 * @returns {Object|null} Local configuration or null if invalid
 */
function loadLocalConfig(configPath) {
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    const err = /** @type {Error} */ (error);
    console.error(`Error loading local config from ${configPath}:`, err.message);
    return null;
  }
}

/**
 * Find project root by searching for common project markers
 * Searches up the directory tree for files like .git, package.json, etc.
 * @param {string} startDir - Directory to start searching from
 * @returns {string|null} Project root directory or null if not found
 */
function findProjectRoot(startDir) {
  const projectMarkers = [
    '.git',
    'package.json',
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'pyproject.toml',
    'setup.py',
    'composer.json',
    'Gemfile',
  ];

  let currentDir = path.resolve(startDir);
  const rootDir = path.parse(currentDir).root;

  while (currentDir !== rootDir) {
    // Check if any project marker exists in current directory
    for (const marker of projectMarkers) {
      const markerPath = path.join(currentDir, marker);
      if (fs.existsSync(markerPath)) {
        return currentDir;
      }
    }

    // Move up one directory
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // Reached root
    }
    currentDir = parentDir;
  }

  return null; // No project marker found
}

module.exports = {
  // Platform detection
  getPlatform,
  isWindows,
  isMac,
  isLinux,

  // Directory resolution
  getConfigDir,
  getDataDir,
  getConfigPath,
  findLocalConfig,
  loadLocalConfig,
  findProjectRoot,
};
