#!/usr/bin/env node

/**
 * Note CLI command handling
 * @module cli/note/cli
 */

const path = require('path');
const { exec } = require('child_process');
const { error, warning, info, dim, bold, icons, ensureDir } = require('../utils');
const config = require('../config');
const note = require('./index');

// ============================================================================
// Help Text
// ============================================================================

const HELP_TEXT = `
${bold('Note Management CLI (v3.0.0)')}

${info('Usage:')}
  note [-g] init [tasks-dir] [notes-dir]        Initialize local-work in current project
  note [-g] daily [--no-edit]                   Create daily note for today
  note [-g] meeting <title> [--no-edit]         Create meeting note
  note [-g] tech <title> [--no-edit]            Create technical decision (ADR)
  note [-g] til <title> [--no-edit]             Create learning note (TIL)
  note [-g] edit <filename|pattern>             Edit existing note
  note [-g] list [type]                         List notes (all or by type)
  note [-g] search <term>                       Search notes by term
  note [-g] config <command>                    Manage configuration
  note [-g] open                                Open notes directory

${info('Workspace Model (Git-like):')}
  By default, note uses local workspace (.local-work/ in current project)
  Use -g or --global flag to work with global workspace instead

${info('Examples:')}
  note init                                     # Initialize local workspace
  note -g daily                                 # Create daily note in global (opens in editor)
  note daily --no-edit                          # Create without opening editor
  note meeting "Sprint Planning"
  note tech "Migration to Next.js 15"
  note til "React Server Components"
  note edit 2025-11-07                          # Edit daily note by date
  note edit ADR-001                             # Edit technical decision
  note list technical
  note search "authentication"
  note config show
  note -g open                                  # Open global notes directory
  note open                                     # Open local notes directory

${info('Note Types:')} daily, meetings, technical, learning
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
 * Get notes directory path based on global flag
 * @param {boolean} useGlobal - Whether to use global workspace
 * @param {string} [cmd] - Current command (for init handling)
 * @returns {string} Notes directory path
 */
function getNotesDirPath(useGlobal, cmd) {
  // For init command, return temporary path to avoid error during module load
  if (cmd === 'init' || cmd === undefined || cmd === 'help' || cmd === '--help') {
    return path.join(process.cwd(), '.local-work', 'notes');
  }

  try {
    return config.getNotesDir(useGlobal);
  } catch (err) {
    const e = /** @type {Error} */ (err);
    console.log(error(`\n${icons.error} ${e.message}\n`));
    console.log('Run "note init" to initialize local workspace or use -g for global workspace\n');
    process.exit(1);
  }
}

// ============================================================================
// Command Handlers
// ============================================================================

/**
 * Handle 'daily' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getNotesDirFn - Function to get notes directory
 */
function handleDaily(args, getNotesDirFn) {
  const noEdit = args.includes('--no-edit');
  note.createDailyNote(getNotesDirFn, !noEdit);
}

/**
 * Handle 'meeting' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getNotesDirFn - Function to get notes directory
 */
function handleMeeting(args, getNotesDirFn) {
  const noEdit = args.includes('--no-edit');
  const title =
    args
      .slice(1)
      .filter((arg) => arg !== '--no-edit')
      .join(' ') || 'Team Meeting';
  note.createMeetingNote(getNotesDirFn, title, !noEdit);
}

/**
 * Handle 'tech/technical' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getNotesDirFn - Function to get notes directory
 */
function handleTechnical(args, getNotesDirFn) {
  const noEdit = args.includes('--no-edit');
  const title =
    args
      .slice(1)
      .filter((arg) => arg !== '--no-edit')
      .join(' ') || 'Technical Decision';
  note.createTechnicalNote(getNotesDirFn, title, !noEdit);
}

/**
 * Handle 'til/learning' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getNotesDirFn - Function to get notes directory
 */
function handleLearning(args, getNotesDirFn) {
  const noEdit = args.includes('--no-edit');
  const title =
    args
      .slice(1)
      .filter((arg) => arg !== '--no-edit')
      .join(' ') || 'Today I Learned';
  note.createLearningNote(getNotesDirFn, title, !noEdit);
}

/**
 * Handle 'edit' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getNotesDirFn - Function to get notes directory
 */
async function handleEdit(args, getNotesDirFn) {
  const notePattern = args.slice(1).join(' ');
  if (!notePattern) {
    console.log(error('\n Error: Note filename or pattern is required\n'));
    console.log('Usage: note edit <filename|pattern>');
    console.log('Example: note edit 2025-11-07');
    console.log('         note edit ADR-001');
    process.exit(1);
  }
  await note.editNote(getNotesDirFn, notePattern);
}

/**
 * Handle 'list' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getNotesDirFn - Function to get notes directory
 */
function handleList(args, getNotesDirFn) {
  const noteType = args[1] || null;
  note.listNotes(getNotesDirFn, noteType);
}

/**
 * Handle 'search' command
 * @param {string[]} args - Command arguments
 * @param {() => string} getNotesDirFn - Function to get notes directory
 */
function handleSearch(args, getNotesDirFn) {
  const searchTerm = args.slice(1).join(' ');
  if (!searchTerm) {
    console.log(error('\n Error: Search term is required\n'));
    console.log('Usage: note search <term>');
    process.exit(1);
  }
  note.searchNotes(getNotesDirFn, searchTerm);
}

/**
 * Handle 'config' command
 * @param {string[]} args - Command arguments
 * @param {boolean} useGlobal - Whether to use global workspace
 */
function handleConfig(args, useGlobal) {
  const subCommand = args[1];

  switch (subCommand) {
    case 'show': {
      const currentConfig = config.loadConfig();

      try {
        const workspace = config.resolveWorkspace(useGlobal);

        console.log(`\n${bold('Configuration (v3.0.0):')}\n`);
        console.log(`${info('Platform:')} ${config.getPlatform()}`);
        console.log(`${info('Config Dir:')} ${config.getConfigDir()}`);
        console.log(`${info('Data Dir:')} ${config.getDataDir()}\n`);

        console.log(`${bold('Workspace:')} ${workspace.mode}`);
        console.log(`${info('Notes Dir:')} ${workspace.notesDir}\n`);

        console.log(`${bold('Preferences:')}`);
        /** @type {any} */ const cfg = currentConfig;
        Object.entries(cfg.preferences || {}).forEach(([key, value]) => {
          console.log(`  ${dim(key)}: ${value}`);
        });
      } catch (err) {
        const e = /** @type {Error} */ (err);
        console.log(error(`Cannot resolve workspace: ${e.message}`));
        process.exit(1);
      }
      console.log();
      break;
    }

    default:
      console.log(`
