const fs = require('fs');

const AGENT_BASENAME = 'localwork';

/**
 * Base Provider Class
 * @abstract
 */
class BaseProvider {
  /**
   * @param {string} name
   * @param {string} extension
   */
  constructor(name, extension) {
    this.name = name;
    this.extension = extension;
  }

  /**
   * Primary file name for the provider.
   * @returns {string}
   */
  getDefaultFileName() {
    return `${AGENT_BASENAME}.${this.extension}`;
  }

  /**
   * Workspace file name for the provider.
   * @returns {string}
   */
  getWorkspaceFileName() {
    return `${AGENT_BASENAME}.${this.name}.${this.extension}`;
  }

  /**
   * Template file name for the provider.
   * @returns {string}
   */
  getTemplateFileName() {
    return `${this.name}.${this.extension}`;
  }

  /**
   * Return default path where provider stores agents.
   * @abstract
   * @returns {Promise<string>}
   */
  async getDefaultPath() {
    throw new Error('Must implement getDefaultPath()');
  }

  /**
   * Return project/workspace path for this provider.
   * @abstract
   * @param {string} _projectRoot
   * @returns {string}
   */
  getWorkspacePath(_projectRoot) {
    throw new Error('Must implement getWorkspacePath()');
  }

  /**
   * Possible locations for agent files.
   * @abstract
   * @returns {Promise<string[]>}
   */
  async getPossiblePaths() {
    return [];
  }

  /**
   * Detect existing agent path.
   * @returns {Promise<string|null>}
   */
  async detectPath() {
    const paths = await this.getPossiblePaths();
    for (const candidate of paths) {
      if (candidate && fs.existsSync(candidate)) {
        return candidate;
      }
    }
    return null;
  }
}

module.exports = BaseProvider;
