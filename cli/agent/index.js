const fs = require('fs');
const path = require('path');
const readline = require('readline');
const config = require('../config');
const { success, warning, dim, bold, icons, info, formatTable, parseFrontmatter } = require('../utils');
const ClaudeProvider = require('./providers/claude');
const CopilotProvider = require('./providers/copilot');
const GeminiProvider = require('./providers/gemini');
const OpenAIProvider = require('./providers/openai');

/**
 * @typedef {'claude'|'copilot'|'gemini'|'openai'} ProviderName
 * @typedef {ClaudeProvider|CopilotProvider|GeminiProvider|OpenAIProvider} Provider
 * @typedef {{ projectRoot?: string }} LocalConfig
 */

const DEFAULT_PROVIDER = 'claude';

class AgentManager {
  constructor() {
    /** @type {{ claude: ClaudeProvider, copilot: CopilotProvider, gemini: GeminiProvider, openai: OpenAIProvider }} */
    this.providers = {
      claude: new ClaudeProvider(),
      copilot: new CopilotProvider(),
      gemini: new GeminiProvider(),
      openai: new OpenAIProvider(),
    };

    this.templateDir = path.join(__dirname, '..', '..', 'templates', 'agent');
    this.defaultInstructionsPath = path.join(
      __dirname,
      '..',
      '..',
      'templates',
      'localwork.agent.md'
    );
  }

  /**
   * @param {string} [name]
   * @returns {Provider}
   */
  getProvider(name) {
    const providerName = /** @type {ProviderName} */ (name || DEFAULT_PROVIDER);
    const provider = this.providers[providerName];
    if (!provider) {
      throw new Error(
        `Unknown provider "${providerName}". Available: ${Object.keys(this.providers).join(', ')}`
      );
    }
    return provider;
  }

  /**
   * @param {string} [name]
   * @returns {Promise<ProviderName>}
   */
  async resolveProviderName(name) {
    if (name) {
      return /** @type {ProviderName} */ (name);
    }

    if (!process.stdin.isTTY) {
      console.log(info(`${icons.info} Provider not set. Using default: ${DEFAULT_PROVIDER}`));
      return DEFAULT_PROVIDER;
    }

    return this.promptProvider();
  }

  /**
   * @returns {string}
   */
  getProjectRoot() {
    const localConfigPath = config.findLocalConfig(process.cwd());
    if (localConfigPath) {
      const localConfig = /** @type {LocalConfig|null} */ (config.loadLocalConfig(localConfigPath));
      if (localConfig && localConfig.projectRoot) {
        return localConfig.projectRoot;
      }
      return path.dirname(path.dirname(localConfigPath));
    }

    const detectedRoot = config.findProjectRoot(process.cwd());
    return detectedRoot || process.cwd();
  }

  /**
   * @returns {string}
   */
  resolveInstructionsPath() {
    const projectRoot = this.getProjectRoot();
    if (projectRoot) {
      const overridePath = path.join(projectRoot, '.local-work', 'localwork.agent.md');
      if (fs.existsSync(overridePath)) {
        return overridePath;
      }
    }

    if (fs.existsSync(this.defaultInstructionsPath)) {
      return this.defaultInstructionsPath;
    }

    throw new Error('Default instructions file not found in templates/.');
  }

  /**
   * @param {Provider} provider
   * @returns {string}
   */
  getTemplatePath(provider) {
    return path.join(this.templateDir, provider.getTemplateFileName());
  }

  /**
   * @param {string} content
   * @param {string} instructions
   * @param {string} extension
   * @returns {string}
   */
  applyInstructions(content, instructions, extension) {
    const normalized = instructions.replace(/\r\n/g, '\n');
    if (extension === 'md' || extension === 'markdown') {
      return content.replace('{{INSTRUCTIONS}}', normalized);
    }
    if (extension === 'yaml' || extension === 'yml') {
      const indented = normalized
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n');
      return content.replace('{{INSTRUCTIONS}}', indented);
    }

    return content.replace('"{{INSTRUCTIONS}}"', JSON.stringify(normalized));
  }

  /**
   * @param {{ useGlobal?: boolean, useWorkspace?: boolean }} options
   * @returns {Promise<'global'|'workspace'>}
   */
  async resolveScope(options) {
    if (options.useGlobal && options.useWorkspace) {
      throw new Error('Choose only one scope: --global or --workspace.');
    }
    if (options.useGlobal) return 'global';
    if (options.useWorkspace) return 'workspace';

    if (!process.stdin.isTTY) {
      throw new Error('Non-interactive mode. Use --global or --workspace.');
    }

    return await this.promptScope();
  }

