#!/usr/bin/env node

/**
 * Task CLI command handling
 * @module cli/task/cli
 */

const path = require('path');
const { spawn } = require('child_process');
const { success, error, info, bold, icons, ensureDir, openInEditor } = require('../utils');
const config = require('../config');
const task = require('./index');

// ============================================================================
// Help Text
// ============================================================================

const HELP_TEXT = `
${bold('Task Management CLI (v3.0.0)')}

${info('Usage:')}
  task [-g] init [tasks-dir] [notes-dir]        Initialize local-work in current project
  task [-g] create <title>                      Create new task in backlog
  task [-g] start <id>                          Move task to active
  task [-g] complete <id>                       Mark task as completed
  task [-g] archive <id>                        Archive task
  task [-g] edit <id>                           Edit task in editor
  task [-g] update <id> <field> <value>         Update task field
  task [-g] list [dir]                          List tasks in directory
  task [-g] search <term>                       Search tasks by term
  task [-g] stats [dir]                         Show task statistics
  task [-g] standup [--weekly] [--format=FORMAT]  Generate standup report
  task [-g] config <command>                    Manage configuration
  task [-g] open                                Open tasks directory

${info('Workspace Model (Git-like):')}
  By default, task uses local workspace (.local-work/ in current project)
  Use -g or --global flag to work with global workspace instead

${info('Task Workflow:')}
  backlog → active → completed → archived

${info('Standup Report:')}
  task standup                                  # Daily standup report
  task standup --weekly                         # Weekly summary
  task standup --format=markdown                # Output as markdown
  task standup --format=json                    # Output as JSON

${info('Examples:')}
  task init                                     # Initialize local workspace
  task create "Implement user authentication"
  task start TASK-001
  task update TASK-001 priority high
  task complete TASK-001
  task list active
  task search "authentication"
  task stats
  task standup
  task -g create "Global task"                  # Use global workspace
  task config show

${info('Directories:')} backlog, active, completed, archived
`;

// ============================================================================
// CLI Helpers
// ============================================================================

/**
 * Show help and exit
 */
function showHelp() {
  console.log(HELP_TEXT);
  process.exit(0);
}

/**
 * Get tasks directory based on global flag
 * @param {boolean} useGlobal - Whether to use global workspace
 * @param {string} [cmd] - Current command (for init handling)
 * @returns {string} Tasks directory path
 */
function getTasksDirPath(useGlobal, cmd) {
  // For init command, return temporary path to avoid error during module load
  if (cmd === 'init' || cmd === undefined || cmd === 'help' || cmd === '--help') {
    return path.join(process.cwd(), '.local-work', 'tasks');
  }

  try {
    return config.getTasksDir(useGlobal);
  } catch (err) {
    const e = /** @type {Error} */ (err);
    console.log(error(`\n${icons.error} ${e.message}\n`));
    console.log('Run "task init" to initialize local workspace or use -g for global workspace\n');
    process.exit(1);
  }
}

/**
 * Open directory in file explorer
 * @param {string} dirPath - Directory to open
 */
function openDirectory(dirPath) {
  const platform = process.platform;
  let cmd;
  let cmdArgs;

  if (platform === 'darwin') {
    cmd = 'open';
    cmdArgs = [dirPath];
  } else if (platform === 'win32') {
    cmd = 'explorer';
    cmdArgs = [dirPath];
  } else {
    cmd = 'xdg-open';
    cmdArgs = [dirPath];
  }

  const child = spawn(cmd, cmdArgs, { detached: true, stdio: 'ignore' });
  child.unref();
}

// ============================================================================
// Command Handlers
// ============================================================================

/**
 * Handle 'new' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getTasksDir - Tasks directory factory
 */
async function handleNew(args, getTasksDir) {
  const noEdit = args.includes('--no-edit');

  // Extract priority and assignee values
  const priorityIndex = Math.max(args.indexOf('-p'), args.indexOf('--priority'));
  const assigneeIndex = Math.max(args.indexOf('-a'), args.indexOf('--assignee'));
  const priority = priorityIndex >= 0 ? args[priorityIndex + 1] || 'medium' : 'medium';
  const assignee = assigneeIndex >= 0 ? args[assigneeIndex + 1] || '' : '';

  // Build title by filtering out flags and their values
  const skipIndices = new Set();
  if (priorityIndex >= 0) {
    skipIndices.add(priorityIndex);
    skipIndices.add(priorityIndex + 1);
  }
  if (assigneeIndex >= 0) {
    skipIndices.add(assigneeIndex);
    skipIndices.add(assigneeIndex + 1);
  }

  const titleParts = args.slice(1).filter((arg, index) => {
    const actualIndex = index + 1;
    return arg !== '--no-edit' && !skipIndices.has(actualIndex);
  });

  const title = titleParts.join(' ') || '';

  if (!title) {
    console.log(error('\n Error: Task title is required\n'));
    console.log('Usage: task new <title> [-p priority] [-a assignee] [--no-edit]');
    process.exit(1);
  }

  // API: createTask(title, getTasksDir, priority, assignee)
  const result = task.createTask(title, getTasksDir, priority, assignee);

  if (!noEdit) {
    console.log(info(`${icons.edit} Opening task in editor...\n`));
    await openInEditor(result.filePath);
  }
}