${bold('Configuration Management')}

${info('Usage:')}
  note config show              Show current configuration

${info('Examples:')}
  note config show
      `);
  }
}

/**
 * Handle 'init' command
 * @param {string[]} args - Command arguments
 */
function handleInit(args) {
  const tasksDir = args[1] || './tasks';
  const notesDir = args[2] || './notes';

  console.log(`${info('Initializing local-work in current project...')}\n`);

  const result = config.initLocalConfig({
    tasksDir,
    notesDir,
  });

  if (result) {
    console.log(`\n${bold('✓ Project initialized!')}`);
    console.log(
      `\nYou can now use ${bold('task')} and ${bold('note')} commands in this directory.`
    );
    console.log(`Tasks and notes will be stored in this project.\n`);
  }
}

/**
 * Handle 'open' command
 * @param {string} notesDirPath - Notes directory path
 */
function handleOpen(notesDirPath) {
  console.log(`\n${info('Opening notes directory:')}`);
  console.log(`  ${notesDirPath}\n`);

  const platform = config.getPlatform();

  let openCommand;
  if (platform === 'darwin') {
    openCommand = `open "${notesDirPath}"`;
  } else if (platform === 'win32') {
    openCommand = `explorer "${notesDirPath}"`;
  } else {
    openCommand = `xdg-open "${notesDirPath}"`;
  }

  exec(openCommand, (err) => {
    if (err) {
      console.log(warning('Could not open file manager automatically'));
      console.log(info('Please open the path manually'));
    }
  });
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

  // Get notes directory path
  const notesDirPath = getNotesDirPath(useGlobal, command);

  // Create function factory for module calls
  const getNotesDirFn = () => notesDirPath;

  // Ensure directories exist (except for init)
  if (command !== 'init' && command !== undefined && command !== 'help' && command !== '--help') {
    ['daily', 'meetings', 'technical', 'learning'].forEach((dir) => {
      ensureDir(path.join(notesDirPath, dir));
    });
  }

  // Route commands
  switch (command) {
    case 'daily':
      handleDaily(args, getNotesDirFn);
      break;

    case 'meeting':
      handleMeeting(args, getNotesDirFn);
      break;

    case 'tech':
    case 'technical':
      handleTechnical(args, getNotesDirFn);
      break;

    case 'til':
    case 'learning':
      handleLearning(args, getNotesDirFn);
      break;

    case 'edit':
      await handleEdit(args, getNotesDirFn);
      break;

    case 'list':
    case 'ls':
      handleList(args, getNotesDirFn);
      break;

    case 'search':
    case 'find':
      handleSearch(args, getNotesDirFn);
      break;

    case 'config':
      handleConfig(args, useGlobal);
      break;

    case 'init':
      handleInit(args);
      break;

    case 'open':
      handleOpen(notesDirPath);
      break;

    case undefined:
    default:
      showHelp();
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
