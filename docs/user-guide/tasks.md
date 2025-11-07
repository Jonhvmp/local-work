# Task Management

Complete guide to managing tasks with local-work v3.0.0.

---

## :material-playlist-plus: Creating Tasks

### Basic Task Creation

Create a new task with a title:

```bash
task new "Implement user authentication"
```

The task opens in your editor with auto-generated ID and metadata.

### With Priority

Set priority level (low, medium, high):

```bash
task new "Fix critical bug" -p high
task new "Update documentation" -p low
task new "Add feature" -p medium
```

### With Assignee

Assign the task to someone:

```bash
task new "Review PR #123" -a Jonh
task new "Design mockups" -a sarah -p high
```

### Without Auto-Open

Create without opening in editor:

```bash
task new "Automated task" --no-edit
```

### Combined Flags

```bash
task new "Implement OAuth" -p high -a Jonh --no-edit
```

---

## :material-view-list: Listing Tasks

### List All Tasks

Show tasks from all active statuses (backlog, active, completed):

```bash
task list
```

**Alias:** `task ls`

**Output:**

```
Tasks (15)

backlog (8 tasks)
──────────────────────────────────────────────────────────────
◉ TASK-001: Implement user authentication
  Priority: high | Created: today

◉ TASK-003: Update documentation
  Priority: low | Created: 2 days ago

◉ TASK-005: Design new homepage
  Priority: medium | Created: today

active (5 tasks)
──────────────────────────────────────────────────────────────
◉ TASK-002: Fix login bug
  Priority: high | Created: today

◉ TASK-004: Add OAuth support
  Priority: medium | Created: yesterday

completed (2 tasks)
──────────────────────────────────────────────────────────────
◉ TASK-006: Setup CI/CD
  Priority: high | Created: 3 days ago

◉ TASK-007: Write tests
  Priority: medium | Created: 4 days ago
```

### List by Status

Filter tasks by specific status:

```bash
task list backlog
task list active
task list completed
task list archived
```

**Example:**

```bash
task list active
```

**Output:**

```
active (5 tasks)
──────────────────────────────────────────────────────────────
◉ TASK-002: Fix login bug
  Priority: high | Created: today

◉ TASK-004: Add OAuth support
  Priority: medium | Created: yesterday
```

---

## :material-eye: Viewing Tasks

### View Task Details

Display complete task information:

```bash
task view TASK-001
```

**Alias:** `task show TASK-001`

**Output:**

```
Task: TASK-001
─────────────────────────────────────────────────────────────

Title:     Implement user authentication
Status:    active
Priority:  high
Assignee:  Jonh
Created:   2025-11-07
Updated:   2025-11-07
Estimated: 2h
Actual:    1.5h
Tags:      backend, security

File: /project/.local-work/tasks/active/TASK-001-implement-user-authentication.md

─────────────────────────────────────────────────────────────
## Description

Implement JWT-based authentication for the API.

## Subtasks

- [x] Set up JWT library
- [x] Create auth middleware
- [ ] Add login endpoint
- [ ] Add logout endpoint

## Notes

Using jsonwebtoken library for token generation.
Tokens expire after 24 hours.
```

---

## :material-pencil: Editing Tasks

### Edit in Editor

Open a task file in your configured editor:

```bash
task edit TASK-001
```

This opens the Markdown file where you can:

- Update description
- Add/modify subtasks
- Add notes
- Modify metadata (manual editing)

After editing, the `updated` field is automatically updated.

---

## :material-state-machine: Task Workflow

### Status Lifecycle

```
backlog → active → completed → archived
```

### Move to Active

Start working on a task:

```bash
task start TASK-001
```

Moves the task from backlog to active.

**Output:**

```
✓ Task TASK-001 moved to active
```

### Mark as Done

Complete a task:

```bash
task done TASK-001
```

**Alias:** `task complete TASK-001`

Moves the task from active to completed.

**Output:**

```
✓ Task TASK-001 marked as completed
```

---

## :material-update: Updating Tasks

### Update Command

Modify task metadata fields:

```bash
task update TASK-001 <field> <value>
```

### Available Fields

| Field       | Description          | Example Values                     |
| ----------- | -------------------- | ---------------------------------- |
| `priority`  | Task priority        | `low`, `medium`, `high`            |
| `assignee`  | Person assigned      | Any string (e.g., `Jonh`, `sarah`) |
| `estimated` | Estimated time       | `30m`, `1h`, `2h`, `1.5h`          |
| `actual`    | Actual time spent    | `30m`, `1h`, `2h`, `1.5h`          |
| `tags`      | Comma-separated tags | `backend,auth`, `frontend,ui`      |

### Update Priority

```bash
task update TASK-001 priority high
task update TASK-002 priority low
```

**Output:**

```
✓ Task updated successfully!
   priority: high
```

### Update Assignee

```bash
task update TASK-001 assignee Jonh
task update TASK-002 assignee sarah
```

### Update Time Estimates

```bash
task update TASK-001 estimated 2h
task update TASK-001 actual 1.5h
```

**Time Formats:**

- `30m` - 30 minutes
- `1h` - 1 hour
- `2h` - 2 hours
- `1.5h` - 1 hour 30 minutes
- `90m` - 90 minutes (1.5 hours)

### Update Tags

```bash
task update TASK-001 tags backend,auth
task update TASK-002 tags frontend,ui,design
```

Tags are comma-separated without spaces.

---

## :material-magnify: Searching Tasks

### Search by Term

Find tasks by searching titles and content:

```bash
task search <term>
```

**Alias:** `task find <term>`

**Examples:**

