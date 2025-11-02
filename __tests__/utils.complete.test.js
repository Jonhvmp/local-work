const {
  colorize,
  success,
  error,
  warning,
  info,
  dim,
  bold,
  getStatusColor,
  getPriorityColor,
  formatDate,
  parseTime,
  formatTime,
  ensureDir,
  getCurrentDate,
  getCurrentTime,
  getCurrentDateTime,
  parseFrontmatter,
  updateFrontmatter,
  formatTable,
  progressBar,
} = require('../cli/utils');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Complete Utils Coverage', () => {
  describe('Additional Color Functions', () => {
    test('dim should return dimmed text', () => {
      const result = dim('Dimmed text');
      expect(result).toContain('Dimmed text');
      expect(result).toContain('\x1b[');
    });

    test('bold should return bold text', () => {
      const result = bold('Bold text');
      expect(result).toContain('Bold text');
      expect(result).toContain('\x1b[');
    });

    test('getStatusColor returns correct colors', () => {
      expect(getStatusColor('backlog')).toBe('blue');
      expect(getStatusColor('active')).toBe('yellow');
      expect(getStatusColor('completed')).toBe('green');
      expect(getStatusColor('archived')).toBe('gray');
      expect(getStatusColor('unknown')).toBe('white');
    });

    test('getPriorityColor returns correct colors', () => {
      expect(getPriorityColor('low')).toBe('gray');
      expect(getPriorityColor('medium')).toBe('yellow');
      expect(getPriorityColor('high')).toBe('red');
      expect(getPriorityColor('unknown')).toBe('white');
    });
  });

  describe('Date/Time Functions', () => {
    test('getCurrentDate should return YYYY-MM-DD format', () => {
      const result = getCurrentDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('getCurrentTime should return HH:MM format', () => {
      const result = getCurrentTime();
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    test('getCurrentDateTime should return ISO format', () => {
      const result = getCurrentDateTime();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test('formatDate handles today', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = formatDate(today);
      // formatDate compares dates, might return 'today' or 'yesterday' depending on timezone
      expect(['today', 'yesterday', '1 days ago']).toContain(result);
    });

    test('formatDate handles multiple days ago', () => {
      const oldDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const result = formatDate(oldDate);
      expect(result).toContain('days ago');
    });
  });

  describe('File System Functions', () => {
    const testDir = path.join(os.tmpdir(), 'utils-test-' + Date.now());

    afterEach(() => {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    test('ensureDir should create directory if not exists', () => {
      const newDir = path.join(testDir, 'nested', 'dir');
      ensureDir(newDir);
      expect(fs.existsSync(newDir)).toBe(true);
    });

    test('ensureDir should not fail if directory exists', () => {
      ensureDir(testDir);
      ensureDir(testDir);
      expect(fs.existsSync(testDir)).toBe(true);
    });

    test('ensureDir should handle nested paths', () => {
      const nestedPath = path.join(testDir, 'a', 'b', 'c', 'd');
      ensureDir(nestedPath);
      expect(fs.existsSync(nestedPath)).toBe(true);
    });
  });

  describe('Frontmatter Functions', () => {
    const sampleContent = `---
title: Test Task
status: backlog
priority: high
created: 2024-01-15
---

# Task Content

This is the task description.`;

    test('parseFrontmatter should extract frontmatter object', () => {
      const result = parseFrontmatter(sampleContent);
      expect(result.title).toBe('Test Task');
      expect(result.status).toBe('backlog');
      expect(result.priority).toBe('high');
      expect(result.created).toBe('2024-01-15');
    });

    test('parseFrontmatter should handle missing frontmatter', () => {
      const result = parseFrontmatter('# No frontmatter here');
      expect(result).toEqual({});
    });

    test('parseFrontmatter should handle empty content', () => {
      const result = parseFrontmatter('');
      expect(result).toEqual({});
    });

    test('updateFrontmatter should update existing field', () => {
      const result = updateFrontmatter(sampleContent, 'status', 'active');
      expect(result).toContain('status: active');
      expect(result).not.toContain('status: backlog');
    });

    test('updateFrontmatter should add new field', () => {
      const result = updateFrontmatter(sampleContent, 'assignee', 'John Doe');
      expect(result).toContain('assignee: John Doe');
    });

    test('updateFrontmatter should handle array values', () => {
      const result = updateFrontmatter(sampleContent, 'tags', ['bug', 'urgent']);
      expect(result).toContain('tags: [bug, urgent]');
    });

    test('updateFrontmatter should handle numeric values', () => {
      const result = updateFrontmatter(sampleContent, 'estimation', 5);
      expect(result).toContain('estimation: 5');
    });
  });

  describe('Table Formatting', () => {
    test('formatTable should create formatted table', () => {
      const headers = ['ID', 'Title', 'Status'];
      const rows = [
        ['TASK-001', 'Fix bug', 'active'],
        ['TASK-002', 'Add feature', 'backlog'],
      ];
      const result = formatTable(headers, rows);
      expect(result).toContain('ID');
      expect(result).toContain('Title');
      expect(result).toContain('Status');
      expect(result).toContain('TASK-001');
      expect(result).toContain('Fix bug');
      expect(result).toContain('active');
    });

    test('formatTable should handle empty rows', () => {
      const headers = ['Col1', 'Col2', 'Col3'];
      const rows = [];
      const result = formatTable(headers, rows);
      expect(result).toContain('Col1');
      expect(result).toContain('Col2');
      expect(result).toContain('Col3');
    });

    test('formatTable should strip ANSI codes for width calculation', () => {
      const headers = ['Name', 'Status'];
      const rows = [['\x1b[32mGreen Text\x1b[0m', '\x1b[33mYellow\x1b[0m']];
      const result = formatTable(headers, rows);
      expect(result).toContain('Green Text');
      expect(result).toContain('Yellow');
    });

    test('formatTable should handle varying cell widths', () => {
      const headers = ['Short', 'Very Long Header Name'];
      const rows = [
        ['A', 'B'],
        ['Long content here', 'X'],
      ];
      const result = formatTable(headers, rows);
      expect(result).toContain('Short');
      expect(result).toContain('Very Long Header Name');
    });

    test('formatTable should include separators', () => {
      const headers = ['A', 'B'];
      const rows = [['1', '2']];
      const result = formatTable(headers, rows);
      expect(result).toContain('─');
      expect(result).toContain('│');
    });
  });

  describe('Progress Bar', () => {
    test('progressBar should show 0% progress', () => {
      const result = progressBar(0, 100, 20);
      expect(result).toContain('0%');
      expect(result).toContain('░');
    });

    test('progressBar should show 50% progress', () => {
      const result = progressBar(50, 100, 20);
      expect(result).toContain('50%');
      expect(result).toContain('█');
      expect(result).toContain('░');
    });

    test('progressBar should show 100% progress', () => {
      const result = progressBar(100, 100, 20);
      expect(result).toContain('100%');
      expect(result).toContain('█');
    });

    test('progressBar should handle custom width', () => {
      const result = progressBar(25, 100, 10);
      expect(result).toContain('25%');
      expect(typeof result).toBe('string');
    });

    test('progressBar should handle partial progress', () => {
      const result = progressBar(33, 100);
      expect(result).toContain('33%');
    });
  });
});