  /**
   * @returns {Promise<'global'|'workspace'>}
   */
  promptScope() {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        [
          'Select scope:',
          '  [1] global (home)',
          '  [2] workspace (project)',
          'Enter choice (default: 1): ',
        ].join('\n'),
        (answer) => {
        rl.close();
        const value = answer.trim().toLowerCase();
        if (!value || value === '1' || value === 'global' || value === 'g') {
          resolve('global');
          return;
        }
        if (value === '2' || value === 'workspace' || value === 'w' || value === 'local') {
          resolve('workspace');
          return;
        }
        reject(new Error('Invalid selection. Use "global" or "workspace".'));
      }
      );
    });
  }

  /**
   * @returns {Promise<ProviderName>}
   */
  promptProvider() {
    const providers = /** @type {ProviderName[]} */ (Object.keys(this.providers));

    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const lines = [
        'Select provider:',
        ...providers.map((provider, index) => `  [${index + 1}] ${provider}`),
        'Enter choice (default: 1): ',
      ];

      rl.question(lines.join('\n'), (answer) => {
        rl.close();
        const value = answer.trim().toLowerCase();
        if (!value || value === '1') {
          resolve('claude');
          return;
        }

        const asNumber = Number.parseInt(value, 10);
        if (!Number.isNaN(asNumber) && providers[asNumber - 1]) {
          resolve(providers[asNumber - 1]);
          return;
        }

        if (providers.includes(/** @type {ProviderName} */ (value))) {
          resolve(/** @type {ProviderName} */ (value));
          return;
        }

        reject(new Error('Invalid selection. Choose a provider from the list.'));
      });
    });
  }

  /**
   * @param {import('./providers/base')} provider
   * @param {'global'|'workspace'} scope
   * @returns {Promise<string>}
   */
  async resolveTargetPath(provider, scope) {
    if (scope === 'global') {
      return await provider.getDefaultPath();
    }

    const projectRoot = this.getProjectRoot();
    return provider.getWorkspacePath(projectRoot);
  }

  /**
   * @param {string} [providerName]
   * @param {{ useGlobal?: boolean, useWorkspace?: boolean }} options
   */
  async setup(providerName, options = {}) {
    const resolvedProviderName = await this.resolveProviderName(providerName);
    const provider = this.getProvider(resolvedProviderName);
    const scope = await this.resolveScope(options);
    const targetPath = await this.resolveTargetPath(provider, scope);
    const templatePath = this.getTemplatePath(provider);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const instructionsPath = this.resolveInstructionsPath();
    const instructions = fs.readFileSync(instructionsPath, 'utf8');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const rendered = this.applyInstructions(templateContent, instructions, provider.extension);

    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, rendered, 'utf8');

    console.log('');
    console.log(bold('Agent setup complete'));
    console.log(`${icons.arrow} Provider: ${provider.name}`);
    console.log(`${icons.arrow} Scope: ${scope}`);
    console.log(`${icons.arrow} Instructions: ${instructionsPath}`);
    console.log(`${icons.arrow} Target: ${targetPath}`);
    console.log('');
  }

  /**
   * @param {string} [providerName]
   * @param {{ useGlobal?: boolean, useWorkspace?: boolean }} options
   */
  async test(providerName, options = {}) {
    const resolvedProviderName = await this.resolveProviderName(providerName);
    const provider = this.getProvider(resolvedProviderName);
    const scope = await this.resolveScope(options);
    const targetPath = await this.resolveTargetPath(provider, scope);

    if (!fs.existsSync(targetPath)) {
      throw new Error(`Agent file not found: ${targetPath}`);
    }

    if (provider.extension === 'md' || provider.extension === 'markdown') {
      const content = fs.readFileSync(targetPath, 'utf8');
      const frontmatter = parseFrontmatter(content);
      if (!frontmatter.name) {
        throw new Error('Markdown agent missing frontmatter: name');
      }
      console.log(success(`${icons.check} Markdown frontmatter valid`));
      return;
    }

    if (provider.extension === 'json') {
      const content = fs.readFileSync(targetPath, 'utf8');
      JSON.parse(content);
      console.log(success(`${icons.check} JSON parsed successfully`));
      return;
    }

    if (provider.extension === 'yaml' || provider.extension === 'yml') {
      let parsed = false;
      try {
        // Optional dependency
        const yaml = require('js-yaml');
        yaml.load(fs.readFileSync(targetPath, 'utf8'));
        parsed = true;
      } catch (err) {
        const error = /** @type {{ code?: string }} */ (err);
        if (error && error.code === 'MODULE_NOT_FOUND') {
          console.log(warning(`${icons.warning} js-yaml not installed; skipping YAML parse`));
        } else {
          throw err;
        }
      }
      if (parsed) {
        console.log(success(`${icons.check} YAML parsed successfully`));
      }
    }
  }

  async list() {
    const rows = [];
    const projectRoot = this.getProjectRoot();

    for (const provider of Object.values(this.providers)) {
      const globalPath = await provider.getDefaultPath();
      const globalExists = fs.existsSync(globalPath);
      rows.push([
        provider.name,
        'global',
        globalExists ? success('ready') : dim('missing'),
        globalPath,
      ]);

      if (projectRoot) {
        const workspacePath = provider.getWorkspacePath(projectRoot);
        const workspaceExists = fs.existsSync(workspacePath);
        rows.push([
          provider.name,
          'workspace',
          workspaceExists ? success('ready') : dim('missing'),
          workspacePath,
        ]);
      }
    }

    const table = formatTable(['Provider', 'Scope', 'Status', 'Path'], rows);
    console.log('\n' + table + '\n');
  }
}

module.exports = AgentManager;
