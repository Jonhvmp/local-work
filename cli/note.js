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

// Get notes directory from config (supports workspaces and ENV overrides)
const NOTES_DIR = config.getNotesDir();

// Ensure all directories exist
['daily', 'meetings', 'technical', 'learning'].forEach((dir) => {
  ensureDir(path.join(NOTES_DIR, dir));
});

/**
 * Create a daily note for today
 * Creates a new daily note with standard template or opens existing one
 * @returns {void}
 */
function createDailyNote() {
  const date = getCurrentDate();
  const fileName = `${date}.md`;
  const filePath = path.join(NOTES_DIR, 'daily', fileName);

  if (fs.existsSync(filePath)) {
    console.log(warning(`\n${icons.warning} Daily note already exists for today`));
    console.log(info(`${icons.info} Opening existing note...\n`));

    openInEditor(filePath)
      .then(() => console.log(success(`\n${icons.check} Note saved\n`)))
      .catch((err) => console.log(error(`\n${icons.cross} Error: ${err.message}\n`)));
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

  // Auto-open in editor
  openInEditor(filePath)
    .then(() => console.log(success(`\n${icons.check} Note saved\n`)))
    .catch((err) => console.log(error(`\n${icons.cross} Error: ${err.message}\n`)));
}

/**
 * Create a meeting note
 * @param {string} title - Meeting title
 * @returns {void}
 */
function createMeetingNote(title) {
  const date = getCurrentDate();
  const time = getCurrentTime();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fileName = `${date}-${slug}.md`;
  const filePath = path.join(NOTES_DIR, 'meetings', fileName);

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

  openInEditor(filePath)
    .then(() => console.log(success(`\n${icons.check} Note saved\n`)))
    .catch((err) => console.log(error(`\n${icons.cross} Error: ${err.message}\n`)));
}

/**
 * Create a technical note (ADR - Architecture Decision Record)
 * @param {string} title - Technical decision title
 * @returns {void}
 */
function createTechnicalNote(title) {
  const date = getCurrentDate();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Get next ADR number
  const technicalDir = path.join(NOTES_DIR, 'technical');
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

  openInEditor(filePath)
    .then(() => console.log(success(`\n${icons.check} Note saved\n`)))
    .catch((err) => console.log(error(`\n${icons.cross} Error: ${err.message}\n`)));
}

/**
 * Create a learning note (TIL - Today I Learned)
 * @param {string} title - Learning topic title
 * @returns {void}
 */
function createLearningNote(title) {
  const date = getCurrentDate();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fileName = `${date}-${slug}.md`;
  const filePath = path.join(NOTES_DIR, 'learning', fileName);

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

  openInEditor(filePath)
    .then(() => console.log(success(`\n${icons.check} Note saved\n`)))
    .catch((err) => console.log(error(`\n${icons.cross} Error: ${err.message}\n`)));
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
    const dirPath = path.join(NOTES_DIR, noteType);
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
    const dirPath = path.join(NOTES_DIR, noteType);
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

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'daily': {
    createDailyNote();
    break;
  }

  case 'meeting': {
    const meetingTitle = args.slice(1).join(' ') || 'Team Meeting';
    createMeetingNote(meetingTitle);
    break;
  }

  case 'tech':
  case 'technical': {
    const techTitle = args.slice(1).join(' ') || 'Technical Decision';
    createTechnicalNote(techTitle);
    break;
  }

  case 'til':
  case 'learning': {
    const tilTitle = args.slice(1).join(' ') || 'Today I Learned';
    createLearningNote(tilTitle);
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

  case 'workspace': {
    const subCommand = args[1];
    const workspaceName = args[2];

    switch (subCommand) {
      case 'list': {
        const workspaces = config.listWorkspaces();
        const activeWorkspace = config.getActiveWorkspace();

        console.log(`\n${bold('Workspaces:')}\n`);
        Object.values(workspaces).forEach((ws) => {
          /** @type {any} */ const workspace = ws;
          const active =
            workspace.name === activeWorkspace.name ? success('● active') : dim('○ inactive');
          console.log(`  ${active} ${bold(workspace.name)}`);
          console.log(`    ${dim(`Path: ${workspace.path}`)}`);
          if (workspace.description) {
            console.log(`    ${dim(`Description: ${workspace.description}`)}`);
          }
          console.log();
        });
        break;
      }

      case 'switch': {
        if (!workspaceName) {
          error('Usage: note workspace switch <name>');
          process.exit(1);
        }

        const workspace = config.switchWorkspace(workspaceName);
        if (workspace) {
          success(`✓ Switched to workspace '${workspaceName}'`);
          info(`  Notes: ${config.getNotesDir()}`);
        } else {
          error('Failed to switch workspace');
          process.exit(1);
        }
        break;
      }

      default:
        console.log(`
${bold('Workspace Management')}

${info('Usage:')}
  note workspace list           List all workspaces
  note workspace switch <name>  Switch to workspace

${info('Examples:')}
  note workspace list
  note workspace switch project-x
        `);
    }
    break;
  }

  case 'config': {
    const subCommand = args[1];

    switch (subCommand) {
      case 'show': {
        const currentConfig = config.loadConfig();
        const workspace = config.getActiveWorkspace();

        console.log(`\n${bold('Configuration:')}\n`);
        console.log(`${info('Platform:')} ${config.getPlatform()}`);
        console.log(`${info('Config Dir:')} ${config.getConfigDir()}`);
        console.log(`${info('Data Dir:')} ${config.getDataDir()}\n`);

        /** @type {any} */ const ws = workspace;
        console.log(`${bold('Active Workspace:')} ${ws.name}`);
        console.log(`${info('Notes Dir:')} ${config.getNotesDir()}\n`);

        console.log(`${bold('Preferences:')}`);
        /** @type {any} */ const cfg = currentConfig;
        Object.entries(cfg.preferences || {}).forEach(([key, value]) => {
          console.log(`  ${dim(key)}: ${value}`);
        });
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
    const tasksDir = args[0] || './tasks';
    const notesDir = args[1] || './notes';

    console.log(`${info('Initializing local-work in current project...')}\n`);

    const success = config.initLocalConfig({
      tasksDir,
      notesDir,
    });

    if (success) {
      console.log(`\n${bold('✓ Project initialized!')}`);
      console.log(`\nYou can now use ${bold('task')} and ${bold('note')} commands in this directory.`);
      console.log(`Tasks and notes will be stored in this project.\n`);
    }
    break;
  }

  default:
    console.log(`
${bold('Note Management CLI')}

${info('Usage:')}
  note init [tasks-dir] [notes-dir]             Initialize local-work in current project
  note daily                                    Create daily note for today
  note meeting <title>                          Create meeting note
  note tech <title>                             Create technical decision (ADR)
  note til <title>                              Create learning note (TIL)
  note list [type]                              List notes (all or by type)
  note search <term>                            Search notes by term
  note workspace <command>                      Manage workspaces
  note config <command>                         Manage configuration
  note open                                     Open notes directory

${info('Examples:')}
  note init                                     # Use default ./tasks and ./notes
  note init ./my-tasks ./my-notes               # Custom directories
  note daily
  note meeting "Sprint Planning"
  note tech "Migration to Next.js 15"
  note til "React Server Components"
  note list technical
  note search "authentication"
  note workspace list
  note config show
  note open

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
