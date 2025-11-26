/**
 * Text formatting utilities
 * @module utils/format
 */

const { bold } = require('./colors');

// ============================================================================
// Frontmatter Parsing
// ============================================================================

/**
 * Parse YAML frontmatter from markdown content
 * @param {string} content - Markdown content with frontmatter
 * @returns {Record<string, string|string[]>} Parsed frontmatter object
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  /** @type {Record<string, string|string[]>} */
  const frontmatter = {};
  const lines = match[1].split('\n');

  lines.forEach((/** @type {string} */ line) => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      /** @type {string|string[]} */
      let value = valueParts.join(':').trim();

      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');

      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map((/** @type {string} */ v) => v.trim());
      }

      frontmatter[key.trim()] = value;
    }
  });

  return frontmatter;
}

/**
 * Update frontmatter in markdown content
 * Compatible with original API: updateFrontmatter(content, field, value)
 * @param {string} content - Original content
 * @param {string} field - Field name to update
 * @param {unknown} value - New value for the field
 * @returns {string} Updated content
 */
function updateFrontmatter(content, field, value) {
  const match = content.match(/^(---\n[\s\S]*?\n---)/);
  if (!match) return content;

  let frontmatter = match[1];
  const fieldRegex = new RegExp(`${field}:.*`, 'g');

  // Format value - escape quotes properly
  let formattedValue = value;
  if (Array.isArray(value)) {
    formattedValue = `[${value.map((v) => (typeof v === 'string' && (v.includes(':') || v.includes('"')) ? `"${v.replace(/"/g, '\\"')}"` : v)).join(', ')}]`;
  } else if (typeof value === 'string') {
    // Escape quotes and wrap if contains special chars
    if (value.includes('"') || value.includes(':') || value.includes('#')) {
      formattedValue = `"${value.replace(/"/g, '\\"')}"`;
    }
  }

  if (frontmatter.match(fieldRegex)) {
    frontmatter = frontmatter.replace(fieldRegex, `${field}: ${formattedValue}`);
  } else {
    // Insert new field before the closing --- (at correct position)
    frontmatter = frontmatter.replace(/\n---$/, `\n${field}: ${formattedValue}\n---`);
  }

  return content.replace(match[1], frontmatter);
}

/**
 * Update multiple frontmatter fields at once
 * @param {string} content - Original content
 * @param {Record<string, unknown>} updates - Object with field:value pairs
 * @returns {string} Updated content
 */
function updateFrontmatterBatch(content, updates) {
  let result = content;
  for (const [field, value] of Object.entries(updates)) {
    result = updateFrontmatter(result, field, value);
  }
  return result;
}

// ============================================================================
// Table Formatting
// ============================================================================

/**
 * Format data as ASCII table
 * @param {string[]} headers - Column headers
 * @param {Array<any[]>} rows - Table rows (array of arrays)
 * @param {string[]} [_columnColors] - Column colors (unused, for future)
 * @returns {string} Formatted ASCII table
 */
function formatTable(headers, rows, _columnColors = []) {
  const colWidths = headers.map((/** @type {string} */ header, /** @type {number} */ i) => {
    /* eslint-disable no-control-regex */
    const maxContentWidth = Math.max(
      ...rows.map(
        (/** @type {any[]} */ row) => String(row[i] || '').replace(/\x1b\[\d+m/g, '').length
      )
    );
    /* eslint-enable no-control-regex */
    return Math.max(header.length, maxContentWidth);
  });

  const separator = colWidths.map((/** @type {number} */ w) => '─'.repeat(w + 2)).join('┼');
  const headerRow = headers
    .map((/** @type {string} */ h, /** @type {number} */ i) => h.padEnd(colWidths[i]))
    .join(' │ ');

  const result = [bold(headerRow), separator];

  rows.forEach((/** @type {any[]} */ row) => {
    /* eslint-disable no-control-regex */
    const formattedRow = row
      .map((/** @type {any} */ cell, /** @type {number} */ i) => {
        const plainCell = String(cell || '').replace(/\x1b\[\d+m/g, '');
        const padding = colWidths[i] - plainCell.length;
        return cell + ' '.repeat(padding);
      })
      .join(' │ ');
    /* eslint-enable no-control-regex */

    result.push(formattedRow);
  });

  return result.join('\n');
}

/**
 * Create progress bar
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @param {number} width - Bar width in characters (default: 20)
 * @returns {string} Progress bar string
 */
function progressBar(current, total, width = 20) {
  if (total === 0) return `${'█'.repeat(width)} 100%`;

  const percentage = Math.min(100, Math.round((current / total) * 100));
  const filled = Math.round((width * current) / total);
  const empty = width - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const { colorize } = require('./colors');
  const color = percentage < 30 ? 'red' : percentage < 70 ? 'yellow' : 'green';

  return `${colorize(bar, color)} ${percentage}%`;
}

/**
 * Truncate string to max length with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLen - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, maxLen) {
  if (!str || str.length <= maxLen) return str || '';
  return str.substring(0, maxLen - 3) + '...';
}

/**
 * Pad string to width
 * @param {string} str - String to pad
 * @param {number} width - Target width
 * @param {string} char - Padding character (default: ' ')
 * @returns {string} Padded string
 */
function pad(str, width, char = ' ') {
  return String(str).padEnd(width, char);
}

/**
 * Center string within width
 * @param {string} str - String to center
 * @param {number} width - Target width
 * @returns {string} Centered string
 */
function center(str, width) {
  const padding = Math.max(0, width - str.length);
  const left = Math.floor(padding / 2);
  const right = padding - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

/**
 * Wrap text to max width
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum line width
 * @returns {string} Wrapped text
 */
function wordWrap(text, maxWidth) {
  if (!text || text.length <= maxWidth) return text || '';

  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines.join('\n');
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  return num.toLocaleString('en-US');
}

/**
 * Indent text by number of spaces
 * @param {string} text - Text to indent
 * @param {number} spaces - Number of spaces
 * @returns {string} Indented text
 */
function indent(text, spaces) {
  const prefix = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => prefix + line)
    .join('\n');
}

module.exports = {
  parseFrontmatter,
  updateFrontmatter,
  updateFrontmatterBatch,
  formatTable,
  progressBar,
  truncate,
  pad,
  center,
  wordWrap,
  formatNumber,
  indent,
};
