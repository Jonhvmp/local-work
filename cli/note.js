#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  success,
  error,
  warning,
  info,
  dim,
  bold,
  icons,
  formatDate,
  ensureDir,
  getCurrentDate,
  getCurrentTime,
  openInEditor,
  parseFrontmatter,
  colorize,
} = require('./utils');

// Import configuration system
const config = require('./config');

// ============================================================================
// Early help flag handling (must be before workspace initialization)
// ============================================================================

// Check for help flags before any workspace operations
if (
  process.argv.includes('-h') ||
  process.argv.includes('--help') ||
  process.argv.includes('help')
) {
  console.log(`
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
  `);
  process.exit(0);
}

// ============================================================================
// Parse CLI flags (v3.0.0 - Git-like model)
// ============================================================================

// Check for -g/--global flag to force global workspace
const useGlobalFlag = process.argv.includes('-g') || process.argv.includes('--global');

// Remove flags from args to avoid interfering with command parsing
const cleanArgs = process.argv.filter((arg) => arg !== '-g' && arg !== '--global');

// Helper function to get notes directory dynamically based on flag
// This is a function (not a constant) so it respects the useGlobalFlag
const getNotesDir = () => {
  try {
    return config.getNotesDir(useGlobalFlag);
  } catch (err) {
    const e = /** @type {Error} */ (err);
    error(`\n${icons.error} ${e.message}\n`);
    console.log('Run "note init" to initialize local workspace or use -g for global workspace\n');
    process.exit(1);
  }
};

// Ensure all directories exist
['daily', 'meetings', 'technical', 'learning'].forEach((dir) => {
  ensureDir(path.join(getNotesDir(), dir));
});

/**
 * Create a daily note for today
 * Creates a new daily note with standard template or opens existing one
 * @param {boolean} [autoEdit=true] - Whether to auto-open in editor
 * @returns {void}
 */
function createDailyNote(autoEdit = true) {
  const date = getCurrentDate();
  const fileName = `${date}.md`;
  const filePath = path.join(getNotesDir(), 'daily', fileName);

  if (fs.existsSync(filePath)) {
    console.log(warning(`\n${icons.warning} Daily note already exists for today`));
    console.log(info(`${icons.info} Opening existing note...\n`));

    if (autoEdit) {
      openInEditor(filePath)
        .then(() => console.log(success(`\n${icons.check} Note saved\n`)))
        .catch((err) => console.log(error(`\n${icons.cross} Error: ${err.message}\n`)));
    }
    return;
  }

  const template = `---
date: ${date}
type: daily
title: "Daily Notes"
tags: []
related_tasks: []
---

# ${date} - Daily Notes

## What I worked on today

-

## Blockers / Issues

-

## Tomorrow's plan

-

## Notes

-
`;

  fs.writeFileSync(filePath, template);
  console.log(success(`\n${icons.check} Daily note created successfully!`));
  console.log(dim(`   Location: ${filePath}\n`));

  // Auto-open in editor if requested
  if (autoEdit) {
    openInEditor(filePath)
      .then(() => console.log(success(`\n${icons.check} Note saved\n`)))
      .catch((err) => console.log(error(`\n${icons.cross} Error: ${err.message}\n`)));
  }
}

/**
 * Create a meeting note
 * @param {string} title - Meeting title
 * @param {boolean} [autoEdit=true] - Whether to auto-open in editor
 * @returns {void}
 */
