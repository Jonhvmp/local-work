const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock console methods to avoid test output pollution
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

// Mock exec to avoid actual editor launches
jest.mock('child_process', () => ({
  exec: jest.fn((cmd, callback) => callback && callback(null, '', '')),
}));

describe('Task Integration Tests', () => {
  const testRootDir = path.join(os.tmpdir(), 'task-integration-test-' + Date.now());
  const TASKS_DIR = path.join(testRootDir, 'tasks');

  beforeAll(() => {
    process.env.TASKS_DIR = TASKS_DIR;
    fs.mkdirSync(testRootDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(testRootDir)) {
      fs.rmSync(testRootDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    // Clear tasks directory before each test
    if (fs.existsSync(TASKS_DIR)) {
      fs.rmSync(TASKS_DIR, { recursive: true, force: true });
    }
    console.log.mockClear();
  });

  test('should create task in backlog directory', () => {
    // We need to test the actual functions, not the CLI
    const { ensureDir } = require('../cli/utils');
    const backlogDir = path.join(TASKS_DIR, 'backlog');

    ensureDir(backlogDir);

    const taskId = 'TASK-001';
    const taskContent = `---
id: ${taskId}
title: Test Task
status: backlog
priority: medium
created: 2024-01-15
---

# Test Task

Task description here.
`;

    const taskFile = path.join(backlogDir, `${taskId}.md`);
    fs.writeFileSync(taskFile, taskContent);

    expect(fs.existsSync(taskFile)).toBe(true);
    const content = fs.readFileSync(taskFile, 'utf-8');
    expect(content).toContain('id: TASK-001');
    expect(content).toContain('status: backlog');
  });

  test('should move task from backlog to active', () => {
    const { ensureDir } = require('../cli/utils');
    const backlogDir = path.join(TASKS_DIR, 'backlog');
    const activeDir = path.join(TASKS_DIR, 'active');

    ensureDir(backlogDir);
    ensureDir(activeDir);

    const taskId = 'TASK-002';
    const taskFile = path.join(backlogDir, `${taskId}.md`);
    fs.writeFileSync(taskFile, `---\nid: ${taskId}\nstatus: backlog\n---\n\nContent`);

    // Simulate moving task
    const newPath = path.join(activeDir, `${taskId}.md`);
    fs.renameSync(taskFile, newPath);

    expect(fs.existsSync(newPath)).toBe(true);
    expect(fs.existsSync(taskFile)).toBe(false);
  });

  test('should update task frontmatter fields', () => {
    const { ensureDir, updateFrontmatter } = require('../cli/utils');
    const activeDir = path.join(TASKS_DIR, 'active');
    ensureDir(activeDir);

    const taskId = 'TASK-003';
    const taskContent = `---
id: ${taskId}
title: Original Title
priority: low
---

# Content`;

    const taskFile = path.join(activeDir, `${taskId}.md`);
    fs.writeFileSync(taskFile, taskContent);

    const updatedContent = updateFrontmatter(taskContent, 'priority', 'high');
    fs.writeFileSync(taskFile, updatedContent);

    const newContent = fs.readFileSync(taskFile, 'utf-8');
    expect(newContent).toContain('priority: high');
    expect(newContent).not.toContain('priority: low');
  });

  test('should complete full task lifecycle: create → active → completed → archived', () => {
    const { ensureDir } = require('../cli/utils');

    const backlogDir = path.join(TASKS_DIR, 'backlog');
    const activeDir = path.join(TASKS_DIR, 'active');
    const completedDir = path.join(TASKS_DIR, 'completed');
    const archivedDir = path.join(TASKS_DIR, 'archived');

    [backlogDir, activeDir, completedDir, archivedDir].forEach((dir) => ensureDir(dir));

    const taskId = 'TASK-004';
    let taskPath = path.join(backlogDir, `${taskId}.md`);
    const content = `---\nid: ${taskId}\n---\n\n# Task`;

    // Create in backlog
    fs.writeFileSync(taskPath, content);
    expect(fs.existsSync(taskPath)).toBe(true);

    // Move to active
    const activePath = path.join(activeDir, `${taskId}.md`);
    fs.renameSync(taskPath, activePath);
    expect(fs.existsSync(activePath)).toBe(true);

    // Move to completed
    const completedPath = path.join(completedDir, `${taskId}.md`);
    fs.renameSync(activePath, completedPath);
    expect(fs.existsSync(completedPath)).toBe(true);

    // Move to archived
    const archivedPath = path.join(archivedDir, `${taskId}.md`);
    fs.renameSync(completedPath, archivedPath);
    expect(fs.existsSync(archivedPath)).toBe(true);
  });

  test('should list all tasks in a directory', () => {
    const { ensureDir } = require('../cli/utils');
    const backlogDir = path.join(TASKS_DIR, 'backlog');
    ensureDir(backlogDir);

    // Create multiple tasks
    ['TASK-101', 'TASK-102', 'TASK-103'].forEach((id) => {
      fs.writeFileSync(path.join(backlogDir, `${id}.md`), `---\nid: ${id}\n---`);
    });

    const files = fs.readdirSync(backlogDir).filter((f) => f.endsWith('.md'));
    expect(files).toHaveLength(3);
    expect(files).toContain('TASK-101.md');
    expect(files).toContain('TASK-102.md');
    expect(files).toContain('TASK-103.md');
  });

  test('should search tasks by content', () => {
    const { ensureDir } = require('../cli/utils');
    const backlogDir = path.join(TASKS_DIR, 'backlog');
    ensureDir(backlogDir);

    fs.writeFileSync(
      path.join(backlogDir, 'TASK-201.md'),
      '---\ntitle: Bug Fix\n---\n\nFix authentication bug'
    );
    fs.writeFileSync(
      path.join(backlogDir, 'TASK-202.md'),
      '---\ntitle: Feature\n---\n\nAdd new dashboard'
    );

    const files = fs.readdirSync(backlogDir);
    const matchingTasks = files.filter((file) => {
      const content = fs.readFileSync(path.join(backlogDir, file), 'utf-8');
      return content.includes('bug');
    });

    expect(matchingTasks).toHaveLength(1);
    expect(matchingTasks[0]).toBe('TASK-201.md');
  });

  test('should parse task frontmatter correctly', () => {
    const { parseFrontmatter } = require('../cli/utils');

    const taskContent = `---
id: TASK-999
title: Test Parse
status: active
priority: high
tags: [bug, urgent]
estimated: 5h
---

# Content here`;

    const frontmatter = parseFrontmatter(taskContent);
    expect(frontmatter.id).toBe('TASK-999');
    expect(frontmatter.title).toBe('Test Parse');
    expect(frontmatter.status).toBe('active');
    expect(frontmatter.priority).toBe('high');
  });
});
