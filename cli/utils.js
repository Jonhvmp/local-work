// Utility functions for CLI scripts

const fs = require('fs');
const path = require('path');
const { exec, execSync, spawn } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

// Color helper functions
/**
 * Apply ANSI color to text
 * @param {string} text - Text to colorize
 * @param {keyof typeof colors} color - Color name from colors object
 * @returns {string} Colorized text with ANSI codes
 */
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Format text as success message (green)
 * @param {string} text - Text to format
 * @returns {string} Green colored text
 */
function success(text) {
  return colorize(text, 'green');
}

/**
 * Format text as error message (red)
 * @param {string} text - Text to format
 * @returns {string} Red colored text
 */
function error(text) {
  return colorize(text, 'red');
}

/**
 * Format text as warning message (yellow)
 * @param {string} text - Text to format
 * @returns {string} Yellow colored text
 */
function warning(text) {
  return colorize(text, 'yellow');
}

/**
 * Format text as info message (blue)
 * @param {string} text - Text to format
 * @returns {string} Blue colored text
 */
function info(text) {
  return colorize(text, 'blue');
}

/**
 * Format text as dimmed
 * @param {string} text - Text to format
 * @returns {string} Dimmed text
 */
function dim(text) {
  return colorize(text, 'dim');
}

/**
 * Format text as bold
 * @param {string} text - Text to format
 * @returns {string} Bold text
 */
function bold(text) {
  return colorize(text, 'bright');
}

// Status colors
/**
 * Get color for task status
 * @param {string} status - Task status (backlog, active, completed, archived)
 * @returns {string} Color name for the status
 */
function getStatusColor(status) {
  const statusColors = {
    backlog: 'blue',
    active: 'yellow',
    completed: 'green',
    archived: 'gray',
  };
  return statusColors[/** @type {keyof statusColors} */ (status)] || 'white';
}

// Priority colors
/**
 * Get color for task priority
 * @param {string} priority - Task priority (low, medium, high)
 * @returns {string} Color name for the priority
 */
function getPriorityColor(priority) {
  const priorityColors = {
    low: 'gray',
    medium: 'yellow',
    high: 'red',
  };
  return priorityColors[/** @type {keyof priorityColors} */ (priority)] || 'white';
}

// Icons (text-based)
const icons = {
  task: '◉',
  note: '◈',
  check: '*',
  cross: 'X',
  arrow: '→',
  bullet: '•',
  star: '*',
  info: '>',
  warning: '!',
  error: 'X',
  success: '*',
  edit: '✎',
};

// Date formatting
/**
 * Format date string to relative time
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted relative date (e.g., "today", "2 days ago")
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return dateString.toString();
}

// Time parsing (e.g., "2h", "30m", "1.5h")
/**
 * Parse time string to hours
 * @param {string} timeStr - Time string (e.g., "2h", "30m", "1.5h")
 * @returns {number} Time in hours
 */
function parseTime(timeStr) {
  const match = timeStr.match(/^(\d+\.?\d*)([hm])$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2];

  return unit === 'h' ? value : value / 60;
}

// Time formatting (hours to "Xh Ym")
/**
 * Format hours to human-readable time string
 * @param {number} hours - Hours to format
 * @returns {string} Formatted time (e.g., "2h 30m")
 */
