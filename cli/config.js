#!/usr/bin/env node

/**
 * Configuration management for local-work CLI
 * Handles cross-platform directory resolution, workspaces, and settings
 * Follows XDG Base Directory specification on Linux
 */

const os = require('os');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * @typedef {Object} WorkspaceConfig
 * @property {string} name - Workspace name
 * @property {string} path - Workspace directory path
 * @property {string} [description] - Workspace description
 * @property {boolean} active - Whether workspace is active
 * @property {string} [createdAt] - ISO timestamp of creation
 */

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

/**
 * Initialize local project configuration
 * Creates .local-work/config.json in project root (auto-detected or current directory)
 * @param {Object} options - Initialization options
 * @param {string} [options.tasksDir] - Tasks directory path (relative or absolute)
 * @param {string} [options.notesDir] - Notes directory path (relative or absolute)
 * @param {boolean} [options.here] - Force creation in current directory (skip auto-detection)
 * @returns {boolean} Success status
 */
function initLocalConfig(options = {}) {
  const cwd = process.cwd();

  // First, check if a config already exists above
  const existingConfig = findLocalConfig(cwd);
  if (existingConfig) {
    console.error('[X] Local configuration already exists at:', path.dirname(existingConfig));
    console.error('    Use existing config or remove it before creating a new one');
    return false;
  }

  // Determine where to create the config
  let projectRoot;
  if (options.here) {
    // User explicitly wants to create here
    projectRoot = cwd;
    console.log('[>] Creating config in current directory (--here flag)');
  } else {
    // Try to detect project root
    const detectedRoot = findProjectRoot(cwd);
    if (detectedRoot && detectedRoot !== cwd) {
      projectRoot = detectedRoot;
      const relativePath = path.relative(cwd, detectedRoot);
      console.log(`[>] Detected project root at: ${detectedRoot}`);
      console.log(`    (${relativePath || 'current directory'})`);
    } else {
      projectRoot = cwd;
      if (!detectedRoot) {
        console.log('[!] No project markers found (.git, package.json, etc.)');
        console.log('    Creating config in current directory');
      }
    }
  }

  const configDir = path.join(projectRoot, '.local-work');
  const configPath = path.join(configDir, 'config.json');

  // Double-check if config exists at target location
  if (fs.existsSync(configPath)) {
    console.error('[X] Configuration already exists at:', configPath);
    return false;
  }

  const tasksDir = options.tasksDir || '.local-work/tasks';
  const notesDir = options.notesDir || '.local-work/notes';

  const localConfig = {
    version: '2.0.0',
    projectRoot: projectRoot,
    tasksDir: tasksDir,
    notesDir: notesDir,
    createdAt: new Date().toISOString(),
  };

  try {
    // Create .local-work directory
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2), 'utf8');

    // Create directories if they don't exist
    const absoluteTasksDir = path.resolve(projectRoot, tasksDir);
    const absoluteNotesDir = path.resolve(projectRoot, notesDir);

    ['backlog', 'active', 'completed', 'archived'].forEach((status) => {
      const dir = path.join(absoluteTasksDir, status);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    ['daily', 'meetings', 'technical', 'learning'].forEach((type) => {
      const dir = path.join(absoluteNotesDir, type);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    console.log('[+] Local configuration created: .local-work/config.json');
    console.log(`    Project root: ${projectRoot}`);
    console.log(`    Tasks: ${tasksDir}`);
    console.log(`    Notes: ${notesDir}`);
    console.log('');
    console.log('[>] Tip: Add .local-work/ to version control to share config with team');
    console.log('[>] Tip: Add tasks/ and notes/ to .gitignore if you want to keep them private');
    console.log('[>] Tip: Commands work from any subdirectory within the project');

    return true;
  } catch (/** @type {any} */ error) {
    console.error('[X] Error creating local configuration:', error.message);
    return false;
  }
}

// ============================================================================
// Workspace Resolution (v3.0.0 - Git-like model)
// ============================================================================

/**
 * @typedef {Object} WorkspaceResolution
 * @property {string} tasksDir - Absolute path to tasks directory
 * @property {string} notesDir - Absolute path to notes directory
 * @property {'local'|'global'} mode - Workspace mode
 */

/**
 * Resolve workspace directories based on mode (Git-like behavior)
 * @param {boolean} [useGlobal=false] - Force global workspace (via -g flag)
 * @returns {WorkspaceResolution} Resolved workspace paths and mode
 * @throws {Error} If local workspace not found and not using global
 */
function resolveWorkspace(useGlobal = false) {
  // Force global mode (-g flag)
  if (useGlobal) {
    const dataDir = getDataDir();
    return {
      tasksDir: path.join(dataDir, 'tasks'),
      notesDir: path.join(dataDir, 'notes'),
      mode: 'global',
    };
  }

  // Try local workspace first
  const localConfigPath = findLocalConfig();
  if (localConfigPath) {
    const localConfig = loadLocalConfig(localConfigPath);
    if (localConfig) {
      // @ts-ignore - Dynamic config from JSON
      const projectRoot = localConfig.projectRoot || path.dirname(path.dirname(localConfigPath));
      return {
        // @ts-ignore - Dynamic config from JSON
        tasksDir: path.resolve(projectRoot, localConfig.tasksDir),
        // @ts-ignore - Dynamic config from JSON
        notesDir: path.resolve(projectRoot, localConfig.notesDir),
        mode: 'local',
      };
    }
  }

  // No local workspace found - throw error
  throw new Error(
    `Not in a local-work directory.

Initialize local workspace:  task init
Use global workspace:        task -g <command>

Example:
  cd ~/my-project
  task init                  # Create .local-work/ here
  task new "My task"         # Works in this project

  task -g new "Personal"     # Uses global workspace`
  );
}

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
// Working Directories (v3.0.0 - Git-like workspace model)
// ============================================================================

/**
 * Get tasks directory (v3.0 simplified)
 * @param {boolean} [useGlobal=false] - Force global workspace
 * @returns {string} Tasks directory path
 * @throws {Error} If workspace cannot be resolved
 */
function getTasksDir(useGlobal = false) {
  const workspace = resolveWorkspace(useGlobal);
  return workspace.tasksDir;
}

/**
 * Get notes directory (v3.0 simplified)
 * @param {boolean} [useGlobal=false] - Force global workspace
 * @returns {string} Notes directory path
 * @throws {Error} If workspace cannot be resolved
 */
function getNotesDir(useGlobal = false) {
  const workspace = resolveWorkspace(useGlobal);
  return workspace.notesDir;
}

/**
 * Get workspace base directory (v3.0 - returns local or global)
 * @param {boolean} [useGlobal=false] - Force global workspace
 * @returns {string} Workspace directory path
 * @throws {Error} If workspace cannot be resolved
 */
function getWorkDir(useGlobal = false) {
  const workspace = resolveWorkspace(useGlobal);
  return workspace.mode === 'local' ? workspace.tasksDir : getDataDir();
}

// ============================================================================
// Directory Initialization
// ============================================================================

/**
 * Initialize workspace directory structure
 * @param {string} workspacePath - Path to workspace
 * @returns {boolean} Success status
 */
function initializeWorkspace(workspacePath) {
  try {
    const tasksDir = path.join(workspacePath, 'tasks');
    const notesDir = path.join(workspacePath, 'notes');

    // Create tasks subdirectories
    const taskDirs = ['active', 'backlog', 'completed', 'archived'];
    taskDirs.forEach((dir) => {
      const dirPath = path.join(tasksDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    // Create notes subdirectories
    const noteDirs = ['daily', 'meetings', 'technical', 'learning'];
    noteDirs.forEach((dir) => {
      const dirPath = path.join(notesDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    return true;
  } catch (error) {
    const err = /** @type {Error} */ (error);
    console.error('Error initializing workspace:', err.message);
    return false;
  }
}

/**
 * Ensure directory structure exists for current workspace
 * @returns {boolean} Success status
 */
function ensureDirectoryStructure() {
  const workDir = getWorkDir();
  return initializeWorkspace(workDir);
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
      console.log(`  ✓ Migrated ${taskFiles} task files`);
    }

    // Migrate notes
    const oldNotesPath = path.join(oldPath, 'notes');
    const newNotesPath = path.join(newPath, 'notes');

    if (fs.existsSync(oldNotesPath)) {
      console.log('Migrating notes...');
      copyDirectoryRecursive(oldNotesPath, newNotesPath);
      const noteFiles = countFilesRecursive(newNotesPath, '.md');
      migratedCount += noteFiles;
      console.log(`  ✓ Migrated ${noteFiles} note files`);
    }

    console.log(`\n✓ Migration complete! Migrated ${migratedCount} files\n`);
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

  console.log('\n🎉 Welcome to local-work CLI!\n');

  // Detect old location
  const oldLocation = detectOldLocation();

  if (oldLocation) {
    console.log(`📁 Found existing tasks/notes at: ${oldLocation}\n`);

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
    ensureDirectoryStructure();
  }

  // Mark first run as complete (v2 compatibility)
  // @ts-ignore - firstRun only exists in v2 configs
  config.firstRun = false;
  saveConfig(config);
}

// ============================================================================
// Exports
// ============================================================================

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
  initLocalConfig,
  findProjectRoot,

  // Configuration management
  getDefaultConfig,
  loadConfig,
  saveConfig,
  ensureConfigExists,
  updatePreference,
  getPreference,

  // Workspace resolution (v3.0.0 - Git-like model)
  resolveWorkspace,

  // Working directories
  getTasksDir,
  getNotesDir,
  getWorkDir,

  // Initialization
  initializeWorkspace,
  ensureDirectoryStructure,

  // Migration
  detectOldLocation,
  migrateFromOldLocation,
  promptMigration,
  handleFirstRun,
};