function createMeetingNote(title, autoEdit = true) {
  const date = getCurrentDate();
  const time = getCurrentTime();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fileName = `${date}-${slug}.md`;
  const filePath = path.join(getNotesDir(), 'meetings', fileName);

  // Check if file already exists to prevent accidental overwrite
  if (fs.existsSync(filePath)) {
    console.log(warning(`\n${icons.warning} Meeting note already exists!`));
    console.log(info(`${icons.note} ${title}`));
    console.log(dim(`   Location: ${filePath}`));
    console.log(info(`\nUse 'note edit ${fileName}' to edit the existing note\n`));
    if (autoEdit) {
      openInEditor(filePath);
    }
    return;
  }

  const template = `---
date: ${date}
type: meeting
title: "${title}"
participants: []
tags: []
related_tasks: []
---

# Meeting: ${title}

**Date:** ${date}
**Time:** ${time}
**Participants:**
**Duration:**

## Agenda

1.
2.

## Discussion

### Topic 1

-

### Topic 2

-

## Decisions Made

-

## Action Items

- [ ] Action 1 - @assignee
- [ ] Action 2 - @assignee

## Next Meeting

**Date:**
**Topics:**
`;

  fs.writeFileSync(filePath, template);
  console.log(success(`\n${icons.check} Meeting note created successfully!`));
  console.log(info(`${icons.note} ${title}`));
  console.log(dim(`   Location: ${filePath}\n`));

  if (autoEdit) {
    openInEditor(filePath)
      .then(() => console.log(success(`\n${icons.check} Note saved\n`)))
      .catch((err) => console.log(error(`\n${icons.cross} Error: ${err.message}\n`)));
  }
}

/**
 * Create a technical decision record (ADR)
 * @param {string} title - Decision title
 * @param {boolean} [autoEdit=true] - Whether to auto-open in editor
 * @returns {void}
 */