```bash
task search authentication
task search "bug fix"
task search oauth
```

**Output:**

```
Search Results (3)

Searching for: "authentication"

• TASK-001: Implement user authentication
  Status: active | Priority: high

• TASK-015: Add two-factor authentication
  Status: backlog | Priority: medium

• TASK-022: Update authentication docs
  Status: completed | Priority: low
```

The search looks in:

- Task titles
- Task descriptions
- Task content (subtasks, notes)

---

## :material-chart-bar: Task Statistics

### View Stats

Display comprehensive task statistics:

```bash
task stats
```

**Alias:** `task statistics`

**Output:**

```
Task Statistics

Status Distribution:
  backlog     : 8
  active      : 5
  completed   : 12
  archived    : 3

Priority Distribution:
  low         : 6
  medium      : 14
  high        : 8

Time Tracking:
  Estimated: 42h
  Actual:    38h 30m
  Variance:  3h 30m (under)

Total Tasks: 28
```

### Understanding Variance

- **Under**: Actual time is less than estimated (good!)
- **Over**: Actual time exceeded estimate (needs attention)

---

## :material-archive: Archiving Tasks

### Auto-Archive Old Tasks

Move old completed tasks to archived status:

```bash
task archive
```

Default threshold: 30 days

**Custom threshold:**

```bash
task archive 60       # Archive tasks older than 60 days
task archive 90       # Archive tasks older than 90 days
```

**Output:**

```
✓ Archived 5 tasks older than 30 days
```

### When to Archive

- Tasks completed over 30 days ago (default)
- Tasks you no longer need quick access to
- Keep completed directory clean

---

## :material-file-tree: Task File Structure

Tasks are stored as Markdown files with YAML frontmatter:

```
.local-work/tasks/
├── backlog/
│   ├── TASK-001-implement-user-authentication.md
│   └── TASK-003-update-documentation.md
├── active/
│   ├── TASK-002-fix-login-bug.md
│   └── TASK-004-add-oauth-support.md
├── completed/
│   ├── TASK-006-setup-ci-cd.md
│   └── TASK-007-write-tests.md
└── archived/
    └── TASK-010-old-feature.md
```

### Task File Format

```markdown
---
id: TASK-001
title: Implement user authentication
status: active
priority: high
assignee: Jonh
created: 2025-11-07
updated: 2025-11-07
estimated: 2h
actual: 1.5h
tags:
  - backend
  - security
---

## Description

Implement JWT-based authentication for the API.

## Subtasks

- [x] Set up JWT library
- [x] Create auth middleware
- [ ] Add login endpoint
- [ ] Add logout endpoint

## Notes

Using jsonwebtoken library for token generation.
Tokens expire after 24 hours.

## Resources

- https://jwt.io/
- https://www.npmjs.com/package/jsonwebtoken
```

---

## :material-folder-open: Opening Task Directory

### Open in File Manager

```bash
task open              # Open local tasks directory
task -g open           # Open global tasks directory
```

Opens the appropriate directory in your system's file manager:

- **Linux**: Uses `xdg-open`
- **macOS**: Uses `open`
- **Windows**: Uses `explorer`

---

## :material-earth: Global vs Local Tasks

### Local Tasks (Project-specific)

After running `task init`, tasks are project-specific:

```bash
task new "Implement feature X"
task list
task view TASK-001
```

These operate on `.local-work/tasks/` in your project.

### Global Tasks (Personal)

Use `-g` or `--global` for personal tasks:

```bash
task -g new "Buy groceries"
task -g list
task -g view TASK-001
```

These operate on your global workspace.

---

## :material-lightbulb: Tips & Best Practices

### Task Naming

**Good:**

- "Implement user authentication"
- "Fix login redirect bug"
- "Add dark mode toggle"

**Avoid:**

- "do stuff"
- "fix thing"
- "update"

### Using Priorities

- **High**: Urgent bugs, critical features, blockers
- **Medium**: Regular features, normal bugs (default)
- **Low**: Nice-to-have, documentation, cleanup

### Using Subtasks

Break down complex tasks:

```markdown
## Subtasks

- [ ] Research authentication libraries
- [ ] Implement JWT generation
- [ ] Create login endpoint
- [ ] Add refresh token support
- [ ] Write tests
- [ ] Update documentation
```

### Time Tracking

Estimate before starting, track actual time:

```bash
task update TASK-001 estimated 2h      # Before starting
# ... work on task ...
task update TASK-001 actual 1.5h       # After completing
```

### Tagging

Use consistent, meaningful tags:

```bash
task update TASK-001 tags backend,auth,security
task update TASK-002 tags frontend,ui,accessibility
task update TASK-003 tags docs,readme
```

---

## :material-help-circle: Common Workflows

### Daily Workflow

```bash
# Morning: Check active tasks
task list active

# Start working on a task
task start TASK-001

# Edit task as you work
task edit TASK-001

# Mark as done when finished
task done TASK-001
```

### Sprint Planning

```bash
# View all backlog tasks
task list backlog

# Search for specific features
task search "authentication"

# Update priorities
task update TASK-001 priority high
task update TASK-002 priority medium

# Assign tasks
task update TASK-001 assignee Jonh
task update TASK-002 assignee Alex
```

### End of Sprint

```bash
# Check stats
task stats

# Archive old completed tasks
task archive 30

# Review remaining active tasks
task list active
```

---

## :material-arrow-right: Next Steps

- [Note Taking Guide](notes.md) - Learn about notes
- [Task CLI Reference](../reference/task-cli.md) - Complete command reference
- [Configuration](../getting-started/configuration.md) - Customize your setup
