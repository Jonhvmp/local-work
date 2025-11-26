# Task CLI Reference

Complete reference for all task commands in local-work v3.1.0.

---

## :material-flag: Global Flag

All task commands support the global flag:

- `-g` or `--global` - Use global workspace instead of local

**Example:**

```bash
task -g list          # List tasks from global workspace
task new "Task"       # Create in local workspace (default)
```

---

## :material-playlist-plus: task new

Create a new task.

### Syntax

```bash
task [-g] new <title> [-p <priority>] [-a <assignee>] [--no-edit]
```

### Parameters

| Parameter       | Type   | Required | Description                                           |
| --------------- | ------ | -------- | ----------------------------------------------------- |
| `<title>`       | string | Yes      | Task title                                            |
| `-p <priority>` | string | No       | Priority: `low`, `medium`, `high` (default: `medium`) |
| `-a <assignee>` | string | No       | Assign to person                                      |
| `--no-edit`     | flag   | No       | Skip opening in editor                                |
| `-g, --global`  | flag   | No       | Use global workspace                                  |

### Examples

```bash
# Basic task
task new "Implement login feature"

# With priority
task new "Fix critical bug" -p high

# With assignee
task new "Update docs" -a Jonh

# Combined flags
task new "Add OAuth" -p high -a sarah

# Without auto-open
task new "Automated task" --no-edit

# Global workspace
task -g new "Personal task"
```

### Output

```
✓ Task created successfully!

  ID:       TASK-001
  Title:    Implement login feature
  Status:   backlog
  Priority: medium
  File:     /project/.local-work/tasks/backlog/TASK-001-implement-login-feature.md

  Opening in editor...
```

---

## :material-play: task start

Move a task to active status.

### Syntax

```bash
task [-g] start <task-id>
```

### Parameters

| Parameter      | Type   | Required | Description                         |
| -------------- | ------ | -------- | ----------------------------------- |
| `<task-id>`    | string | Yes      | Task ID (e.g., `TASK-001` or `001`) |
| `-g, --global` | flag   | No       | Use global workspace                |

### Examples

```bash
task start TASK-001
task start 001              # Short form
task -g start TASK-005      # Global workspace
```

### Output

```
✓ Task TASK-001 moved to active
```

---

## :material-check: task done

Mark a task as completed.

### Syntax

```bash
task [-g] done <task-id>
```

**Alias:** `task complete <task-id>`

### Parameters

| Parameter      | Type   | Required | Description                         |
| -------------- | ------ | -------- | ----------------------------------- |
| `<task-id>`    | string | Yes      | Task ID (e.g., `TASK-001` or `001`) |
| `-g, --global` | flag   | No       | Use global workspace                |

### Examples

```bash
task done TASK-001
task complete 001           # Alias
task -g done TASK-005       # Global workspace
```

### Output

```
✓ Task TASK-001 marked as completed
```

---

## :material-view-list: task list

List tasks by status.

### Syntax

```bash
task [-g] list [status]
```

**Alias:** `task ls [status]`

### Parameters

| Parameter      | Type   | Required | Description                                                    |
| -------------- | ------ | -------- | -------------------------------------------------------------- |
| `[status]`     | string | No       | Filter by status: `backlog`, `active`, `completed`, `archived` |
| `-g, --global` | flag   | No       | Use global workspace                                           |

### Examples

```bash
task list                   # All active statuses
task list active            # Only active tasks
task list backlog           # Only backlog tasks
task list completed         # Only completed tasks
task list archived          # Only archived tasks
task -g list                # Global tasks
```

### Output

```
Tasks (15)

backlog (8 tasks)
──────────────────────────────────────────────────────────────
◉ TASK-001: Implement user authentication
  Priority: high | Created: today

◉ TASK-003: Update documentation
  Priority: low | Created: 2 days ago

active (5 tasks)
──────────────────────────────────────────────────────────────
◉ TASK-002: Fix login bug
  Priority: high | Created: today

completed (2 tasks)
──────────────────────────────────────────────────────────────
◉ TASK-006: Setup CI/CD
  Priority: high | Created: 3 days ago
```

---

## :material-eye: task view

View detailed task information.

### Syntax

```bash
task [-g] view <task-id>
```

**Alias:** `task show <task-id>`

### Parameters

| Parameter      | Type   | Required | Description                         |
| -------------- | ------ | -------- | ----------------------------------- |
| `<task-id>`    | string | Yes      | Task ID (e.g., `TASK-001` or `001`) |
| `-g, --global` | flag   | No       | Use global workspace                |

### Examples

```bash
task view TASK-001
task show 001               # Alias
task -g view TASK-005       # Global workspace
```

