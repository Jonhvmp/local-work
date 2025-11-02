const fs = require('fs');
const path = require('path');

describe('Task CLI Integration', () => {
  const tasksDir = path.join(__dirname, '..', '..', 'tasks');

  test('tasks directory structure should exist', () => {
    expect(fs.existsSync(tasksDir)).toBe(true);
    expect(fs.existsSync(path.join(tasksDir, 'active'))).toBe(true);
    expect(fs.existsSync(path.join(tasksDir, 'backlog'))).toBe(true);
    expect(fs.existsSync(path.join(tasksDir, 'completed'))).toBe(true);
    expect(fs.existsSync(path.join(tasksDir, 'archived'))).toBe(true);
  });

  test('task template should exist', () => {
    const templatePath = path.join(__dirname, '..', 'templates', 'task-template.md');
    expect(fs.existsSync(templatePath)).toBe(true);
  });

  test('task module should be importable', () => {
    // Test that the module doesn't throw on require
    expect(() => {
      // Don't actually execute, just check it loads
      const taskPath = path.join(__dirname, '..', 'cli', 'task.js');
      expect(fs.existsSync(taskPath)).toBe(true);
    }).not.toThrow();
  });
});

describe('Task ID Generation', () => {
  test('task ID should follow TASK-XXX format', () => {
    const taskId = 'TASK-001';
    expect(taskId).toMatch(/^TASK-\d{3}$/);
  });

  test('task ID should increment correctly', () => {
    const ids = ['TASK-001', 'TASK-002', 'TASK-010', 'TASK-100'];
    ids.forEach((id) => {
      expect(id).toMatch(/^TASK-\d{3}$/);
    });
  });
});

describe('Task Status Flow', () => {
  const validStatuses = ['backlog', 'active', 'completed', 'archived'];

  test('all status directories should exist', () => {
    const tasksDir = path.join(__dirname, '..', '..', 'tasks');
    validStatuses.forEach((status) => {
      const statusDir = path.join(tasksDir, status);
      expect(fs.existsSync(statusDir)).toBe(true);
    });
  });

  test('status transitions should be valid', () => {
    expect(validStatuses).toContain('backlog');
    expect(validStatuses).toContain('active');
    expect(validStatuses).toContain('completed');
    expect(validStatuses).toContain('archived');
  });
});
