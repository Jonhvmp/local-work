/**
 * @fileoverview Note listing operations
 * @description List notes by type or all types
 */

const fs = require('fs');
const path = require('path');
const { bold, dim, colorize, icons } = require('../utils/colors');
const { formatDate } = require('../utils/date');
const { parseFrontmatter } = require('../utils/format');

/**
 * List notes by type or all types
 * @param {() => string} getNotesDir - Function to get notes directory
 * @param {string|null} [type=null] - Note type to filter (daily, meetings, technical, learning) or null for all
 * @returns {void}
 */
function listNotes(getNotesDir, type = null) {
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
            `\n-> ${noteType.toUpperCase()} (${files.length} recent)`,
            /** @type {'blue'|'yellow'|'magenta'|'green'|'white'} */ (
              typeColors[noteType] || 'white'
            )
          )
        );

        files.forEach((file) => {
          const filePath = path.join(dirPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const { frontmatter } = parseFrontmatter(content);
          /** @type {any} */
          const meta = frontmatter;
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

module.exports = {
  listNotes,
};
