/**
 * Note module - all note-related functionality
 * @module cli/note
 */

const {
  createDailyNote,
  createMeetingNote,
  createTechnicalNote,
  createLearningNote,
  findNote,
  editNote,
} = require('./crud');
const { listNotes } = require('./list');
const { searchNotes } = require('./search');

module.exports = {
  // CRUD operations
  createDailyNote,
  createMeetingNote,
  createTechnicalNote,
  createLearningNote,
  findNote,
  editNote,

  // List operations
  listNotes,

  // Search operations
  searchNotes,
};
