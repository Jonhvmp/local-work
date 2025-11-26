/**
 * @fileoverview Note CRUD operations
 * @description Create, find, and edit notes of various types
 */

const fs = require('fs');
const path = require('path');
const { success, error, warning, info, dim, icons } = require('../utils/colors');
const { getCurrentDate, getCurrentTime } = require('../utils/date');
const { openInEditor } = require('../utils/editor');

/**
 * Create a daily note for today
 * Creates a new daily note with standard template or opens existing one
 * @param {() => string} getNotesDir - Function to get notes directory
 * @param {boolean} [autoEdit=true] - Whether to auto-open in editor
 * @returns {void}
 */
function createDailyNote(getNotesDir, autoEdit = true) {
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
 * @param {() => string} getNotesDir - Function to get notes directory
 * @param {string} title - Meeting title
 * @param {boolean} [autoEdit=true] - Whether to auto-open in editor
 * @returns {void}
 */
function createMeetingNote(getNotesDir, title, autoEdit = true) {
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
 * @param {() => string} getNotesDir - Function to get notes directory
 * @param {string} title - Decision title
 * @param {boolean} [autoEdit=true] - Whether to auto-open in editor
 * @returns {void}
 */
function createTechnicalNote(getNotesDir, title, autoEdit = true) {
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
 * @param {() => string} getNotesDir - Function to get notes directory
 * @param {string} title - Learning topic title
 * @param {boolean} [autoEdit=true] - Whether to auto-open in editor
 * @returns {void}
 */
function createLearningNote(getNotesDir, title, autoEdit = true) {
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
 * @param {() => string} getNotesDir - Function to get notes directory
 * @param {string} pattern - Filename pattern to search for
 * @returns {string|null} Full path to the note or null if not found
 */
function findNote(getNotesDir, pattern) {
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
 * @param {() => string} getNotesDir - Function to get notes directory
 * @param {string} notePattern - Note filename or pattern to edit
 */
async function editNote(getNotesDir, notePattern) {
  const notePath = findNote(getNotesDir, notePattern);

  if (!notePath) {
    console.log(error(`\n${icons.cross} Note not found: ${notePattern}\n`));
    console.log(info('Try: note list [type] to see available notes\n'));
    process.exit(1);
  }

  console.log(info(`\n${icons.edit} Opening note in editor...\n`));
  await openInEditor(notePath);
  console.log(success(`${icons.check} Done!\n`));
}

module.exports = {
  createDailyNote,
  createMeetingNote,
  createTechnicalNote,
  createLearningNote,
  findNote,
  editNote,
};
