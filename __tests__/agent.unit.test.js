const path = require('path');
const fs = require('fs');

jest.mock('fs');
jest.mock('../cli/config');

const config = require('../cli/config');
const AgentManager = require('../cli/agent');
const ClaudeProvider = require('../cli/agent/providers/claude');
const CopilotProvider = require('../cli/agent/providers/copilot');
const GeminiProvider = require('../cli/agent/providers/gemini');
const OpenAIProvider = require('../cli/agent/providers/openai');

describe('AgentManager', () => {
  beforeEach(() => {
    fs.existsSync = jest.fn().mockReturnValue(false);
    fs.readFileSync = jest.fn().mockReturnValue('instructions');
    config.findLocalConfig.mockReturnValue(null);
    config.loadLocalConfig.mockReturnValue(null);
    config.findProjectRoot.mockReturnValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getProvider uses default when no name is provided', () => {
    const manager = new AgentManager();
    expect(manager.getProvider().name).toBe('claude');
  });

  test('resolveInstructionsPath uses project override when present', () => {
    const manager = new AgentManager();
    const projectRoot = path.join('C:', 'repo');
    const overridePath = path.join(projectRoot, '.local-work', 'localwork.agent.md');

    config.findLocalConfig.mockReturnValue(path.join(projectRoot, '.local-work', 'config.json'));
    config.loadLocalConfig.mockReturnValue({ projectRoot });
    fs.existsSync.mockImplementation((candidate) => candidate === overridePath);

    expect(manager.resolveInstructionsPath()).toBe(overridePath);
  });

  test('resolveInstructionsPath falls back to template instructions', () => {
    const manager = new AgentManager();
    const projectRoot = path.join('C:', 'repo');

    config.findLocalConfig.mockReturnValue(path.join(projectRoot, '.local-work', 'config.json'));
    config.loadLocalConfig.mockReturnValue({ projectRoot });
    fs.existsSync.mockImplementation((candidate) => candidate === manager.defaultInstructionsPath);

    expect(manager.resolveInstructionsPath()).toBe(manager.defaultInstructionsPath);
  });

  test('applyInstructions renders JSON instructions', () => {
    const manager = new AgentManager();
    const template = '{"instructions":"{{INSTRUCTIONS}}"}';
    const result = manager.applyInstructions(template, 'Line 1\nLine 2', 'json');
    expect(result).toContain('"instructions":"Line 1\\nLine 2"');
  });

  test('applyInstructions renders YAML instructions', () => {
    const manager = new AgentManager();
    const template = 'instructions: |\\n  {{INSTRUCTIONS}}\\n';
    const result = manager.applyInstructions(template, 'Line 1\nLine 2', 'yaml');
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
  });

  test('applyInstructions renders Markdown instructions', () => {
    const manager = new AgentManager();
    const template = '{{INSTRUCTIONS}}';
    const result = manager.applyInstructions(template, '# Title\nLine 2', 'md');
    expect(result).toContain('# Title');
    expect(result).toContain('Line 2');
  });
});

describe('Agent providers', () => {
  const projectRoot = path.join('C:', 'repo');

  beforeEach(() => {
    fs.existsSync = jest.fn().mockReturnValue(false);
  });

  test('Claude workspace path uses .claude/agents', () => {
    const provider = new ClaudeProvider();
    const target = provider.getWorkspacePath(projectRoot);
    expect(target).toBe(path.join(projectRoot, '.claude', 'agents', 'localwork.md'));
  });

  test('Copilot workspace path prefers .github/agents when present', () => {
    const provider = new CopilotProvider();
    const preferredDir = path.join(projectRoot, '.github', 'agents');
    fs.existsSync.mockImplementation((candidate) => candidate === preferredDir);

    const target = provider.getWorkspacePath(projectRoot);
    expect(target).toBe(path.join(preferredDir, 'localwork.md'));
  });

  test('Copilot workspace path falls back to .github/copilot/agents', () => {
    const provider = new CopilotProvider();
    const legacyDir = path.join(projectRoot, '.github', 'copilot', 'agents');
    fs.existsSync.mockImplementation((candidate) => candidate === legacyDir);

    const target = provider.getWorkspacePath(projectRoot);
    expect(target).toBe(path.join(legacyDir, 'localwork.md'));
  });

  test('Gemini workspace path uses .config/gemini/agents', () => {
    const provider = new GeminiProvider();
    const target = provider.getWorkspacePath(projectRoot);
    expect(target).toBe(path.join(projectRoot, '.config', 'gemini', 'agents', 'localwork.md'));
  });

  test('OpenAI workspace path uses .openai/custom-agents', () => {
    const provider = new OpenAIProvider();
    const target = provider.getWorkspacePath(projectRoot);
    expect(target).toBe(path.join(projectRoot, '.openai', 'custom-agents', 'localwork.md'));
  });
});
