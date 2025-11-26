/**
 * Configuration and preferences management
 * @module config/preferences
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const readline = require('readline');
const { getConfigDir, getConfigPath, getDataDir } = require('./paths');
const { getWorkDir, initializeWorkspace } = require('./workspace');

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * @typedef {Object} PreferencesConfig
 * @property {string} [editor] - Default text editor
 * @property {boolean} [autoOpen] - Auto-open files after creation
 * @property {string} [dateFormat] - Date format preference
 * @property {boolean} [colorOutput] - Enable colored output
 * @property {boolean} [autoArchive] - Auto-archive old tasks
 * @property {number} [archiveDays] - Days before archiving
 * @property {string} [defaultPriority] - Default task priority
 * @property {string} [defaultTaskStatus] - Default task status
 */

/**
 * @typedef {Object} SyncConfig
 * @property {boolean} enabled - Whether sync is enabled
 * @property {string|null} provider - Sync provider name
 * @property {string|null} lastSync - ISO timestamp of last sync
 */

/**
 * @typedef {Object} Config
 * @property {string} version - Config version
 * @property {Object} global - Global workspace settings
 * @property {string} global.tasksDir - Global tasks directory
 * @property {string} global.notesDir - Global notes directory
 * @property {PreferencesConfig} preferences - User preferences
 * @property {SyncConfig} sync - Sync settings
 * @property {string} createdAt - ISO timestamp of config creation
 * @property {string} updatedAt - ISO timestamp of last update
 */

// ============================================================================
// Configuration Management
// ============================================================================

/**
 * Get default configuration (v3.0.0 - simplified)
 * @returns {Config} Default configuration object
 */
function getDefaultConfig() {
  const dataDir = getDataDir();

  return {
    version: '3.0.0',
    global: {
      tasksDir: path.join(dataDir, 'tasks'),
      notesDir: path.join(dataDir, 'notes'),
    },
    preferences: {
      editor: process.env.EDITOR || process.env.VISUAL || 'vim',
      colorOutput: true,
      autoArchive: true,
      archiveDays: 30,
      defaultPriority: 'medium',
      defaultTaskStatus: 'backlog',
    },
    sync: {
      enabled: false,
      provider: null,
      lastSync: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Load configuration from disk
 * Creates default config if file doesn't exist
 * Supports migration from v2.x to v3.0
 * @returns {Config} Configuration object
 */
function loadConfig() {
  const configPath = getConfigPath();

  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);

      // Check version and migrate if needed
      if (config.version && config.version.startsWith('2.')) {
        console.log('\n[!] Detected v2.x configuration. Migration required.');
        console.log('    Run: task migrate\n');
        // For now, return v2 config with defaults merged
        const defaultConfig = getDefaultConfig();
        return {
          ...defaultConfig,
          ...config,
          preferences: {
            ...defaultConfig.preferences,
            ...(config.preferences || {}),
          },
        };
      }

      // Merge with defaults to ensure all fields exist
      const defaultConfig = getDefaultConfig();
      return {
        ...defaultConfig,
        ...config,
        global: {
          ...defaultConfig.global,
          ...(config.global || {}),
        },
        preferences: {
          ...defaultConfig.preferences,
          ...(config.preferences || {}),
        },
        sync: {
          ...defaultConfig.sync,
          ...(config.sync || {}),
        },
      };
    }
  } catch (error) {
    const err = /** @type {Error} */ (error);
    console.error('Error loading config:', err.message);
    console.error('Using default configuration');
  }

  // Create default config
  const defaultConfig = getDefaultConfig();
  saveConfig(defaultConfig);
  return defaultConfig;
}

/**
 * Save configuration to disk
 * @param {Config} config - Configuration object to save
 * @returns {boolean} Success status
 */
function saveConfig(config) {
  const configPath = getConfigPath();
  const configDir = getConfigDir();

  try {
    // Ensure config directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Update timestamp
    config.updatedAt = new Date().toISOString();

    // Write config file
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    const err = /** @type {Error} */ (error);
    console.error('Error saving config:', err.message);
    return false;
  }
}

/**
 * Ensure configuration exists and is valid
 * @returns {Config} Configuration object
 */
function ensureConfigExists() {
  return loadConfig();
}

/**
 * Update a specific preference
 * @param {string} key - Preference key
 * @param {any} value - Preference value
 * @returns {boolean} Success status
 */
function updatePreference(key, value) {
  const config = loadConfig();

  if (!config.preferences) {
    config.preferences = {};
  }

  // @ts-ignore - Dynamic key access is intentional for preferences
  config.preferences[key] = value;
  return saveConfig(config);
}

/**
 * Get a specific preference value
 * @param {string} key - Preference key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Preference value
 */
function getPreference(key, defaultValue = null) {
  const config = loadConfig();
  const preferences = /** @type {Record<string, any>} */ (config.preferences || {});
  return key in preferences ? preferences[key] : defaultValue;
}

// ============================================================================
// Migration from Old Location
// ============================================================================

/**
 * Detect old installation location
 * @returns {string|null} Path to old location or null if not found
 */
