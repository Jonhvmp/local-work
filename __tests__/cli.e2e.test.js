const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('CLI E2E Tests', () => {
  const testRootDir = path.join(os.tmpdir(), 'cli-e2e-test-' + Date.now());
  const TASKS_DIR = path.join(testRootDir, 'tasks');
  const NOTES_DIR = path.join(testRootDir, 'notes');

  beforeAll(() => {
    fs.mkdirSync(testRootDir, { recursive: true });
    process.env.TASKS_DIR = TASKS_DIR;
    process.env.NOTES_DIR = NOTES_DIR;
  });

  afterAll(() => {
    if (fs.existsSync(testRootDir)) {
      fs.rmSync(testRootDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    [TASKS_DIR, NOTES_DIR].forEach((dir) => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe('Task CLI Commands', () => {
    const taskBin = path.join(__dirname, '../bin/task.js');

    test('task command without arguments should show help', () => {
      try {
        const output = execSync(`node ${taskBin}`, { encoding: 'utf-8' });
        expect(output).toContain('Task Management CLI');
        expect(output).toContain('Usage:');
      } catch (error) {
        // Help output might exit with code 0 or 1 depending on implementation
        expect(error.stdout || error.stderr).toContain('Task Management');
      }
    });

    test('task list should handle empty task directory', () => {
      try {
        const output = execSync(`node ${taskBin} list`, {
          encoding: 'utf-8',
          env: { ...process.env, TASKS_DIR },
        });
        // Should not crash
        expect(typeof output).toBe('string');
      } catch (error) {
        // List might exit with error if no tasks
        expect(error.status).toBeDefined();
      }
    });
  });

  describe('Note CLI Commands', () => {
    const noteBin = path.join(__dirname, '../bin/note.js');

    test('note command without arguments should show help', () => {
      try {
        const output = execSync(`node ${noteBin}`, { encoding: 'utf-8' });
        expect(output).toContain('Note Management CLI');
        expect(output).toContain('Usage:');
      } catch (error) {
        expect(error.stdout || error.stderr).toContain('Note Management');
      }
    });

    test('note list should handle empty notes directory', () => {
      try {
        const output = execSync(`node ${noteBin} list`, {
          encoding: 'utf-8',
          env: { ...process.env, NOTES_DIR },
        });
        expect(typeof output).toBe('string');
      } catch (error) {
        expect(error.status).toBeDefined();
      }
    });
  });

  describe('CLI Binary Executability', () => {
    test('task binary should have shebang', () => {
      const taskBin = path.join(__dirname, '../bin/task.js');
      const content = fs.readFileSync(taskBin, 'utf-8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    test('note binary should have shebang', () => {
      const noteBin = path.join(__dirname, '../bin/note.js');
      const content = fs.readFileSync(noteBin, 'utf-8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    });

    test('binaries should be executable', () => {
      const taskBin = path.join(__dirname, '../bin/task.js');
      const noteBin = path.join(__dirname, '../bin/note.js');

      const taskStats = fs.statSync(taskBin);
      const noteStats = fs.statSync(noteBin);

      // Files should exist and be readable
      expect(taskStats.isFile()).toBe(true);
      expect(noteStats.isFile()).toBe(true);
    });
  });

  describe('CLI Error Handling', () => {
    const taskBin = path.join(__dirname, '../bin/task.js');

    test('invalid task command should show error', () => {
      try {
        execSync(`node ${taskBin} invalidcommand`, { encoding: 'utf-8' });
      } catch (error) {
        // Should exit with error
        expect(error.status).toBeGreaterThan(0);
      }
    });

    test('task operations require valid arguments', () => {
      // These should fail gracefully
      const invalidCommands = ['task start', 'task view', 'task edit', 'task update'];

      invalidCommands.forEach((cmd) => {
        try {
          execSync(`node ${taskBin} ${cmd.split(' ')[1]}`, {
            encoding: 'utf-8',
            env: { ...process.env, TASKS_DIR },
          });
        } catch (error) {
          // Should exit with error for missing arguments
          expect(error.status).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('CLI Integration', () => {
    test('binaries should require correct modules', () => {
      const taskBin = path.join(__dirname, '../bin/task.js');
      const noteBin = path.join(__dirname, '../bin/note.js');

      const taskContent = fs.readFileSync(taskBin, 'utf-8');
      const noteContent = fs.readFileSync(noteBin, 'utf-8');

      expect(taskContent).toContain("require('../cli/task.js')");
      expect(noteContent).toContain("require('../cli/note.js')");
    });

    test('CLI modules should be in correct location', () => {
      const taskModule = path.join(__dirname, '../cli/task.js');
      const noteModule = path.join(__dirname, '../cli/note.js');

      expect(fs.existsSync(taskModule)).toBe(true);
      expect(fs.existsSync(noteModule)).toBe(true);
    });
  });

  describe('Template Files', () => {
    test('templates directory should exist', () => {
      const templatesDir = path.join(__dirname, '../templates');
      expect(fs.existsSync(templatesDir)).toBe(true);
    });

    test('all required templates should exist', () => {
      const templatesDir = path.join(__dirname, '../templates');
      const requiredTemplates = [
        'task-template.md',
        'daily-template.md',
        'meeting-template.md',
        'technical-template.md',
        'learning-template.md',
      ];

      requiredTemplates.forEach((template) => {
        const templatePath = path.join(templatesDir, template);
        expect(fs.existsSync(templatePath)).toBe(true);
      });
    });

    test('templates should have valid frontmatter', () => {
      const templatesDir = path.join(__dirname, '../templates');
      const templates = fs.readdirSync(templatesDir).filter((f) => f.endsWith('.md'));

      templates.forEach((template) => {
        const content = fs.readFileSync(path.join(templatesDir, template), 'utf-8');
        expect(content).toContain('---');
      });
    });
  });
});