/**
 * Handle 'start' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getTasksDir - Tasks directory factory
 */
function handleStart(args, getTasksDir) {
  const taskId = args[1];
  if (!taskId) {
    console.log(error('\n Error: Task ID is required\n'));
    console.log('Usage: task start TASK-XXX');
    process.exit(1);
  }
  // API: moveTask(taskId, targetStatus, getTasksDir)
  task.moveTask(taskId, 'active', getTasksDir);
}

/**
 * Handle 'done/complete' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getTasksDir - Tasks directory factory
 */
function handleComplete(args, getTasksDir) {
  const taskId = args[1];
  if (!taskId) {
    console.log(error('\n Error: Task ID is required\n'));
    console.log('Usage: task done TASK-XXX');
    process.exit(1);
  }
  // API: moveTask(taskId, targetStatus, getTasksDir)
  task.moveTask(taskId, 'completed', getTasksDir);
}

/**
 * Handle 'list' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getTasksDir - Tasks directory factory
 */
function handleList(args, getTasksDir) {
  const status = args[1] || null;
  // API: listTasks(getTasksDir, status)
  task.listTasks(getTasksDir, status);
}

/**
 * Handle 'view' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getTasksDir - Tasks directory factory
 */
function handleView(args, getTasksDir) {
  const taskId = args[1];
  if (!taskId) {
    console.log(error('\n Error: Task ID is required\n'));
    console.log('Usage: task view TASK-XXX');
    process.exit(1);
  }
  // API: viewTask(taskId, findTask, getTasksDir)
  task.viewTask(taskId, task.findTask, getTasksDir);
}

/**
 * Handle 'edit' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getTasksDir - Tasks directory factory
 */
async function handleEdit(args, getTasksDir) {
  const taskId = args[1];
  if (!taskId) {
    console.log(error('\n Error: Task ID is required\n'));
    console.log('Usage: task edit TASK-XXX');
    process.exit(1);
  }
  // API: editTask(taskId, findTask, getTasksDir)
  await task.editTask(taskId, task.findTask, getTasksDir);
}

/**
 * Handle 'search' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getTasksDir - Tasks directory factory
 */
function handleSearch(args, getTasksDir) {
  const term = args.slice(1).join(' ');
  if (!term) {
    console.log(error('\n Error: Search term is required\n'));
    console.log('Usage: task search <term>');
    process.exit(1);
  }
  // API: searchTasks(searchTerm, getTasksDir, includeArchived)
  task.searchTasks(term, getTasksDir, false);
}

/**
 * Handle 'update' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getTasksDir - Tasks directory factory
 */
function handleUpdate(args, getTasksDir) {
  const [, taskId, field, ...valueParts] = args;
  const value = valueParts.join(' ');

  if (!taskId || !field || !value) {
    console.log(error('\n Error: Task ID, field, and value are required\n'));
    console.log('Usage: task update TASK-XXX <field> <value>');
    console.log('Fields: priority, status, assignee, estimate, tags');
    process.exit(1);
  }
  // API: updateTask(taskId, field, value, getTasksDir)
  task.updateTask(taskId, field, value, getTasksDir);
}

/**
 * Handle 'archive' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getTasksDir - Tasks directory factory
 */
function handleArchive(args, getTasksDir) {
  const taskId = args[1];
  if (!taskId) {
    console.log(error('\n Error: Task ID is required\n'));
    console.log('Usage: task archive TASK-XXX');
    process.exit(1);
  }
  // API: moveTask(taskId, targetStatus, getTasksDir)
  task.moveTask(taskId, 'archived', getTasksDir);
}

/**
 * Handle 'stats' command
 * @param {() => string} getTasksDir - Tasks directory factory
 */
function handleStats(getTasksDir) {
  // API: getStats(getTasksDir)
  task.getStats(getTasksDir);
}

/**
 * Handle 'standup' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getTasksDir - Tasks directory factory
 */
function handleStandup(args, getTasksDir) {
  const isWeekly = args.includes('--weekly') || args.includes('-w');
  const formatArg = args.find((a) => a.startsWith('--format='));
  const format = formatArg ? formatArg.split('=')[1] : 'text';

  if (isWeekly) {
    // API: getWeeklySummary(getTasksDir) returns formatted string
    const summary = task.getWeeklySummary(getTasksDir);
    console.log(summary);
  } else {
    // API: generateStandup(getTasksDir, options) returns formatted string
    // API: printStandup(getTasksDir, options) prints directly
    const options = { format };
    task.printStandup(getTasksDir, options);
  }
}

/**
 * Handle 'config' command
 * @param {string[]} args - Command arguments
 */
