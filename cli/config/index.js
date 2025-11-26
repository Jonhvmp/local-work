/**
 * Configuration module - exports all config functions
 * @module config
 */

// Re-export all configuration modules
const paths = require('./paths');
const workspace = require('./workspace');
const preferences = require('./preferences');

module.exports = {
  // Platform detection
  getPlatform: paths.getPlatform,
  isWindows: paths.isWindows,
  isMac: paths.isMac,
  isLinux: paths.isLinux,

  // Directory resolution
  getConfigDir: paths.getConfigDir,
  getDataDir: paths.getDataDir,
  getConfigPath: paths.getConfigPath,
  findLocalConfig: paths.findLocalConfig,
  loadLocalConfig: paths.loadLocalConfig,
  findProjectRoot: paths.findProjectRoot,

  // Workspace resolution (v3.0.0 - Git-like model)
  resolveWorkspace: workspace.resolveWorkspace,
  getTasksDir: workspace.getTasksDir,
  getNotesDir: workspace.getNotesDir,
  getWorkDir: workspace.getWorkDir,

  // Initialization
  initializeWorkspace: workspace.initializeWorkspace,
  ensureDirectoryStructure: workspace.ensureDirectoryStructure,
  initLocalConfig: workspace.initLocalConfig,

  // Configuration management
  getDefaultConfig: preferences.getDefaultConfig,
  loadConfig: preferences.loadConfig,
  saveConfig: preferences.saveConfig,
  ensureConfigExists: preferences.ensureConfigExists,
  updatePreference: preferences.updatePreference,
  getPreference: preferences.getPreference,

  // Migration
  detectOldLocation: preferences.detectOldLocation,
  migrateFromOldLocation: preferences.migrateFromOldLocation,
  promptMigration: preferences.promptMigration,
  handleFirstRun: preferences.handleFirstRun,
};
