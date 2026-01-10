const os = require('os');
const path = require('path');
const fs = require('fs');
const BaseProvider = require('./base');

class CopilotProvider extends BaseProvider {
  constructor() {
    super('copilot', 'md');
  }

  /**
   * @param {string} projectRoot
   * @returns {string}
   */
  getWorkspacePath(projectRoot) {
    const preferredDir = path.join(projectRoot, '.github', 'agents');
    const legacyDir = path.join(projectRoot, '.github', 'copilot', 'agents');

    if (fs.existsSync(preferredDir)) {
      return path.join(preferredDir, this.getDefaultFileName());
    }
    if (fs.existsSync(legacyDir)) {
      return path.join(legacyDir, this.getDefaultFileName());
    }

    return path.join(preferredDir, this.getDefaultFileName());
  }

  async getDefaultPath() {
    const detected = await this.detectPath();
    if (detected) return detected;
    return path.join(os.homedir(), '.github', 'copilot', 'agents', this.getDefaultFileName());
  }

  async getPossiblePaths() {
    const filename = this.getDefaultFileName();
    const paths = [];

    if (process.env.COPILOT_AGENTS_PATH) {
      paths.push(path.join(process.env.COPILOT_AGENTS_PATH, filename));
    }
    if (process.env.GITHUB_COPILOT_HOME) {
      paths.push(path.join(process.env.GITHUB_COPILOT_HOME, 'agents', filename));
    }

    const home = os.homedir();
    paths.push(path.join(home, '.github', 'copilot', 'agents', filename));
    paths.push(path.join(home, '.cache', 'GitHub Copilot', 'agents', filename));

    if (process.platform === 'win32') {
      const appData = process.env.APPDATA || '';
      const localAppData = process.env.LOCALAPPDATA || '';
      if (appData) {
        paths.push(path.join(appData, 'GitHub', 'Copilot', 'agents', filename));
      }
      if (localAppData) {
        paths.push(path.join(localAppData, 'GitHub', 'Copilot', 'agents', filename));
      }
    }

    return paths;
  }
}

module.exports = CopilotProvider;