### Output

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
- [ ] Create auth middleware
```

---

## :material-pencil: task edit

Edit a task in your configured editor.

### Syntax

```bash
task [-g] edit <task-id>
```

### Parameters

| Parameter      | Type   | Required | Description                         |
| -------------- | ------ | -------- | ----------------------------------- |
| `<task-id>`    | string | Yes      | Task ID (e.g., `TASK-001` or `001`) |
| `-g, --global` | flag   | No       | Use global workspace                |

### Examples

```bash
task edit TASK-001
task edit 001               # Short form
task -g edit TASK-005       # Global workspace
```

### Output

```
✎ Opening task in editor...

✓ Done!
```

---

## :material-update: task update

Update task metadata fields.

### Syntax

```bash
task [-g] update <task-id> <field> <value>
```

### Parameters

| Parameter      | Type   | Required | Description                         |
| -------------- | ------ | -------- | ----------------------------------- |
| `<task-id>`    | string | Yes      | Task ID (e.g., `TASK-001` or `001`) |
| `<field>`      | string | Yes      | Field name (see below)              |
| `<value>`      | string | Yes      | New value                           |
| `-g, --global` | flag   | No       | Use global workspace                |

### Fields

| Field       | Valid Values            | Description                                |
| ----------- | ----------------------- | ------------------------------------------ |
| `priority`  | `low`, `medium`, `high` | Task priority level                        |
| `assignee`  | any string              | Person assigned to task                    |
| `estimated` | time format             | Estimated time (e.g., `2h`, `30m`, `1.5h`) |
| `actual`    | time format             | Actual time spent                          |
| `tags`      | comma-separated         | Tags for categorization (no spaces)        |

### Time Format

- `30m` - 30 minutes
- `1h` - 1 hour
- `2h` - 2 hours
- `1.5h` - 1 hour 30 minutes
- `90m` - 90 minutes

### Examples

```bash
# Update priority
task update TASK-001 priority high

# Update assignee
task update TASK-001 assignee Jonh

# Update estimated time
task update TASK-001 estimated 2h

# Update actual time
task update TASK-001 actual 1.5h

# Update tags
task update TASK-001 tags backend,auth,security

# Global workspace
task -g update TASK-005 priority high
```

### Output

```
✓ Task updated successfully!
   priority: high
```

---

## :material-magnify: task search

Search tasks by term.

### Syntax

```bash
task [-g] search <term>
```

**Alias:** `task find <term>`

### Parameters

| Parameter      | Type   | Required | Description                              |
| -------------- | ------ | -------- | ---------------------------------------- |
| `<term>`       | string | Yes      | Search term (searches title and content) |
| `-g, --global` | flag   | No       | Use global workspace                     |

### Examples

```bash
task search authentication
task search "bug fix"
task find oauth
task -g search personal
```

### Output

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

---

## :material-chart-bar: task stats

Display task statistics.

### Syntax

```bash
task [-g] stats
```

**Alias:** `task statistics`

### Parameters

| Parameter      | Type | Required | Description          |
| -------------- | ---- | -------- | -------------------- |
| `-g, --global` | flag | No       | Use global workspace |

### Examples

```bash
task stats
task statistics            # Alias
task -g stats              # Global workspace
```

### Output

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

---

## :material-clipboard-text: task standup

Generate standup reports with yesterday's completed work, today's tasks, and blockers.

### Syntax

```bash
task [-g] standup [--weekly] [--format <format>]
```

### Parameters

| Parameter        | Type   | Required | Description                                         |
| ---------------- | ------ | -------- | --------------------------------------------------- |
| `--weekly`, `-w` | flag   | No       | Generate weekly summary instead of daily            |
| `--format`, `-f` | string | No       | Output format: `text` (default), `markdown`, `json` |
| `-g, --global`   | flag   | No       | Use global workspace                                |

### Examples

```bash
# Daily standup (default text format)
task standup

# Weekly summary
task standup --weekly
task standup -w

# Markdown format (great for Slack/Teams)
task standup --format markdown
task standup -f markdown

# JSON format (for integrations)
task standup --format json

# Global workspace
task -g standup
```

### Output (Text)

```
[T] Standup Report
Generated: 26/11/2025

-> What I worked on yesterday:
  • TASK-042: Fix authentication bug (completed)
  • TASK-041: Update user docs (completed)

-> What I'm working on today:
  • TASK-045: Implement OAuth2 (active, high priority)
  • TASK-044: Add unit tests (active, medium priority)

-> Blockers / Issues:
  • TASK-050: Waiting for API access (backlog, high priority)
```

### Output (Markdown)

```markdown
## 📋 Standup Report