function createTechnicalNote(title, autoEdit = true) {
  const date = getCurrentDate();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Get next ADR number
  const technicalDir = path.join(getNotesDir(), 'technical');
  const files = fs.readdirSync(technicalDir);
  const adrNumbers = files
    .filter((f) => f.startsWith('ADR-'))
    .map((f) => {
      const match = f.match(/^ADR-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

  const nextNum = adrNumbers.length > 0 ? Math.max(...adrNumbers) + 1 : 1;
  const adrId = String(nextNum).padStart(3, '0');

  const fileName = `ADR-${adrId}-${slug}.md`;
  const filePath = path.join(technicalDir, fileName);

  const template = `---
date: ${date}
type: technical
title: "${title}"
tags: []
related_tasks: []
status: proposed
---

# ADR-${adrId}: ${title}

## Context

[What is the issue we're seeing that is motivating this decision or change?]

## Decision

[What is the change we're proposing and/or doing?]

## Consequences

### Positive

-

### Negative

-

### Neutral

-

## Alternatives Considered

### Alternative 1

- Pros:
- Cons:

### Alternative 2

- Pros:
- Cons:

## Implementation Notes

[How will this be implemented?]

## References

-
`;

  fs.writeFileSync(filePath, template);
  console.log(success(`\n${icons.check} Technical decision (ADR) created successfully!`));
  console.log(info(`${icons.note} ADR-${adrId}: ${title}`));
  console.log(dim(`   Location: ${filePath}\n`));

  if (autoEdit) {
    openInEditor(filePath)
      .then(() => console.log(success(`\n${icons.check} Note saved\n`)))
      .catch((err) => console.log(error(`\n${icons.cross} Error: ${err.message}\n`)));
  }
}

/**
 * Create a learning note (TIL - Today I Learned)
 * @param {string} title - Learning topic title
 * @param {boolean} [autoEdit=true] - Whether to auto-open in editor
 * @returns {void}
 */
function createLearningNote(title, autoEdit = true) {
  const date = getCurrentDate();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fileName = `${date}-${slug}.md`;
  const filePath = path.join(getNotesDir(), 'learning', fileName);

  const template = `---
date: ${date}
type: learning
title: "${title}"
tags: []
source: ""
---

# TIL: ${title}

## What I learned

[Brief description of what you learned]

## Context

[Why is this important? When did you learn this?]

## Details

[Technical details, code snippets, examples]

\`\`\`language
// code example
\`\`\`

## Resources

- [Link to documentation]
- [Link to article]

## Related Topics

-

## Future Application

[How might you use this in the future?]
`;

  fs.writeFileSync(filePath, template);
  console.log(success(`\n${icons.check} Learning note (TIL) created successfully!`));
  console.log(info(`${icons.note} ${title}`));
  console.log(dim(`   Location: ${filePath}\n`));

  if (autoEdit) {
    openInEditor(filePath)
      .then(() => console.log(success(`\n${icons.check} Note saved\n`)))
      .catch((err) => console.log(error(`\n${icons.cross} Error: ${err.message}\n`)));
  }
}

/**
 * Find a note by filename or pattern
 * @param {string} pattern - Filename pattern to search for
 * @returns {string|null} Full path to the note or null if not found
 */
function findNote(pattern) {
  const types = ['daily', 'meetings', 'technical', 'learning'];

  for (const type of types) {
    const dirPath = path.join(getNotesDir(), type);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);

      // Try exact match first
      let file = files.find((f) => f === pattern || f === `${pattern}.md`);

      // Try case-insensitive match
      if (!file) {
        file = files.find(
          (f) =>
            f.toLowerCase() === pattern.toLowerCase() ||
            f.toLowerCase() === `${pattern.toLowerCase()}.md`
        );
      }

      // Try partial match
      if (!file) {
        file = files.find((f) => f.toLowerCase().includes(pattern.toLowerCase()));
      }

      if (file) {
        return path.join(dirPath, file);
      }
    }
  }

  return null;
}

/**
 * Edit an existing note in the configured editor
 * @param {string} notePattern - Note filename or pattern to edit
 */
async function editNote(notePattern) {
  const notePath = findNote(notePattern);

  if (!notePath) {
    console.log(error(`\n${icons.cross} Note not found: ${notePattern}\n`));
    console.log(info('Try: note list [type] to see available notes\n'));
    process.exit(1);
  }

  console.log(info(`\n${icons.edit} Opening note in editor...\n`));
  await openInEditor(notePath);
  console.log(success(`${icons.check} Done!\n`));
}

/**
 * List notes by type or all types
 * @param {string|null} type - Note type to filter (daily, meetings, technical, learning) or null for all
 * @returns {void}
 */
function listNotes(type = null) {
  const types = type ? [type] : ['daily', 'meetings', 'technical', 'learning'];

  console.log(bold(`\n${icons.note} Notes Overview\n`));

  types.forEach((noteType) => {
    const dirPath = path.join(getNotesDir(), noteType);
    if (fs.existsSync(dirPath)) {
      const files = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith('.md') && !f.includes('template'))
        .sort()
        .reverse()
        .slice(0, 10); // Show last 10

      if (files.length > 0) {
        /** @type {Record<string, string>} */
        const typeColors = {
          daily: 'blue',
          meetings: 'yellow',
          technical: 'magenta',
          learning: 'green',
        };

        console.log(
          colorize(
            `\n▸ ${noteType.toUpperCase()} (${files.length} recent)`,
            /** @type {keyof typeof import('./utils').colors} */ (typeColors[noteType] || 'white')
          )
        );

        files.forEach((file) => {
          const filePath = path.join(dirPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const meta = parseFrontmatter(content);
          const title = meta.title || file;
          const date = meta.date || '';

          console.log(`  ${icons.bullet} ${file.replace('.md', '')}`);
          console.log(dim(`    ${title} ${date ? '(' + formatDate(String(date)) + ')' : ''}`));
        });
      }
    }
  });

  console.log('');
}

/**
 * Search notes by term across all types
 * @param {string} searchTerm - Search term to find in note titles and content
 * @returns {void}
 */
function searchNotes(searchTerm) {
  const types = ['daily', 'meetings', 'technical', 'learning'];
  /** @type {Array<{file: string, type: string, title: string|string[], date: string|string[], path: string}>} */
  const results = [];

  types.forEach((noteType) => {
    const dirPath = path.join(getNotesDir(), noteType);
    if (fs.existsSync(dirPath)) {
      const files = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith('.md') && !f.includes('template'));

      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const meta = parseFrontmatter(content);

        const searchContent = `${meta.title} ${content}`.toLowerCase();
        if (searchContent.includes(searchTerm.toLowerCase())) {
          results.push({
            file,
            type: noteType,
            title: meta.title || file,
            date: meta.date,
            path: filePath,
          });
        }
      });
    }
  });

  if (results.length === 0) {
    console.log(dim(`\n${icons.info} No notes found matching "${searchTerm}"\n`));
    return;
  }

  console.log(bold(`\n${icons.note} Search Results (${results.length})\n`));
  console.log(dim(`Searching for: "${searchTerm}"\n`));

  results.forEach((note) => {
    /** @type {Record<string, string>} */
    const typeColors = {
      daily: 'blue',
      meetings: 'yellow',
      technical: 'magenta',
      learning: 'green',
    };

    console.log(`${icons.bullet} ${bold(String(note.title))}`);
    console.log(
      dim(
        `  Type: ${colorize(note.type, /** @type {keyof typeof import('./utils').colors} */ (typeColors[note.type]))} | Date: ${formatDate(String(note.date))} | ${note.file}`
      )
    );
  });

  console.log('');
}

