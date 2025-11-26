#!/usr/bin/env node

/**
 * Note CLI - Thin wrapper that delegates to modular components
 *
 * This file serves as the main entry point for the note CLI.
 * All business logic is implemented in ./note/ modules.
 * CLI handling is implemented in ./note/cli.js.
 *
 * @module cli/note
 */

// Re-export all note functions for backward compatibility
const note = require('./note/index');

module.exports = {
  // CRUD operations
  createDailyNote: note.createDailyNote,
  createMeetingNote: note.createMeetingNote,
  createTechnicalNote: note.createTechnicalNote,
  createLearningNote: note.createLearningNote,
  findNote: note.findNote,
  editNote: note.editNote,

  // List operations
  listNotes: note.listNotes,

  // Search operations
  searchNotes: note.searchNotes,
};

// Run CLI if called directly
if (require.main === module) {
  const { run } = require('./note/cli');
  run().catch((err) => {
    const { error, icons } = require('./utils');
    console.error(error(`\n${icons.error} ${err.message}\n`));
    process.exit(1);
  });
}