**Generated:** 26/11/2025

### ✅ What I worked on yesterday

- TASK-042: Fix authentication bug
- TASK-041: Update user docs

### 🔄 What I'm working on today

- **TASK-045**: Implement OAuth2 _(high)_
- **TASK-044**: Add unit tests _(medium)_

### ⚠️ Blockers / Issues

- **TASK-050**: Waiting for API access _(high)_
```

### Output (Weekly Summary)

```
[T] Weekly Summary
Week 48 (25/11/2025 - 01/12/2025)

Completed this week: 8 tasks
  • TASK-042: Fix authentication bug
  • TASK-041: Update user docs
  ...

Currently active: 3 tasks
  • TASK-045: Implement OAuth2
  ...

Backlog: 5 tasks
```

---

## :material-archive: task archive

Archive old completed tasks.

### Syntax

```bash
task [-g] archive [days]
```

### Parameters

| Parameter      | Type   | Required | Description                  |
| -------------- | ------ | -------- | ---------------------------- |
| `[days]`       | number | No       | Days threshold (default: 30) |
| `-g, --global` | flag   | No       | Use global workspace         |

### Examples

```bash
task archive               # Archive tasks older than 30 days
task archive 60            # Archive tasks older than 60 days
task archive 90            # Archive tasks older than 90 days
task -g archive            # Archive global tasks
```

### Output

```
✓ Archived 5 tasks older than 30 days
```

---

## :material-cog: task config

Manage configuration settings.

### Subcommands

#### show

Display current configuration.

```bash
task config show
```

**Output:**

```
Configuration (v3.1.0):

Platform: linux
Config Dir: /home/user/.config/local-work
Data Dir: /home/user/.local/share/local-work

Workspace: local
Tasks Dir: /project/.local-work/tasks
Notes Dir: /project/.local-work/notes

Preferences:
  editor: vim
  autoOpen: true
  colorOutput: true
  archiveDays: 30
```

#### set

Set a preference value.

```bash
task config set <key> <value>
```

**Examples:**

```bash
task config set editor code
task config set autoOpen false
task config set archiveDays 60
task config set colorOutput true
```

#### get

Get a preference value.

```bash
task config get <key>
```

**Examples:**

```bash
task config get editor
# Output: code

task config get autoOpen
# Output: true
```

---

## :material-folder-open: task open

Open tasks directory in file manager.

### Syntax

```bash
task [-g] open
```

### Parameters

| Parameter      | Type | Required | Description           |
| -------------- | ---- | -------- | --------------------- |
| `-g, --global` | flag | No       | Open global workspace |

### Examples

```bash
task open                  # Open local tasks directory
task -g open               # Open global tasks directory
```

### Output

```
Opening tasks directory:
  /project/.local-work/tasks
```

---

## :material-rocket: task init

Initialize local-work in current project.

### Syntax

```bash
task init [tasks-dir] [notes-dir]
```

### Parameters

| Parameter     | Type   | Required | Description                                           |
| ------------- | ------ | -------- | ----------------------------------------------------- |
| `[tasks-dir]` | string | No       | Custom tasks directory (default: `.local-work/tasks`) |
| `[notes-dir]` | string | No       | Custom notes directory (default: `.local-work/notes`) |

### Examples

```bash
# Default initialization
task init

# Custom directories
task init custom-tasks custom-notes

# Using different paths
task init ./tasks ./notes
```

### Output

```
Initializing local-work in current project...

✓ Project initialized!

You can now use task and note commands in this directory.
Tasks and notes will be stored in this project.
```

---

## :material-swap-horizontal: task migrate

Migrate data from old location.

### Syntax

```bash
task migrate --from <old-path>
```

### Parameters

| Parameter       | Type   | Required | Description              |
| --------------- | ------ | -------- | ------------------------ |
| `--from <path>` | string | Yes      | Old tasks directory path |

### Examples

```bash
task migrate --from ~/old-tasks
task migrate --from /path/to/old/local-work
```

### Output

```
✓ Migration completed successfully
```

---

## :material-help: task help

Display help information.

### Syntax

```bash
task
task --help
task help
```

### Output

Shows complete usage information with all commands, examples, and options.

---

## :material-keyboard-return: Exit Codes

| Code | Description                                     |
| ---- | ----------------------------------------------- |
| `0`  | Success                                         |
| `1`  | Error (invalid arguments, task not found, etc.) |

---

## :material-arrow-right: See Also

- [Task Management Guide](../user-guide/tasks.md) - Complete task workflow
- [Configuration](../getting-started/configuration.md) - Configure preferences
- [Quick Start](../getting-started/quick-start.md) - Getting started guide
