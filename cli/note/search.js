/**
 * @fileoverview Note search operations
 * @description Search notes by term across all types
 */

const fs = require('fs');
const path = require('path');
const { bold, dim, colorize, icons } = require('../utils/colors');
const { formatDate } = require('../utils/date');
const { parseFrontmatter } = require('../utils/format');

/**
 * Search notes by term across all types
 * @param {() => string} getNotesDir - Function to get notes directory
 * @param {string} searchTerm - Search term to find in note titles and content
 * @returns {void}
 */
function searchNotes(getNotesDir, searchTerm) {
  const types = ['daily', 'meetings', 'technical', 'learning'];
  /** @type {Array<{file: string, type: string, title: string, date: string, path: string}>} */
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
        const { frontmatter } = parseFrontmatter(content);
        /** @type {any} */
        const meta = frontmatter;

        const searchContent = `${meta.title || ''} ${content}`.toLowerCase();
        if (searchContent.includes(searchTerm.toLowerCase())) {
          results.push({
            file,
            type: noteType,
            title: meta.title || file,
            date: meta.date || '',
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
        `  Type: ${colorize(note.type, /** @type {'blue'|'yellow'|'magenta'|'green'} */ (typeColors[note.type]))} | Date: ${formatDate(String(note.date))} | ${note.file}`
      )
    );
  });

  console.log('');
}

module.exports = {
  searchNotes,
};
