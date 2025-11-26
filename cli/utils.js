// Utility functions for CLI scripts

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

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
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

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
 * @returns {number|null} Time in hours, or null if invalid format
 */
function parseTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const match = timeStr.match(/^(\d+\.?\d*)([hm])$/);
  if (!match) return null;

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
 * Sanitize file path to prevent shell injection
 * @param {string} filePath - Path to sanitize
 * @returns {string} Sanitized path
 */
function sanitizePath(filePath) {
  // Reject paths with dangerous characters that could be used for injection
  const dangerousChars = /[;&|`$(){}[\]<>!]/;
  if (dangerousChars.test(filePath)) {
    throw new Error(`Invalid file path: contains potentially dangerous characters`);
  }
  // Normalize the path to remove any .. traversals and ensure it's absolute
  return path.resolve(filePath);
}

/**
 * Open file in configured editor
 * @param {string} filePath - Path to file to open
 * @returns {Promise<void>}
 */
function openInEditor(filePath) {
  return new Promise((resolve, reject) => {
    // Check if we have a TTY (interactive terminal)
    if (!process.stdin.isTTY) {
      // Not in interactive mode, skip opening editor silently
      resolve();
      return;
    }

    // Sanitize the file path to prevent shell injection
    let absolutePath;
    try {
      absolutePath = sanitizePath(filePath);
    } catch (err) {
      reject(err);
      return;
    }

    // Verify the file exists
    if (!fs.existsSync(absolutePath)) {
      reject(new Error(`File not found: ${absolutePath}`));
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

    // Check if we're running inside VS Code's integrated terminal
    const isInsideVSCode = process.env.TERM_PROGRAM === 'vscode';

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
      } catch {
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
      const isVSCode = editorBasename === 'code' || editorBasename === 'code-insiders';

      /**
       * Helper function to spawn editor with error handling
       * @param {string} cmd - Command to execute
       * @param {string[]} args - Arguments for the command
       * @param {Function|null} fallbackFn - Fallback function if spawn fails
       */
      const spawnEditor = (cmd, args, fallbackFn) => {
        const child = spawn(cmd, args, {
          detached: true,
          stdio: 'ignore',
          shell: false, // Security: don't use shell
        });

        child.on('error', () => {
          // If spawn fails (ENOENT), try fallback
          if (fallbackFn) {
            fallbackFn();
          }
          resolve();
        });

        child.unref();
        resolve();
      };

      // Fallback function for Windows
      const windowsFallback = () => {
        // Use cmd /c start to open with default application
        const fallbackChild = spawn('cmd', ['/c', 'start', '""', absolutePath], {
          stdio: 'ignore',
          shell: false,
        });
        fallbackChild.on('error', () => {}); // Ignore fallback errors
      };

      // When inside VS Code terminal, use spawn without --reuse-window
      // as the file will automatically open in the current VS Code instance
      if (isInsideVSCode && isVSCode) {
        // Inside VS Code terminal - just open the file, it will use current window
        spawnEditor(editor, [absolutePath], isWindows ? windowsFallback : null);
        return;
      }

      // Outside VS Code terminal - use --reuse-window flag
      const args = isVSCode ? ['--reuse-window', absolutePath] : [absolutePath];
      spawnEditor(editor, args, isWindows ? windowsFallback : null);
      return;
    } else if (isWindows && (editor === 'notepad' || editor === 'notepad++')) {
      // For Windows notepad, use spawn instead of exec for security
      spawn('cmd', ['/c', 'start', '', absolutePath], {
        stdio: 'ignore',
        shell: false,
      });
      resolve();
    } else if (isMac && editor === 'open') {
      // For macOS, use spawn with -t flag for text editor
      spawn('open', ['-t', absolutePath], { stdio: 'ignore' });
      resolve();
    } else {
      // For terminal editors, use spawn and wait for them to close
      const child = spawn(editor, [absolutePath], {
        stdio: 'inherit', // Connect to terminal for interactive editors
        shell: false,
      });
      child.on('close', () => resolve());
      child.on('error', () => resolve());
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
