const os = require('os');
const path = require('path');
const BaseProvider = require('./base');

class OpenAIProvider extends BaseProvider {
  constructor() {
    super('openai', 'md');
  }

  /**
   * @param {string} projectRoot
   * @returns {string}
   */
  getWorkspacePath(projectRoot) {
    return path.join(projectRoot, '.openai', 'custom-agents', this.getDefaultFileName());
  }

  async getDefaultPath() {
    const detected = await this.detectPath();
    if (detected) return detected;
    return path.join(os.homedir(), '.openai', 'custom-agents', this.getDefaultFileName());
  }

  async getPossiblePaths() {
    const filename = this.getDefaultFileName();
    const paths = [];

    if (process.env.OPENAI_AGENTS_PATH) {
      paths.push(path.join(process.env.OPENAI_AGENTS_PATH, filename));
    }
    if (process.env.OPENAI_HOME) {
      paths.push(path.join(process.env.OPENAI_HOME, 'custom-agents', filename));
    }

    const home = os.homedir();
    paths.push(path.join(home, '.openai', 'custom-agents', filename));
    paths.push(path.join(home, '.config', 'openai', 'custom-agents', filename));

    if (process.platform === 'win32') {
      const appData = process.env.APPDATA || '';
      const localAppData = process.env.LOCALAPPDATA || '';
      if (appData) {
        paths.push(path.join(appData, 'OpenAI', 'custom-agents', filename));
      }
      if (localAppData) {
        paths.push(path.join(localAppData, 'OpenAI', 'custom-agents', filename));
      }
    }

    return paths;
  }
}

module.exports = OpenAIProvider;
