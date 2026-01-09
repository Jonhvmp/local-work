const os = require('os');
const path = require('path');
const BaseProvider = require('./base');

class GeminiProvider extends BaseProvider {
  constructor() {
    super('gemini', 'md');
  }

  /**
   * @param {string} projectRoot
   * @returns {string}
   */
  getWorkspacePath(projectRoot) {
    return path.join(projectRoot, '.config', 'gemini', 'agents', this.getDefaultFileName());
  }

  async getDefaultPath() {
    const detected = await this.detectPath();
    if (detected) return detected;
    return path.join(os.homedir(), '.config', 'gemini', 'agents', this.getDefaultFileName());
  }

  async getPossiblePaths() {
    const filename = this.getDefaultFileName();
    const paths = [];

    if (process.env.GEMINI_AGENTS_PATH) {
      paths.push(path.join(process.env.GEMINI_AGENTS_PATH, filename));
    }
    if (process.env.GEMINI_HOME) {
      paths.push(path.join(process.env.GEMINI_HOME, 'agents', filename));
    }

    const home = os.homedir();
    paths.push(path.join(home, '.config', 'gemini', 'agents', filename));
    paths.push(path.join(home, '.local', 'share', 'gemini', 'agents', filename));

    if (process.platform === 'win32') {
      const appData = process.env.APPDATA || '';
      const localAppData = process.env.LOCALAPPDATA || '';
      if (appData) {
        paths.push(path.join(appData, 'Google', 'Gemini', 'agents', filename));
      }
      if (localAppData) {
        paths.push(path.join(localAppData, 'Google', 'Gemini', 'agents', filename));
      }
    }

    return paths;
  }
}

module.exports = GeminiProvider;
