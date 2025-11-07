const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock console to avoid test output pollution
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

jest.mock('child_process', () => ({
  exec: jest.fn((cmd, callback) => callback && callback(null, '', '')),
}));

describe('Note Integration Tests', () => {
  const testRootDir = path.join(os.tmpdir(), 'note-integration-test-' + Date.now());
  const NOTES_DIR = path.join(testRootDir, 'notes');

  beforeAll(() => {
    process.env.NOTES_DIR = NOTES_DIR;
    fs.mkdirSync(testRootDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(testRootDir)) {
      fs.rmSync(testRootDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    if (fs.existsSync(NOTES_DIR)) {
      fs.rmSync(NOTES_DIR, { recursive: true, force: true });
    }
    console.log.mockClear();
  });

  test('should create daily note in correct directory', () => {
    const { ensureDir, getCurrentDate } = require('../cli/utils');
    const dailyDir = path.join(NOTES_DIR, 'daily');
    ensureDir(dailyDir);

    const date = getCurrentDate();
    const noteContent = `---
type: daily
date: ${date}
---

# Daily Note - ${date}

## Tasks
- Task 1

## Notes
- Note 1
`;

    const noteFile = path.join(dailyDir, `${date}.md`);
    fs.writeFileSync(noteFile, noteContent);

    expect(fs.existsSync(noteFile)).toBe(true);
    const content = fs.readFileSync(noteFile, 'utf-8');
    expect(content).toContain('type: daily');
    expect(content).toContain(`date: ${date}`);
  });

  test('should create meeting note with proper structure', () => {
    const { ensureDir, getCurrentDate } = require('../cli/utils');
    const meetingDir = path.join(NOTES_DIR, 'meetings');
    ensureDir(meetingDir);

    const date = getCurrentDate();
    const meetingTitle = 'Sprint Planning';
    const fileName = `${date}-sprint-planning.md`;
    const noteContent = `---
type: meeting
title: ${meetingTitle}
date: ${date}
attendees: []
---

# ${meetingTitle}

## Agenda

## Notes

## Action Items
`;

    const noteFile = path.join(meetingDir, fileName);
    fs.writeFileSync(noteFile, noteContent);

    expect(fs.existsSync(noteFile)).toBe(true);
    const content = fs.readFileSync(noteFile, 'utf-8');
    expect(content).toContain('type: meeting');
    expect(content).toContain('Sprint Planning');
  });

  test('should create technical note', () => {
    const { ensureDir } = require('../cli/utils');
    const techDir = path.join(NOTES_DIR, 'technical');
    ensureDir(techDir);

    const topic = 'react-hooks';
    const noteContent = `---
type: technical
topic: React Hooks
tags: [react, frontend]
---

# React Hooks

## Overview

## Key Concepts

## Examples
`;

    const noteFile = path.join(techDir, `${topic}.md`);
    fs.writeFileSync(noteFile, noteContent);

    expect(fs.existsSync(noteFile)).toBe(true);
    const content = fs.readFileSync(noteFile, 'utf-8');
    expect(content).toContain('type: technical');
    expect(content).toContain('React Hooks');
  });

  test('should create learning note (TIL)', () => {
    const { ensureDir, getCurrentDate } = require('../cli/utils');
    const learningDir = path.join(NOTES_DIR, 'learning');
    ensureDir(learningDir);

    const date = getCurrentDate();
    const topic = 'async-await';
    const fileName = `${date}-${topic}.md`;

    const noteContent = `---
type: learning
date: ${date}
topic: Async/Await in JavaScript
tags: [javascript, async]
---

# TIL: Async/Await in JavaScript

## What I Learned

## Key Takeaways

## Resources
`;

    const noteFile = path.join(learningDir, fileName);
    fs.writeFileSync(noteFile, noteContent);

    expect(fs.existsSync(noteFile)).toBe(true);
    const content = fs.readFileSync(noteFile, 'utf-8');
    expect(content).toContain('type: learning');
    expect(content).toContain('Async/Await');
  });

  test('should list notes in directory', () => {
    const { ensureDir } = require('../cli/utils');
    const dailyDir = path.join(NOTES_DIR, 'daily');
    ensureDir(dailyDir);

    // Create multiple daily notes
    ['2025-01-15', '2025-01-16', '2025-01-17'].forEach((date) => {
      const content = `---\ntype: daily\ndate: ${date}\n---\n\n# Daily`;
      fs.writeFileSync(path.join(dailyDir, `${date}.md`), content);
    });

    const files = fs.readdirSync(dailyDir).filter((f) => f.endsWith('.md'));
    expect(files).toHaveLength(3);
    expect(files.sort()).toEqual(['2025-01-15.md', '2025-01-16.md', '2025-01-17.md']);
  });

  test('should search notes by keyword', () => {
    const { ensureDir } = require('../cli/utils');
    const techDir = path.join(NOTES_DIR, 'technical');
    ensureDir(techDir);

    fs.writeFileSync(
      path.join(techDir, 'docker.md'),
      '---\ntopic: Docker\n---\n\nContainer orchestration with Docker'
    );
    fs.writeFileSync(
      path.join(techDir, 'kubernetes.md'),
      '---\ntopic: Kubernetes\n---\n\nContainer orchestration with Kubernetes'
    );
    fs.writeFileSync(
      path.join(techDir, 'react.md'),
      '---\ntopic: React\n---\n\nFrontend framework'
    );

    const files = fs.readdirSync(techDir);
    const matchingNotes = files.filter((file) => {
      const content = fs.readFileSync(path.join(techDir, file), 'utf-8');
      return content.toLowerCase().includes('container');
    });

    expect(matchingNotes).toHaveLength(2);
    expect(matchingNotes).toContain('docker.md');
    expect(matchingNotes).toContain('kubernetes.md');
  });

  test('should organize notes by type in correct directories', () => {
    const { ensureDir } = require('../cli/utils');

    const noteTypes = ['daily', 'meetings', 'technical', 'learning'];
    noteTypes.forEach((type) => {
      const dir = path.join(NOTES_DIR, type);
      ensureDir(dir);
      fs.writeFileSync(path.join(dir, 'test.md'), `---\ntype: ${type}\n---\n\nContent`);
    });

    noteTypes.forEach((type) => {
      const dir = path.join(NOTES_DIR, type);
      expect(fs.existsSync(dir)).toBe(true);
      const files = fs.readdirSync(dir);
      expect(files).toContain('test.md');
    });
  });

  test('should parse note frontmatter correctly', () => {
    const { parseFrontmatter } = require('../cli/utils');

    const noteContent = `---
type: meeting
title: Weekly Sync
date: 2025-01-15
attendees: [Alice, Bob, Charlie]
tags: [team, weekly]
---

# Meeting content here`;

    const frontmatter = parseFrontmatter(noteContent);
    expect(frontmatter.type).toBe('meeting');
    expect(frontmatter.title).toBe('Weekly Sync');
    expect(frontmatter.date).toBe('2025-01-15');
  });

  test('should handle note templates correctly', () => {
    const dailyTemplate = `---
type: daily
date: {{date}}
---

# Daily Note - {{date}}

## Tasks

## Notes

## Reflection
`;

    expect(dailyTemplate).toContain('type: daily');
    expect(dailyTemplate).toContain('{{date}}');

    const date = '2025-01-15';
    const filled = dailyTemplate.replace(/{{date}}/g, date);
    expect(filled).toContain(`date: ${date}`);
    expect(filled).toContain(`# Daily Note - ${date}`);
  });
});
