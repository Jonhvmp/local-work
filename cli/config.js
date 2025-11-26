#!/usr/bin/env node

/**
 * Configuration management for local-work CLI
 * Re-exports from modular config/ directory for backward compatibility
 * @module cli/config
 */

const config = require('./config/index');

// Re-export all configuration functions from modular structure
module.exports = {
  // Platform detection
  getPlatform: config.getPlatform,
  isWindows: config.isWindows,
  isMac: config.isMac,
  isLinux: config.isLinux,

  // Directory resolution
  getConfigDir: config.getConfigDir,
  getDataDir: config.getDataDir,
  getConfigPath: config.getConfigPath,
  findLocalConfig: config.findLocalConfig,
  loadLocalConfig: config.loadLocalConfig,
  initLocalConfig: config.initLocalConfig,
  findProjectRoot: config.findProjectRoot,

  // Configuration management
  getDefaultConfig: config.getDefaultConfig,
  loadConfig: config.loadConfig,
  saveConfig: config.saveConfig,
  ensureConfigExists: config.ensureConfigExists,
  updatePreference: config.updatePreference,
  getPreference: config.getPreference,

  // Workspace resolution (v3.0.0 - Git-like model)
  resolveWorkspace: config.resolveWorkspace,

  // Working directories
  getTasksDir: config.getTasksDir,
  getNotesDir: config.getNotesDir,
  getWorkDir: config.getWorkDir,

  // Initialization
  initializeWorkspace: config.initializeWorkspace,
  ensureDirectoryStructure: config.ensureDirectoryStructure,

  // Migration
  detectOldLocation: config.detectOldLocation,
  migrateFromOldLocation: config.migrateFromOldLocation,
  promptMigration: config.promptMigration,
  handleFirstRun: config.handleFirstRun,
};