function formatTime(hours) {
  if (hours === 0) return '0h';

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Ensure directory exists
/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path to ensure
 * @returns {void}
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Get current date and time
/**
 * Get current date in ISO format (YYYY-MM-DD)
 * @returns {string} Current date
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current time in HH:MM format
 * @returns {string} Current time
 */
function getCurrentTime() {
  return new Date().toTimeString().split(' ')[0].substring(0, 5);
}

/**
 * Get current date and time in ISO-like format
 * @returns {string} Current datetime (YYYY-MM-DD HH:MM:SS)
 */
function getCurrentDateTime() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// Open file in editor
/**
 * Open file in configured editor
 * @param {string} filePath - Path to file to open
 * @returns {Promise<void>}
 */
function openInEditor(filePath) {
  return new Promise((resolve) => {
    // Check if we have a TTY (interactive terminal)
    if (!process.stdin.isTTY) {
      // Not in interactive mode, skip opening editor silently
      resolve();
      return;
    }

    // Priority order for editors:
    // 1. VS Code (code) - most common GUI editor
    // 2. VS Code Insiders (code-insiders)
    // 3. Sublime Text (subl)
    // 4. Atom (atom)
    // 5. TextEdit/Notepad++ (platform-specific)
    // 6. User's EDITOR/VISUAL environment variable (if terminal editor)
    // 7. nano/notepad (platform-specific fallback)

    let editor = '';

    // Try to find a GUI editor first (better UX for task/note editing)
    const isMac = process.platform === 'darwin';
    const isWindows = process.platform === 'win32';

    // Platform-specific GUI editors
    const guiEditors = ['code', 'code-insiders', 'subl', 'atom'];
    if (isMac) {
      guiEditors.push('mate'); // TextMate
    } else if (isWindows) {
      guiEditors.push('notepad++');
    } else {
      guiEditors.push('gedit', 'kate'); // Linux
    }

    // Use 'where' on Windows, 'which' on Unix-like systems
    const whichCmd = isWindows ? 'where' : 'which';

    for (const cmd of guiEditors) {
      try {
        execSync(`${whichCmd} ${cmd}`, { stdio: 'ignore' });
        editor = cmd;
        break;
      } catch (_e) {
        // Command not found, try next
      }
    }

    // If no GUI editor found, fallback to EDITOR/VISUAL env vars
    if (!editor) {
      editor = process.env.EDITOR || process.env.VISUAL || '';
    }

    // Final fallback to platform-specific default or system opener
    if (!editor) {
      if (isMac) {
        // On macOS, use 'open' to open with default text editor
        editor = 'open';
      } else if (isWindows) {
        editor = 'notepad';
      } else {
        editor = 'nano';
      }
    }

    // Check if editor is a GUI app (code, subl, atom, etc)
    // Extract basename if it's a full path (e.g., /usr/bin/code -> code)
    const editorBasename = path.basename(editor);
    const isGuiEditor = guiEditors.includes(editorBasename);

    if (isGuiEditor) {
      // For GUI editors, spawn process and return immediately
      // Use --reuse-window for VS Code to open in current window
      const isVSCode = editorBasename === 'code' || editorBasename === 'code-insiders';

      // Convert to absolute path to ensure it works across different shells
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);

      // On Windows, use exec instead of spawn for better PATH resolution
      if (isWindows) {
        const editorCmd = isVSCode
          ? `"${editor}" --reuse-window "${absolutePath}"`
          : `"${editor}" "${absolutePath}"`;
        exec(editorCmd, (_error) => {
          // Ignore errors, file might open in background
        });
        /* global setTimeout */
        setTimeout(resolve, 100);
      } else {
        // On Unix-like systems, spawn works well
        const args = isVSCode ? ['--reuse-window', absolutePath] : [absolutePath];

        try {
          const child = spawn(editor, args, {
            detached: true,
            stdio: 'ignore',
          });

          child.unref();
          resolve();
        } catch (_error) {
          // If spawn fails, try with exec as fallback
          const editorCmd = isVSCode
            ? `${editor} --reuse-window "${absolutePath}"`
            : `${editor} "${absolutePath}"`;
          exec(editorCmd, () => {});
          setTimeout(resolve, 100);
        }
      }
    } else if (isWindows && (editor === 'notepad' || editor === 'notepad++')) {
      // For Windows notepad, use start command to open in background
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
      exec(`start "" "${absolutePath}"`, (_error) => {
        resolve();
      });
    } else if (isMac && editor === 'open') {
      // For macOS, use open command with -t flag for text editor
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
      exec(`open -t "${absolutePath}"`, (_error) => {
        resolve();
      });
    } else {
      // For terminal editors, wait for them to close
      exec(`${editor} "${filePath}"`, (_error) => {
        resolve();
      });
    }
  });
}

// Parse frontmatter
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

// Update frontmatter field
/**
 * Update a field in markdown frontmatter
 * @param {string} content - Markdown content with frontmatter
 * @param {string} field - Field name to update
 * @param {string|string[]} value - New value for the field
 * @returns {string} Updated markdown content
 */
function updateFrontmatter(content, field, value) {
  const match = content.match(/^(---\n[\s\S]*?\n---)/);
  if (!match) return content;

  let frontmatter = match[1];
  const fieldRegex = new RegExp(`${field}:.*`, 'g');

  // Format value
  let formattedValue = value;
  if (Array.isArray(value)) {
    formattedValue = `[${value.join(', ')}]`;
  } else if (typeof value === 'string' && value.includes(':')) {
    formattedValue = `"${value}"`;
  }

  if (frontmatter.match(fieldRegex)) {
    frontmatter = frontmatter.replace(fieldRegex, `${field}: ${formattedValue}`);
  } else {
    frontmatter = frontmatter.replace('---', `${field}: ${formattedValue}\n---`);
  }

  return content.replace(match[1], frontmatter);
}

// Table formatter
/**
 * Format data as ASCII table
 * @param {string[]} headers - Column headers
 * @param {Array<any[]>} rows - Table rows (array of arrays)
 * @param {string[]} _columnColors - Column colors (unused, for future)
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

// Progress bar
/**
 * Generate progress bar
 * @param {number} current - Current progress value
 * @param {number} total - Total progress value
 * @param {number} width - Width of progress bar in characters
 * @returns {string} Formatted progress bar
 */
function progressBar(current, total, width = 20) {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const filled = Math.round((width * current) / total);
  const empty = width - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const color = percentage < 30 ? 'red' : percentage < 70 ? 'yellow' : 'green';

  return `${colorize(bar, color)} ${percentage}%`;
}

module.exports = {
  colors,
  colorize,
  success,
  error,
  warning,
  info,
  dim,
  bold,
  getStatusColor,
  getPriorityColor,
  icons,
  formatDate,
  parseTime,
  formatTime,
  ensureDir,
  getCurrentDate,
  getCurrentTime,
  getCurrentDateTime,
  openInEditor,
  parseFrontmatter,
  updateFrontmatter,
  formatTable,
  progressBar,
};
