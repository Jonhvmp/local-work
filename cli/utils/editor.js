/**
 * Editor utilities
 * @module utils/editor
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Get default editor command based on OS
 * @returns {string} Editor command
 */
function getDefaultEditor() {
  if (process.platform === 'win32') {
    return 'notepad';
  }
  return process.env.EDITOR || process.env.VISUAL || 'nano';
}

/**
 * Open file in editor
 * @param {string} filePath - Path to file to open
 * @param {string} [editor] - Editor command (optional, uses default if not specified)
 * @returns {Promise<void>} Resolves when editor closes
 */
function openInEditor(filePath, editor) {
  return new Promise((resolve, reject) => {
    const editorCmd = editor || getDefaultEditor();
    const absolutePath = path.resolve(filePath);

    // Parse editor command with arguments
    const parts = editorCmd.split(' ');
    const cmd = parts[0];
    const args = [...parts.slice(1), absolutePath];

    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to open editor: ${err.message}`));
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Editor exited with code ${code}`));
      }
    });
  });
}

/**
 * Open file in VS Code
 * @param {string} filePath - Path to file to open
 * @param {boolean} [wait=false] - Wait for VS Code to close
 * @returns {Promise<void>} Resolves when VS Code opens/closes
 */
function openInVSCode(filePath, wait = false) {
  return new Promise((resolve, reject) => {
    const absolutePath = path.resolve(filePath);
    const args = wait ? ['--wait', absolutePath] : [absolutePath];

    const child = spawn('code', args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to open VS Code: ${err.message}`));
    });

    if (wait) {
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`VS Code exited with code ${code}`));
        }
      });
    } else {
      // Don't wait, resolve immediately after spawn
      resolve();
    }
  });
}

/**
 * Open file in system default application
 * @param {string} filePath - Path to file to open
 * @returns {Promise<void>} Resolves when application opens
 */
function openWithDefault(filePath) {
  return new Promise((resolve, reject) => {
    const absolutePath = path.resolve(filePath);
    let cmd;
    let args;

    switch (process.platform) {
      case 'win32':
        cmd = 'cmd';
        args = ['/c', 'start', '""', absolutePath];
        break;
      case 'darwin':
        cmd = 'open';
        args = [absolutePath];
        break;
      default:
        cmd = 'xdg-open';
        args = [absolutePath];
    }

    const child = spawn(cmd, args, {
      stdio: 'inherit',
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to open file: ${err.message}`));
    });

    child.on('close', () => {
      resolve();
    });
  });
}

module.exports = {
  getDefaultEditor,
  openInEditor,
  openInVSCode,
  openWithDefault,
};
