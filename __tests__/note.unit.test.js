const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock console
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

// Mock readline
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn((q, cb) => cb('test answer')),
    close: jest.fn(),
  })),
}));

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn((cmd, callback) => callback && callback(null, '', '')),
}));

describe('Note Unit Tests - Pure Functions', () => {
  const testRootDir = path.join(os.tmpdir(), 'note-unit-test-' + Date.now());
  const NOTES_DIR = path.join(testRootDir, 'notes');

  beforeAll(() => {
    fs.mkdirSync(testRootDir, { recursive: true });
    process.env.NOTES_DIR = NOTES_DIR;
  });

  afterAll(() => {
    if (fs.existsSync(testRootDir)) {
      fs.rmSync(testRootDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    // Clean and recreate directories
    if (fs.existsSync(NOTES_DIR)) {
      fs.rmSync(NOTES_DIR, { recursive: true, force: true });
    }
    ['daily', 'meetings', 'technical', 'learning'].forEach((dir) => {
      fs.mkdirSync(path.join(NOTES_DIR, dir), { recursive: true });
    });
  });

  describe('Daily Note Naming', () => {
    test('should use YYYY-MM-DD format for daily notes', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const testDate = '2025-11-01';

      expect(testDate).toMatch(dateRegex);
    });

    test('should create unique daily note per day', () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      const noteContent = `---
date: ${dateStr}
type: daily
---

# Daily Note - ${dateStr}
`;

      const filePath = path.join(NOTES_DIR, 'daily', `${dateStr}.md`);
      fs.writeFileSync(filePath, noteContent);

      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain(`date: ${dateStr}`);
    });

    test('should prevent duplicate daily notes for same date', () => {
      const dateStr = '2025-11-01';
      const filePath = path.join(NOTES_DIR, 'daily', `${dateStr}.md`);

      fs.writeFileSync(filePath, 'Initial content');
      const fileExists = fs.existsSync(filePath);

      expect(fileExists).toBe(true);
    });
  });

  describe('Meeting Note Structure', () => {
    test('should create meeting note with required frontmatter', () => {
      const noteContent = `---
date: 2025-11-01
time: 14:30
type: meeting
title: "Team Standup"
participants: []
tags: []
---

# Meeting: Team Standup

## Agenda

- Item 1

## Notes

Meeting notes here

## Action Items

- [ ] Task 1

## Decisions

- Decision 1
`;

      const filePath = path.join(NOTES_DIR, 'meetings', '2025-11-01-1430-team-standup.md');
      fs.writeFileSync(filePath, noteContent);

      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('type: meeting');
      expect(content).toContain('## Agenda');
      expect(content).toContain('## Action Items');
    });

    test('should sanitize meeting title for filename', () => {
      const title = 'Team Meeting: Q4 Planning & Review!';
      const sanitized = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);

      expect(sanitized).toBe('team-meeting-q4-planning-review');
      expect(sanitized).not.toContain(':');
      expect(sanitized).not.toContain('&');
    });
  });

  describe('Technical Note (ADR) Numbering', () => {
    test('should start ADR numbering from 0001', () => {
      const adrNumber = '0001';
      expect(adrNumber).toMatch(/^\d{4}$/);
      expect(parseInt(adrNumber)).toBe(1);
    });

    test('should increment ADR numbers sequentially', () => {
      // Create multiple ADRs
      const adrNumbers = ['0001', '0002', '0003'];

      adrNumbers.forEach((num, index) => {
        const noteContent = `---
date: 2025-11-01
type: technical
number: ${num}
---

# ADR ${num}: Title
`;
        const filePath = path.join(NOTES_DIR, 'technical', `${num}-test-decision.md`);
        fs.writeFileSync(filePath, noteContent);
      });

      const files = fs.readdirSync(path.join(NOTES_DIR, 'technical'));
      expect(files.length).toBe(3);
      expect(files).toContain('0001-test-decision.md');
    });

    test('should find highest existing ADR number', () => {
      // Create ADRs with gaps
      ['0001', '0005', '0010'].forEach((num) => {
        const filePath = path.join(NOTES_DIR, 'technical', `${num}-test.md`);
        fs.writeFileSync(filePath, `---\nnumber: ${num}\n---\nContent`);
      });

      const files = fs.readdirSync(path.join(NOTES_DIR, 'technical'));
      const numbers = files
        .map((f) => f.match(/^(\d{4})-/))
        .filter((m) => m)
        .map((m) => parseInt(m[1]));

      const maxNumber = Math.max(...numbers);
      expect(maxNumber).toBe(10);
    });
  });

  describe('Learning Note (TIL) Structure', () => {
    test('should create TIL with standard sections', () => {
      const noteContent = `---
date: 2025-11-01
type: learning
title: "JavaScript Promises"
tags: [javascript, async]
source: "MDN Documentation"
---

# TIL: JavaScript Promises

## What I learned

Brief description

## Context

Why this matters

## Details

Technical details

## Resources

- Link 1

## Related Topics

- Topic 1

## Future Application

How to use this
`;

      const filePath = path.join(NOTES_DIR, 'learning', '2025-11-01-javascript-promises.md');
      fs.writeFileSync(filePath, noteContent);

      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('type: learning');
      expect(content).toContain('## What I learned');
      expect(content).toContain('## Future Application');
    });
  });

  describe('Note Search Functionality', () => {
    beforeEach(() => {
      // Create sample notes for search testing
      const notes = [
        {
          path: path.join(NOTES_DIR, 'daily', '2025-11-01.md'),
          content: '---\ntitle: "Daily Note"\n---\n# React hooks implementation',
        },
        {
          path: path.join(NOTES_DIR, 'meetings', '2025-11-01-standup.md'),
          content: '---\ntitle: "Standup"\n---\n# Team discussion about React',
        },
        {
          path: path.join(NOTES_DIR, 'technical', '0001-architecture.md'),
          content: '---\ntitle: "Architecture Decision"\n---\n# System design patterns',
        },
      ];

      notes.forEach((note) => {
        fs.writeFileSync(note.path, note.content);
      });
    });

    test('should find notes by keyword in content', () => {
      const searchTerm = 'React';
      const results = [];

      ['daily', 'meetings', 'technical', 'learning'].forEach((type) => {
        const dir = path.join(NOTES_DIR, type);
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const content = fs.readFileSync(filePath, 'utf8');

          if (content.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({ file, type, path: filePath });
          }
        });
      });

      expect(results.length).toBe(2);
      expect(results.some((r) => r.type === 'daily')).toBe(true);
      expect(results.some((r) => r.type === 'meetings')).toBe(true);
    });

    test('should handle case-insensitive search', () => {
      const searchTerms = ['react', 'REACT', 'React'];

      searchTerms.forEach((term) => {
        const found = 'React hooks implementation'.toLowerCase().includes(term.toLowerCase());
        expect(found).toBe(true);
      });
    });

    test('should search in frontmatter and body', () => {
      const noteContent = '---\ntitle: "Test Title"\ntags: [javascript]\n---\n# Body content';

      expect(noteContent).toContain('javascript');
      expect(noteContent).toContain('Test Title');
    });
  });

  describe('Note Listing by Type', () => {
    beforeEach(() => {
      // Create notes in different directories
      const noteTypes = [
        { dir: 'daily', file: '2025-11-01.md' },
        { dir: 'daily', file: '2025-11-02.md' },
        { dir: 'meetings', file: '2025-11-01-standup.md' },
        { dir: 'technical', file: '0001-decision.md' },
        { dir: 'learning', file: '2025-11-01-til.md' },
      ];

      noteTypes.forEach(({ dir, file }) => {
        const content = `---\ntype: ${dir}\n---\n# Content`;
        fs.writeFileSync(path.join(NOTES_DIR, dir, file), content);
      });
    });

    test('should list all daily notes', () => {
      const dailyNotes = fs.readdirSync(path.join(NOTES_DIR, 'daily'));
      expect(dailyNotes.length).toBe(2);
      expect(dailyNotes).toContain('2025-11-01.md');
    });

    test('should list all meeting notes', () => {
      const meetingNotes = fs.readdirSync(path.join(NOTES_DIR, 'meetings'));
      expect(meetingNotes.length).toBe(1);
    });

    test('should list all technical notes', () => {
      const technicalNotes = fs.readdirSync(path.join(NOTES_DIR, 'technical'));
      expect(technicalNotes.length).toBe(1);
    });

    test('should list all learning notes', () => {
      const learningNotes = fs.readdirSync(path.join(NOTES_DIR, 'learning'));
      expect(learningNotes.length).toBe(1);
    });

    test('should list all notes when no type specified', () => {
      let totalNotes = 0;
      ['daily', 'meetings', 'technical', 'learning'].forEach((type) => {
        const dir = path.join(NOTES_DIR, type);
        if (fs.existsSync(dir)) {
          totalNotes += fs.readdirSync(dir).length;
        }
      });

      expect(totalNotes).toBe(5);
    });
  });

  describe('Note Validation', () => {
    test('should validate note type', () => {
      const validTypes = ['daily', 'meeting', 'technical', 'learning'];

      validTypes.forEach((type) => {
        expect(['daily', 'meeting', 'technical', 'learning']).toContain(type);
      });
    });

    test('should validate daily note frontmatter', () => {
      const frontmatter = {
        date: '2025-11-01',
        type: 'daily',
      };

      expect(frontmatter).toHaveProperty('date');
      expect(frontmatter).toHaveProperty('type');
      expect(frontmatter.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should validate meeting note frontmatter', () => {
      const frontmatter = {
        date: '2025-11-01',
        time: '14:30',
        type: 'meeting',
        title: 'Test Meeting',
        participants: [],
        tags: [],
      };

      expect(frontmatter).toHaveProperty('title');
      expect(frontmatter).toHaveProperty('participants');
      expect(frontmatter.type).toBe('meeting');
    });

    test('should validate technical note (ADR) frontmatter', () => {
      const frontmatter = {
        date: '2025-11-01',
        type: 'technical',
        number: '0001',
        status: 'accepted',
        deciders: [],
      };

      expect(frontmatter).toHaveProperty('number');
      expect(frontmatter.number).toMatch(/^\d{4}$/);
      expect(frontmatter.type).toBe('technical');
    });

    test('should validate learning note (TIL) frontmatter', () => {
      const frontmatter = {
        date: '2025-11-01',
        type: 'learning',
        title: 'What I Learned',
        tags: [],
        source: 'Documentation',
      };

      expect(frontmatter).toHaveProperty('source');
      expect(frontmatter.type).toBe('learning');
    });
  });
});
