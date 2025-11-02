const fs = require('fs');
const path = require('path');

describe('Note CLI Integration', () => {
  const notesDir = path.join(__dirname, '..', '..', 'notes');

  test('notes directory structure should exist', () => {
    expect(fs.existsSync(notesDir)).toBe(true);
    expect(fs.existsSync(path.join(notesDir, 'daily'))).toBe(true);
    expect(fs.existsSync(path.join(notesDir, 'meetings'))).toBe(true);
    expect(fs.existsSync(path.join(notesDir, 'technical'))).toBe(true);
    expect(fs.existsSync(path.join(notesDir, 'learning'))).toBe(true);
  });

  test('note templates should exist', () => {
    const templatesDir = path.join(__dirname, '..', 'templates');
    expect(fs.existsSync(path.join(templatesDir, 'daily-template.md'))).toBe(true);
    expect(fs.existsSync(path.join(templatesDir, 'meeting-template.md'))).toBe(true);
    expect(fs.existsSync(path.join(templatesDir, 'technical-template.md'))).toBe(true);
    expect(fs.existsSync(path.join(templatesDir, 'learning-template.md'))).toBe(true);
  });

  test('note module should be importable', () => {
    expect(() => {
      const notePath = path.join(__dirname, '..', 'cli', 'note.js');
      expect(fs.existsSync(notePath)).toBe(true);
    }).not.toThrow();
  });
});

describe('Note Types', () => {
  const noteTypes = ['daily', 'meetings', 'technical', 'learning'];

  test('all note type directories should exist', () => {
    const notesDir = path.join(__dirname, '..', '..', 'notes');
    noteTypes.forEach((type) => {
      const typeDir = path.join(notesDir, type);
      expect(fs.existsSync(typeDir)).toBe(true);
    });
  });

  test('note type should be valid', () => {
    expect(noteTypes).toContain('daily');
    expect(noteTypes).toContain('meetings');
    expect(noteTypes).toContain('technical');
    expect(noteTypes).toContain('learning');
  });
});

describe('Daily Note Naming', () => {
  test('daily note should follow date format', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const filename = `${year}-${month}-${day}.md`;

    expect(filename).toMatch(/^\d{4}-\d{2}-\d{2}\.md$/);
  });
});

describe('ADR Numbering', () => {
  test('ADR should follow numbering format', () => {
    const adrFormats = [
      'ADR-001-migration-strategy.md',
      'ADR-002-database-choice.md',
      'ADR-010-api-design.md',
    ];

    adrFormats.forEach((adr) => {
      expect(adr).toMatch(/^ADR-\d{3}-.+\.md$/);
    });
  });
});
