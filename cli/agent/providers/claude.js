const os = require('os');
const path = require('path');
const BaseProvider = require('./base');

class ClaudeProvider extends BaseProvider {
  constructor() {
    super('claude', 'md');
  }

  /**
   * @param {string} projectRoot
   * @returns {string}
   */
  getWorkspacePath(projectRoot) {
    return path.join(projectRoot, '.claude', 'agents', this.getDefaultFileName());
  }

  async getDefaultPath() {
    const detected = await this.detectPath();
    if (detected) return detected;
    return path.join(os.homedir(), '.claude', 'agents', this.getDefaultFileName());
  }

  async getPossiblePaths() {
    const filename = this.getDefaultFileName();
    const paths = [];

    if (process.env.CLAUDE_AGENTS_PATH) {
      paths.push(path.join(process.env.CLAUDE_AGENTS_PATH, filename));
    }
    if (process.env.CLAUDE_HOME) {
      paths.push(path.join(process.env.CLAUDE_HOME, 'agents', filename));
    }

    const home = os.homedir();
    paths.push(path.join(home, '.claude', 'agents', filename));
    paths.push(path.join(home, '.config', 'claude', 'agents', filename));

    if (process.platform === 'win32') {
      const appData = process.env.APPDATA || '';
      const localAppData = process.env.LOCALAPPDATA || '';
      if (appData) {
        paths.push(path.join(appData, 'Claude', 'agents', filename));
      }
      if (localAppData) {
        paths.push(path.join(localAppData, 'Claude', 'agents', filename));
      }
    }

    return paths;
  }
}

module.exports = ClaudeProvider;
