/**
 * Workspace management utilities
 * @module config/workspace
 */

const path = require('path');
const fs = require('fs');
const { getDataDir, findLocalConfig, loadLocalConfig, findProjectRoot } = require('./paths');

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * @typedef {Object} WorkspaceResolution
 * @property {string} tasksDir - Absolute path to tasks directory
 * @property {string} notesDir - Absolute path to notes directory
 * @property {'local'|'global'} mode - Workspace mode
 */

// ============================================================================
// Workspace Resolution (v3.0.0 - Git-like model)
// ============================================================================

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

module.exports = {
  // Workspace resolution
  resolveWorkspace,
  getTasksDir,
  getNotesDir,
  getWorkDir,

  // Initialization
  initializeWorkspace,
  ensureDirectoryStructure,
  initLocalConfig,
};