function detectOldLocation() {
  // Check common old locations
  const possibleLocations = [
    path.join(os.homedir(), 'documents', 'github', 'ecosystem-jrs-soft', 'local-work'),
    path.join(os.homedir(), 'ecosystem-jrs-soft', 'local-work'),
    path.join(os.homedir(), '.local-work'), // Old simple location
  ];

  for (const location of possibleLocations) {
    const tasksPath = path.join(location, 'tasks');
    const notesPath = path.join(location, 'notes');

    // Check if tasks or notes directory exists with files
    if (fs.existsSync(tasksPath) || fs.existsSync(notesPath)) {
      // Check if there are actual task/note files
      let hasFiles = false;

      if (fs.existsSync(tasksPath)) {
        const taskFiles = fs.readdirSync(tasksPath, { recursive: true });
        hasFiles = taskFiles.some((f) => String(f).endsWith('.md'));
      }

      if (!hasFiles && fs.existsSync(notesPath)) {
        const noteFiles = fs.readdirSync(notesPath, { recursive: true });
        hasFiles = noteFiles.some((f) => String(f).endsWith('.md'));
      }

      if (hasFiles) {
        return location;
      }
    }
  }

  return null;
}

/**
 * Copy directory recursively
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Count files recursively with specific extension
 * @param {string} dir - Directory to search
 * @param {string} ext - File extension (e.g., '.md')
 * @returns {number} File count
 */
function countFilesRecursive(dir, ext) {
  let count = 0;

  if (!fs.existsSync(dir)) {
    return 0;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      count += countFilesRecursive(fullPath, ext);
    } else if (entry.name.endsWith(ext)) {
      count++;
    }
  }

  return count;
}

/**
 * Migrate files from old location to new workspace
 * @param {string} oldPath - Old location path
 * @param {string} newPath - New workspace path
 * @returns {boolean} Success status
 */
function migrateFromOldLocation(oldPath, newPath) {
  try {
    console.log(`\nMigrating from: ${oldPath}`);
    console.log(`           to: ${newPath}\n`);

    // Ensure new path exists
    if (!fs.existsSync(newPath)) {
      fs.mkdirSync(newPath, { recursive: true });
    }

    let migratedCount = 0;

    // Migrate tasks
    const oldTasksPath = path.join(oldPath, 'tasks');
    const newTasksPath = path.join(newPath, 'tasks');

    if (fs.existsSync(oldTasksPath)) {
      console.log('Migrating tasks...');
      copyDirectoryRecursive(oldTasksPath, newTasksPath);
      const taskFiles = countFilesRecursive(newTasksPath, '.md');
      migratedCount += taskFiles;
      console.log(`  [*] Migrated ${taskFiles} task files`);
    }

    // Migrate notes
    const oldNotesPath = path.join(oldPath, 'notes');
    const newNotesPath = path.join(newPath, 'notes');

    if (fs.existsSync(oldNotesPath)) {
      console.log('Migrating notes...');
      copyDirectoryRecursive(oldNotesPath, newNotesPath);
      const noteFiles = countFilesRecursive(newNotesPath, '.md');
      migratedCount += noteFiles;
      console.log(`  [*] Migrated ${noteFiles} note files`);
    }

    console.log(`\n[*] Migration complete! Migrated ${migratedCount} files\n`);
    console.log('Your old files are still in the original location.');
    console.log(`You can safely delete them after verifying the migration.\n`);

    return true;
  } catch (error) {
    const err = /** @type {Error} */ (error);
    console.error('Error during migration:', err.message);
    return false;
  }
}

/**
 * Prompt user for migration
 * @returns {Promise<boolean>} User's choice
 */
function promptMigration() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Would you like to migrate your existing files? (y/n): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Handle first run migration check
 * @returns {Promise<void>}
 */
async function handleFirstRun() {
  const config = loadConfig();

  // Check if this is first run (v2 compatibility)
  // @ts-ignore - firstRun only exists in v2 configs
  if (!config.firstRun) {
    return;
  }

  console.log('\n[*] Welcome to local-work CLI!\n');

  // Detect old location
  const oldLocation = detectOldLocation();

  if (oldLocation) {
    console.log(`[>] Found existing tasks/notes at: ${oldLocation}\n`);

    const shouldMigrate = await promptMigration();

    if (shouldMigrate) {
      const newPath = getWorkDir();
      migrateFromOldLocation(oldLocation, newPath);
    } else {
      console.log('\nSkipping migration. You can migrate later using:');
      console.log('  task migrate --from <old-path>\n');
    }
  } else {
    console.log('Initializing workspace...\n');
    initializeWorkspace(getWorkDir());
  }

  // Mark first run as complete (v2 compatibility)
  // @ts-ignore - firstRun only exists in v2 configs
  config.firstRun = false;
  saveConfig(config);
}

module.exports = {
  // Configuration management
  getDefaultConfig,
  loadConfig,
  saveConfig,
  ensureConfigExists,
  updatePreference,
  getPreference,

  // Migration
  detectOldLocation,
  migrateFromOldLocation,
  promptMigration,
  handleFirstRun,
};