function handleConfig(args) {
  const subCommand = args[1];

  switch (subCommand) {
    case 'show': {
      const cfg = config.loadConfig();
      console.log('\n' + bold('Current Configuration:') + '\n');
      console.log(JSON.stringify(cfg, null, 2));
      break;
    }

    case 'set': {
      const [, , key, ...valueParts] = args;
      const value = valueParts.join(' ');

      if (!key || !value) {
        console.log(error('\n Error: Key and value are required\n'));
        console.log('Usage: task config set <key> <value>');
        process.exit(1);
      }

      config.updatePreference(key, value);
      console.log(success(`\n${icons.check} Updated ${key} = ${value}\n`));
      break;
    }

    case 'get': {
      const key = args[2];
      if (!key) {
        console.log(error('\n Error: Key is required\n'));
        console.log('Usage: task config get <key>');
        process.exit(1);
      }

      const value = config.getPreference(key);
      console.log(`\n${key}: ${value}\n`);
      break;
    }

    case 'path': {
      console.log(`\nConfig file: ${config.getConfigPath()}\n`);
      break;
    }

    default:
      console.log(error('\n Error: Unknown config command\n'));
      console.log('Usage: task config <show|set|get|path>');
      process.exit(1);
  }
}

/**
 * Handle 'init' command
 * @param {string[]} args - Command arguments
 */
function handleInit(args) {
  const here = args.includes('--here');
  const tasksDir = args.find((a) => !a.startsWith('-') && a !== 'init');
  const tasksDirIndex = tasksDir ? args.indexOf(tasksDir) : -1;
  const notesDir = args.find(
    (a) => !a.startsWith('-') && a !== 'init' && args.indexOf(a) !== tasksDirIndex
  );

  const result = config.initLocalConfig({
    tasksDir,
    notesDir,
    here,
  });

  if (!result) {
    process.exit(1);
  }
}

/**
 * Handle 'open' command
 * @param {string} tasksDirPath - Tasks directory path
 */
function handleOpen(tasksDirPath) {
  console.log(info(`\n${icons.arrow} Opening tasks directory...\n`));
  openDirectory(tasksDirPath);
}

/**
 * Handle 'auto-archive' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getTasksDir - Tasks directory factory
 */
function handleAutoArchive(args, getTasksDir) {
  const daysArg = args.find((a) => a.startsWith('--days='));
  const days = daysArg ? parseInt(daysArg.split('=')[1], 10) : 30;
  // API: archiveOldTasks(getTasksDir, days)
  task.archiveOldTasks(getTasksDir, days);
}

// ============================================================================
// Main CLI Entry Point
// ============================================================================

/**
 * Run the CLI
 * @param {string[]} argv - Process arguments
 */
async function run(argv = process.argv) {
  // Check for help flags
  if (argv.includes('-h') || argv.includes('--help') || argv.includes('help')) {
    showHelp();
  }

  // Parse flags
  const useGlobal = argv.includes('-g') || argv.includes('--global');
  const cleanArgs = argv.filter((arg) => arg !== '-g' && arg !== '--global');
  const args = cleanArgs.slice(2);
  const command = args[0];

  // Get tasks directory as string
  const tasksDirPath = getTasksDirPath(useGlobal, command);

  // Create factory function for module API compatibility
  const getTasksDir = () => tasksDirPath;

  // Ensure directories exist (except for init)
  if (command !== 'init' && command !== undefined && command !== 'help' && command !== '--help') {
    ['active', 'backlog', 'completed', 'archived'].forEach((dir) => {
      ensureDir(path.join(tasksDirPath, dir));
    });
  }

  // Route commands
  switch (command) {
    case 'new':
    case 'create':
    case 'add':
      await handleNew(args, getTasksDir);
      break;

    case 'start':
      handleStart(args, getTasksDir);
      break;

    case 'done':
    case 'complete':
      handleComplete(args, getTasksDir);
      break;

    case 'list':
    case 'ls':
      handleList(args, getTasksDir);
      break;

    case 'view':
    case 'show':
      handleView(args, getTasksDir);
      break;

    case 'edit':
      await handleEdit(args, getTasksDir);
      break;

    case 'search':
      handleSearch(args, getTasksDir);
      break;

    case 'update':
    case 'set':
      handleUpdate(args, getTasksDir);
      break;

    case 'archive':
      handleArchive(args, getTasksDir);
      break;

    case 'stats':
      handleStats(getTasksDir);
      break;

    case 'standup':
      handleStandup(args, getTasksDir);
      break;

    case 'config':
      handleConfig(args);
      break;

    case 'init':
      handleInit(args);
      break;

    case 'open':
      handleOpen(tasksDirPath);
      break;

    case 'auto-archive':
      handleAutoArchive(args, getTasksDir);
      break;

    case undefined:
      // No command - show stats
      task.getStats(getTasksDir);
      break;

    default:
      console.log(error(`\n${icons.error} Unknown command: ${command}\n`));
      console.log('Run "task --help" for usage information\n');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  run().catch((err) => {
    console.error(error(`\n${icons.error} ${err.message}\n`));
    process.exit(1);
  });
}

module.exports = { run, showHelp };