// CLI interface (v3.0.0 - uses cleaned args without -g flag)
const args = cleanArgs.slice(2);
const command = args[0];
const noEdit = args.includes('--no-edit');

switch (command) {
  case 'daily': {
    createDailyNote(!noEdit);
    break;
  }

  case 'meeting': {
    const meetingTitle =
      args
        .slice(1)
        .filter((arg) => arg !== '--no-edit')
        .join(' ') || 'Team Meeting';
    createMeetingNote(meetingTitle, !noEdit);
    break;
  }

  case 'tech':
  case 'technical': {
    const techTitle =
      args
        .slice(1)
        .filter((arg) => arg !== '--no-edit')
        .join(' ') || 'Technical Decision';
    createTechnicalNote(techTitle, !noEdit);
    break;
  }

  case 'til':
  case 'learning': {
    const tilTitle =
      args
        .slice(1)
        .filter((arg) => arg !== '--no-edit')
        .join(' ') || 'Today I Learned';
    createLearningNote(tilTitle, !noEdit);
    break;
  }

  case 'edit': {
    const notePattern = args.slice(1).join(' ');
    if (!notePattern) {
      console.log(error('\n Error: Note filename or pattern is required\n'));
      console.log('Usage: note edit <filename|pattern>');
      console.log('Example: note edit 2025-11-07');
      console.log('         note edit ADR-001');
      process.exit(1);
    }
    (async () => {
      await editNote(notePattern);
    })();
    break;
  }

  case 'list':
  case 'ls': {
    const noteType = args[1];
    listNotes(noteType);
    break;
  }

  case 'search':
  case 'find': {
    const searchTerm = args.slice(1).join(' ');
    if (!searchTerm) {
      console.log(error('\n Error: Search term is required\n'));
      console.log('Usage: note search <term>');
      process.exit(1);
    }
    searchNotes(searchTerm);
    break;
  }

  case 'config': {
    const subCommand = args[1];

    switch (subCommand) {
      case 'show': {
        const currentConfig = config.loadConfig();

        try {
          const workspace = config.resolveWorkspace(useGlobalFlag);

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
          error(`Cannot resolve workspace: ${e.message}`);
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
    break;
  }

  case 'open': {
    const openPath = config.getNotesDir();
    console.log(`\n${info('Opening notes directory:')}`);
    console.log(`  ${openPath}\n`);

    // Try to open in file manager
    const { exec } = require('child_process');
    const platform = config.getPlatform();

    let openCommand;
    if (platform === 'darwin') {
      openCommand = `open "${openPath}"`;
    } else if (platform === 'win32') {
      openCommand = `explorer "${openPath}"`;
    } else {
      openCommand = `xdg-open "${openPath}"`;
    }

    exec(openCommand, (err) => {
      if (err) {
        warning('Could not open file manager automatically');
        info('Please open the path manually');
      }
    });
    break;
  }

  case 'init': {
    const tasksDir = args[1] || './tasks';
    const notesDir = args[2] || './notes';

    console.log(`${info('Initializing local-work in current project...')}\n`);

    const success = config.initLocalConfig({
      tasksDir,
      notesDir,
    });

    if (success) {
      console.log(`\n${bold('✓ Project initialized!')}`);
      console.log(
        `\nYou can now use ${bold('task')} and ${bold('note')} commands in this directory.`
      );
      console.log(`Tasks and notes will be stored in this project.\n`);
    }
    break;
  }

  default:
    console.log(`
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
    `);
}

// Export functions for testing
module.exports = {
  createDailyNote,
  createMeetingNote,
  createTechnicalNote,
  createLearningNote,
  listNotes,
  searchNotes,
};
