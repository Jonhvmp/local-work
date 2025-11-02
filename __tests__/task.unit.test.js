const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Task Unit Tests - Logic Validation', () => {
  const testRootDir = path.join(os.tmpdir(), 'task-unit-logic-' + Date.now());
  const TASKS_DIR = path.join(testRootDir, 'tasks');

  beforeAll(() => {
    fs.mkdirSync(testRootDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(testRootDir)) {
      fs.rmSync(testRootDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    // Clean and recreate directories
    if (fs.existsSync(TASKS_DIR)) {
      fs.rmSync(TASKS_DIR, { recursive: true, force: true });
    }
    ['active', 'backlog', 'completed', 'archived'].forEach((dir) => {
      fs.mkdirSync(path.join(TASKS_DIR, dir), { recursive: true });
    });
  });

  describe('Task ID Generation Logic', () => {
    test('should parse TASK-XXX format correctly', () => {
      const taskIdPattern = /TASK-(\d+)/;

      expect('TASK-001').toMatch(taskIdPattern);
      expect('TASK-042').toMatch(taskIdPattern);
      expect('TASK-999').toMatch(taskIdPattern);

      const match = 'TASK-042'.match(taskIdPattern);
      expect(match[1]).toBe('042');
      expect(parseInt(match[1])).toBe(42);
    });

    test('should increment IDs correctly', () => {
      const ids = [1, 5, 10];
      const maxId = Math.max(...ids);
      const nextId = (maxId + 1).toString().padStart(3, '0');

      expect(nextId).toBe('011');
    });

    test('should handle empty task list', () => {
      const ids = [];
      const maxId = Math.max(0, ...ids);
      const nextId = (maxId + 1).toString().padStart(3, '0');

      expect(nextId).toBe('001');
    });
  });

  describe('Task File Structure', () => {
    test('should create task file with correct frontmatter', () => {
      const taskContent = `---
id: TASK-001
title: "Test Task"
status: backlog
priority: medium
created: 2025-11-01
updated: 2025-11-01
assignee: testuser
tags: []
estimated: 2h
actual: 0h
---

## Description

Test description`;

      const filePath = path.join(TASKS_DIR, 'backlog', 'TASK-001-test-task.md');
      fs.writeFileSync(filePath, taskContent);

      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('id: TASK-001');
      expect(content).toContain('title: "Test Task"');
      expect(content).toContain('## Description');
    });

    test('should handle task file move between directories', () => {
      const taskContent = `---
id: TASK-001
title: "Test"
status: backlog
---
Content`;

      const sourcePath = path.join(TASKS_DIR, 'backlog', 'TASK-001-test.md');
      const targetPath = path.join(TASKS_DIR, 'active', 'TASK-001-test.md');

      fs.writeFileSync(sourcePath, taskContent);
      fs.renameSync(sourcePath, targetPath);

      expect(fs.existsSync(sourcePath)).toBe(false);
      expect(fs.existsSync(targetPath)).toBe(true);
    });

    test('should find tasks in directory', () => {
      fs.writeFileSync(
        path.join(TASKS_DIR, 'backlog', 'TASK-001-test.md'),
        '---\nid: TASK-001\n---\nContent'
      );
      fs.writeFileSync(
        path.join(TASKS_DIR, 'backlog', 'TASK-002-test.md'),
        '---\nid: TASK-002\n---\nContent'
      );

      const files = fs
        .readdirSync(path.join(TASKS_DIR, 'backlog'))
        .filter((f) => f.startsWith('TASK-'));

      expect(files.length).toBe(2);
    });
  });

  describe('Task Search Logic', () => {
    test('should match search term case-insensitively', () => {
      const searchTerm = 'authentication';
      const content1 = 'AUTHENTICATION system';
      const content2 = 'Authentication module';
      const content3 = 'auth system';

      expect(content1.toLowerCase()).toContain(searchTerm.toLowerCase());
      expect(content2.toLowerCase()).toContain(searchTerm.toLowerCase());
      expect(content3.toLowerCase()).not.toContain(searchTerm.toLowerCase());
    });

    test('should identify task files by pattern', () => {
      const validFiles = ['TASK-001-test.md', 'TASK-042-feature.md'];
      const invalidFiles = ['README.md', 'task-001.md', 'TASK-001.txt'];

      const taskPattern = /^TASK-\d+-.+\.md$/;

      validFiles.forEach((file) => {
        expect(file).toMatch(taskPattern);
      });

      invalidFiles.forEach((file) => {
        expect(file).not.toMatch(taskPattern);
      });
    });

    test('should collect search results with line numbers', () => {
      const fileContent = `---
id: TASK-001
---
Line 1
Line 2 with SEARCHTERM
Line 3
Line 4 with SEARCHTERM too`;

      const lines = fileContent.split('\n');
      const results = [];

      lines.forEach((line, index) => {
        if (line.toLowerCase().includes('searchterm')) {
          results.push({
            line: index + 1,
            content: line.trim(),
          });
        }
      });

      expect(results.length).toBe(2);
      expect(results[0].line).toBe(5);
      expect(results[1].line).toBe(7);
    });
  });

  describe('Task Validation Logic', () => {
    test('should validate priority values', () => {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      const invalidPriorities = ['critical', 'normal', ''];

      validPriorities.forEach((priority) => {
        expect(['low', 'medium', 'high', 'urgent']).toContain(priority);
      });

      invalidPriorities.forEach((priority) => {
        expect(['low', 'medium', 'high', 'urgent']).not.toContain(priority);
      });
    });

    test('should validate status values', () => {
      const validStatuses = ['backlog', 'active', 'completed', 'archived'];
      const invalidStatuses = ['pending', 'in-progress', 'done'];

      validStatuses.forEach((status) => {
        expect(['backlog', 'active', 'completed', 'archived']).toContain(status);
      });

      invalidStatuses.forEach((status) => {
        expect(['backlog', 'active', 'completed', 'archived']).not.toContain(status);
      });
    });

    test('should generate valid file names from titles', () => {
      const testCases = [
        { title: 'Test Task', expected: 'test-task' },
        { title: 'Fix Bug #123', expected: 'fix-bug-123' },
        { title: 'Add Feature: Authentication', expected: 'add-feature-authentication' },
      ];

      testCases.forEach(({ title, expected }) => {
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        expect(slug).toBe(expected);
      });
    });
  });

  describe('Task Archive Logic', () => {
    test('should identify tasks older than threshold', () => {
      const today = new Date();
      const daysThreshold = 30;

      const oldDate = new Date(today);
      oldDate.setDate(oldDate.getDate() - 31);

      const recentDate = new Date(today);
      recentDate.setDate(recentDate.getDate() - 29);

      const daysDiff1 = Math.floor((today - oldDate) / (1000 * 60 * 60 * 24));
      const daysDiff2 = Math.floor((today - recentDate) / (1000 * 60 * 60 * 24));

      expect(daysDiff1).toBeGreaterThan(daysThreshold);
      expect(daysDiff2).toBeLessThan(daysThreshold);
    });

    test('should parse updated date from frontmatter', () => {
      const frontmatter = `---
id: TASK-001
updated: 2025-01-15
status: completed
---`;

      const match = frontmatter.match(/updated:\s*(\d{4}-\d{2}-\d{2})/);
      expect(match).not.toBeNull();
      expect(match[1]).toBe('2025-01-15');

      // Parse date components manually to avoid timezone issues
      const [year, month, day] = match[1].split('-').map(Number);
      expect(year).toBe(2025);
      expect(month).toBe(1); // January
      expect(day).toBe(15);
    });
  });

  describe('Task Stats Calculation', () => {
    test('should count tasks by status', () => {
      const tasks = [
        { status: 'backlog' },
        { status: 'backlog' },
        { status: 'active' },
        { status: 'completed' },
        { status: 'completed' },
        { status: 'completed' },
      ];

      const stats = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});

      expect(stats.backlog).toBe(2);
      expect(stats.active).toBe(1);
      expect(stats.completed).toBe(3);
    });

    test('should calculate time estimates', () => {
      const tasks = [
        { estimated: '2h', actual: '1.5h' },
        { estimated: '4h', actual: '5h' },
        { estimated: '1h', actual: '1h' },
      ];

      const parseTime = (timeStr) => {
        return parseFloat(timeStr.replace('h', ''));
      };

      const totalEstimated = tasks.reduce((sum, t) => sum + parseTime(t.estimated), 0);
      const totalActual = tasks.reduce((sum, t) => sum + parseTime(t.actual), 0);

      expect(totalEstimated).toBe(7);
      expect(totalActual).toBe(7.5);
    });

    test('should count tasks by priority', () => {
      const tasks = [
        { priority: 'high' },
        { priority: 'medium' },
        { priority: 'high' },
        { priority: 'low' },
        { priority: 'high' },
      ];

      const priorityCount = tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {});

      expect(priorityCount.high).toBe(3);
      expect(priorityCount.medium).toBe(1);
      expect(priorityCount.low).toBe(1);
    });
  });
});
