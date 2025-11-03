<div align="center">
  <img width="800" height="300" alt="local-work-banner" src="https://github.com/user-attachments/assets/18f059f1-23d6-4f43-9886-cabd84105efc" />
</div>

# local-work

[![npm version](https://img.shields.io/npm/v/local-work.svg)](https://www.npmjs.com/package/local-work)
[![CI Status](https://github.com/jonhvmp/local-work/workflows/CI/badge.svg)](https://github.com/jonhvmp/local-work/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.18.0-brightgreen.svg)](https://nodejs.org)

> Professional CLI tools for task and note management. Streamline your development workflow with organized tasks, daily notes, and meeting logs.

## Overview

`local-work` is a lightweight, powerful CLI toolkit designed for developers who value productivity and organization. Manage tasks with auto-incrementing IDs, track time, maintain daily notes, document technical decisions, and organize meeting notes—all from your terminal.

**Key Benefits:**

- **Zero Configuration**: Works out of the box with sensible defaults
- **Project-Aware**: Automatically detects project root (like Git)
- **Cross-Platform**: Native support for Linux, macOS, and Windows
- **Flexible**: Global installation or per-project configuration
- **Developer-Friendly**: Integrates with your preferred text editor

## Features

### Task Management

- Auto-increment task IDs (`TASK-001`, `TASK-002`, etc.)
- Status workflow: `backlog` → `active` → `completed` → `archived`
- Priority levels: `low`, `medium`, `high`
- Time tracking with estimated vs. actual hours
- Full-text search across all tasks
- Field-level updates (priority, assignee, tags, etc.)
- Task statistics and analytics
- Automatic archival of old completed tasks
- Editor integration for detailed editing

### Note Management

- Daily notes with automatic date-based naming (`YYYY-MM-DD.md`)
- Meeting notes with agenda and action items
- Technical Decision Records (ADRs) with auto-numbering
- Learning notes (Today I Learned / TILs)
- Content-based search across all notes
- Auto-open in your preferred editor
- Organized by type for easy navigation

### Configuration & Flexibility

- **Per-Project Configuration**: Use `.local-work/` directory for project-specific settings
- **Global Workspaces**: Manage multiple isolated workspaces for different projects
- **Platform-Native Storage**: Follows XDG on Linux, Library on macOS, AppData on Windows
- **Environment Overrides**: Customize paths via environment variables
- **Subdirectory Awareness**: Commands work from any subdirectory within a project
- **Smart Project Detection**: Automatically finds project root (detects `.git`, `package.json`, etc.)

## Installation

### Global Installation (Recommended)

```bash
npm install -g local-work
```

After installation, `task` and `note` commands are available globally:

```bash
task list
note daily
```

### Per-Project Installation

For project-specific task and note management:

```bash
cd /path/to/your/project
npm install -g local-work  # or use existing global installation
task init                   # creates .local-work/ in project root
```

This creates a `.local-work/config.json` file and directory structure in your project. All team members can share the same configuration by committing `.local-work/` to version control.

## Quick Start

### 1. Initialize (Optional for Per-Project Setup)

```bash
# From anywhere in your project
task init

# Creates:
# .local-work/config.json  (project configuration)
# tasks/                   (task storage)
# notes/                   (note storage)
```

The `init` command automatically detects your project root by looking for `.git`, `package.json`, or other project markers.

### 2. Create Your First Task

```bash
task new "Implement user authentication" -p high

# Output:
# [+] Created task: TASK-001
# Title: Implement user authentication
# Status: backlog
# Priority: high
```

### 3. Manage Task Workflow

```bash
# Start working on a task
task start TASK-001

# Mark as completed
task done TASK-001

# View all active tasks
task list active
```

### 4. Create Notes

```bash
# Daily note
note daily

# Meeting note
note meeting "Sprint Planning"

# Technical decision
note tech "Migration to TypeScript"

# Learning note
note til "React Server Components"
```

### 5. Configure Your Editor

```bash
export EDITOR=code  # VS Code
# or
task config set editor vim
```

## Command Reference

### Task Commands

#### Creation and Status

| Command                      | Description                | Example                            |
| ---------------------------- | -------------------------- | ---------------------------------- |
| `task new <title> [options]` | Create a new task          | `task new "Fix login bug" -p high` |
| `task start <id>`            | Move task to active status | `task start TASK-001`              |
| `task done <id>`             | Mark task as completed     | `task done TASK-001`               |

**Options for `task new`:**

- `-p, --priority <level>`: Set priority (low, medium, high)
- `-a, --assignee <name>`: Assign to someone
- `-e, --estimated <time>`: Set estimated time (e.g., `8h`, `2.5h`, `30m`)
- `-t, --tags <tags>`: Add comma-separated tags

#### Viewing and Editing

| Command              | Description                    | Example              |
| -------------------- | ------------------------------ | -------------------- |
| `task list [status]` | List tasks by status           | `task list active`   |
| `task view <id>`     | View detailed task information | `task view TASK-001` |
| `task edit <id>`     | Edit task in your editor       | `task edit TASK-001` |
| `task search <term>` | Search tasks by keyword        | `task search "auth"` |

#### Updating

| Command                            | Description                 | Example                              |
| ---------------------------------- | --------------------------- | ------------------------------------ |
| `task update <id> <field> <value>` | Update specific field       | `task update TASK-001 priority high` |
| `task archive [days]`              | Archive old completed tasks | `task archive 30`                    |

**Updatable fields:**

- `priority`: low, medium, high
- `assignee`: Person's name
- `estimated`: Time estimate (e.g., `8h`)
- `actual`: Actual time spent
- `tags`: Comma-separated list

#### Statistics and Management

| Command      | Description                          |
| ------------ | ------------------------------------ |
| `task stats` | Show task statistics and analytics   |
| `task open`  | Open tasks directory in file manager |

#### Project Configuration

| Command                             | Description                     | Example                      |
| ----------------------------------- | ------------------------------- | ---------------------------- |
| `task init [tasks-dir] [notes-dir]` | Initialize local project config | `task init`                  |
| `task config show`                  | Display current configuration   | `task config show`           |
| `task config get <key>`             | Get configuration value         | `task config get editor`     |
| `task config set <key> <value>`     | Set configuration value         | `task config set editor vim` |

#### Workspace Management (Global)

| Command                            | Description             | Example                              |
| ---------------------------------- | ----------------------- | ------------------------------------ |
| `task workspace list`              | List all workspaces     | `task workspace list`                |
| `task workspace add <name> <path>` | Add new workspace       | `task workspace add client ~/client` |
| `task workspace switch <name>`     | Switch active workspace | `task workspace switch client`       |
| `task workspace remove <name>`     | Remove workspace        | `task workspace remove old-project`  |

### Note Commands

#### Creation

| Command                | Description                     | Example                        |
| ---------------------- | ------------------------------- | ------------------------------ |
| `note daily`           | Create daily note               | `note daily`                   |
| `note meeting <title>` | Create meeting note             | `note meeting "Sprint Review"` |
| `note tech <title>`    | Create technical decision (ADR) | `note tech "API versioning"`   |
| `note til <title>`     | Create learning note            | `note til "Git hooks"`         |

#### Viewing and Searching

| Command              | Description             | Example                  |
| -------------------- | ----------------------- | ------------------------ |
| `note list [type]`   | List notes by type      | `note list meetings`     |
| `note search <term>` | Search notes by content | `note search "database"` |
| `note open`          | Open notes directory    | `note open`              |

#### Project Configuration

| Command                             | Description                     | Example                        |
| ----------------------------------- | ------------------------------- | ------------------------------ |
| `note init [tasks-dir] [notes-dir]` | Initialize local project config | `note init`                    |
| `note config show`                  | Display current configuration   | `note config show`             |
| `note workspace switch <name>`      | Switch active workspace         | `note workspace switch client` |

## Configuration

### Per-Project Configuration

Create a `.local-work/` directory in your project for team-shared configuration:

```bash
cd /path/to/your/project
task init
```

This creates:

```
.local-work/
  config.json          # Project configuration
tasks/
  backlog/
  active/
  completed/
  archived/
notes/
  daily/
  meetings/
  technical/
  learning/
```

**Configuration file (`.local-work/config.json`):**

```json
{
  "version": "2.0.0",
  "projectRoot": "/absolute/path/to/project",
  "tasksDir": "./tasks",
  "notesDir": "./notes",
  "createdAt": "2025-11-01T..."
}
```

**Benefits:**

- Share configuration with your team (commit `.local-work/` to Git)
- Keep tasks/notes private (add to `.gitignore`)
- Commands work from any subdirectory
- Automatic project root detection

**Subdirectory Behavior:**

The CLI intelligently detects your project root when running `init` from a subdirectory:

```bash
# Project structure:
/my-project/
  ├── .git/
  ├── package.json
  └── src/
      └── components/    # <- You are here

# Running from subdirectory:
cd /my-project/src/components
task init

# Output:
# [>] Detected project root at: /my-project
# [+] Local configuration created: .local-work/config.json
```

All commands work from any subdirectory within your project:

```bash
cd /my-project/src/components
task list              # Works!
task new "Fix bug"     # Works!
note daily             # Works!
```

For more details, see [SUBDIRECTORY_BEHAVIOR.md](./SUBDIRECTORY_BEHAVIOR.md).

### Global Workspaces

For managing multiple projects without per-project configuration:

```bash
# Add workspaces for different projects
task workspace add personal ~/personal-tasks
task workspace add work ~/work-tasks
task workspace add client-alpha ~/clients/alpha

# Switch between them
task workspace switch work
task list                    # Shows work tasks

task workspace switch personal
task list                    # Shows personal tasks
```

Each workspace has isolated task/note collections with independent numbering.

### Platform-Specific Storage

Global workspaces use platform-native directories:

**Linux (XDG Base Directory):**

- Config: `~/.config/local-work/config.json`
- Data: `~/.local/share/local-work/`

**macOS:**

- Config & Data: `~/Library/Application Support/local-work/`

**Windows:**

- Config: `%APPDATA%\local-work\config.json`
- Data: `%LOCALAPPDATA%\local-work\`

### Environment Variables

Override default locations:

```bash
# Override entire workspace
export LOCAL_WORK_DIR=~/my-workspace

# Override only tasks directory
export LOCAL_WORK_TASKS_DIR=~/my-tasks

# Override only notes directory
export LOCAL_WORK_NOTES_DIR=~/my-notes
```

**Priority order:** Local config > ENV variables > Active workspace > Default platform location

### Configuration Priority

When running commands, the CLI checks locations in this order:

1. **Local project config** (`.local-work/config.json` - highest priority)
2. **Environment variables** (`LOCAL_WORK_TASKS_DIR`, etc.)
3. **Active workspace** (global workspace configuration)
4. **Default platform location** (platform-specific directories)

This allows maximum flexibility while maintaining sensible defaults.

## Usage Examples

### Task Workflow

```bash
# Create a new task
task new "Implement OAuth2 authentication" -p high -e 8h

# Start working on it
task start TASK-001

# Update progress
task update TASK-001 actual 3h

# Mark as done
task done TASK-001

# View statistics
task stats
```

### Note Taking Workflow

```bash
# Start your day
note daily

# Document a meeting
note meeting "Architecture Review"

# Record a technical decision
note tech "Database sharding strategy"

# Capture learning
note til "Advanced TypeScript generics"

# Find past notes
note search "database"
```

### Team Collaboration

```bash
# Project lead: Initialize project
cd /path/to/project
task init

# Commit to version control
git add .local-work/
git commit -m "Add local-work configuration"

# Team member: Clone and use
git clone <repository>
cd project
task list                    # Works automatically!
task new "Fix navigation"    # Creates TASK-002 (next in sequence)
```

### Multi-Project Management

```bash
# Set up workspaces for different projects
task workspace add website ~/projects/website
task workspace add mobile-app ~/projects/mobile
task workspace add client-work ~/projects/client

# Work on website
task workspace switch website
task new "Update footer design"
task list

# Switch to mobile app
task workspace switch mobile-app
task new "Implement push notifications"
task list                     # Shows only mobile-app tasks
```

## Best Practices

### Task Management

- **Start small**: Begin with a few high-priority tasks rather than creating dozens at once
- **Consistent workflow**: Use `task start` → work → `task update` → `task done` pattern
- **Time tracking**: Log estimated and actual time to improve future estimates
- **Regular cleanup**: Archive completed tasks monthly to keep lists manageable
- **Descriptive titles**: Write clear, actionable task titles (e.g., "Fix login form validation" vs "Bug")

### Note Organization

- **Daily notes**: Use `note daily` every morning to capture plans and thoughts
- **Meeting notes**: Template includes attendees, agenda, and action items
- **Technical notes**: Document decisions with context and rationale
- **Consistent naming**: Follow the template formats for easier searching
- **Link tasks**: Reference task IDs in notes for cross-referencing

### Multi-Project Workflow

- **Per-project config**: Initialize `.local-work/` in each project repository
- **Commit configs**: Add `.local-work/config.json` to version control
- **Team alignment**: Share configuration for consistent task numbering
- **Workspace switching**: Use workspaces for quick context switching between projects
- **Separate concerns**: Don't mix personal tasks with project tasks

### Time Management

- **Realistic estimates**: Start with rough estimates and refine over time
- **Track actual time**: Update `actual` field to improve estimation accuracy
- **Review statistics**: Use `task stats` weekly to identify patterns
- **Break down tasks**: Large tasks (>8h) should be split into smaller ones

### Backup and Safety

- **Version control**: Commit `.local-work/` directory with project code
- **Platform backups**: Include platform-specific directories in backup strategy
  - Linux: `~/.local/share/local-work/`
  - macOS: `~/Library/Application Support/local-work/`
  - Windows: `%APPDATA%\local-work\`
- **Regular archives**: Archive old tasks to keep performance optimal

## Environment Variables

### Editor Configuration

Set your preferred text editor:

```bash
export EDITOR=code  # VS Code
export EDITOR=vim   # Vim
export EDITOR=nano  # Nano (default)
```

Or configure it in the CLI (recommended):

```bash
task config set editor code
```

### Directory Overrides

Override default storage locations:

- `LOCAL_WORK_DIR`: Override entire workspace directory
- `LOCAL_WORK_TASKS_DIR`: Override tasks directory only
- `LOCAL_WORK_NOTES_DIR`: Override notes directory only

**Note**: Environment variables have lower priority than per-project configs. See [Configuration & Storage](#configuration--storage) for complete priority order.

## Task Field Reference

| Field       | Type     | Description              | Example                                      |
| ----------- | -------- | ------------------------ | -------------------------------------------- |
| `id`        | String   | Auto-generated unique ID | `TASK-001`, `TASK-042`                       |
| `title`     | String   | Task description         | `"Implement OAuth2"`                         |
| `status`    | Enum     | Current state            | `backlog`, `active`, `completed`, `archived` |
| `priority`  | Enum     | Importance level         | `low`, `medium`, `high`                      |
| `created`   | ISO Date | Creation timestamp       | `2024-01-15T10:30:00Z`                       |
| `updated`   | ISO Date | Last modification        | `2024-01-16T14:22:00Z`                       |
| `assignee`  | String   | Assigned person          | `"john.doe"`                                 |
| `tags`      | Array    | Category labels          | `["backend", "security"]`                    |
| `estimated` | String   | Time estimate            | `"8h"`, `"2.5h"`, `"30m"`                    |
| `actual`    | String   | Time spent               | `"6.5h"`, `"45m"`                            |

## Time Format

Supported time formats for estimates and tracking:

- **Hours**: `2h`, `8h`, `1.5h`, `0.5h`
- **Minutes**: `30m`, `45m`, `90m`
- **Combined**: Not supported (use decimal hours instead: `2.5h` for 2h 30m)

## Troubleshooting

### Init creates config in wrong location

If `task init` creates `.local-work/` in a subdirectory instead of project root:

```bash
# Force creation at project root
cd /path/to/project/root
task init --here

# Or let auto-detection find the root
cd /path/to/project/any/subdirectory
task init  # Creates at detected project root
```

See [SUBDIRECTORY_BEHAVIOR.md](./SUBDIRECTORY_BEHAVIOR.md) for details.

### Task IDs out of sync

If task IDs don't match between team members:

1. Ensure `.local-work/config.json` is committed to version control
2. All team members should pull latest changes
3. The `nextTaskId` field keeps IDs synchronized

### Commands not working from subdirectory

Ensure you have either:

- A `.local-work/config.json` in your project root, OR
- An active workspace configured with `task workspace add`

The CLI searches upward for configuration automatically.

### Permission errors

If you get permission errors on Linux/macOS:

```bash
# Check directory permissions
ls -la ~/.local/share/local-work/

# Fix if needed
chmod -R 755 ~/.local/share/local-work/
```

## Requirements

- Node.js >= 18.18.0
- No external dependencies
- Cross-platform: Linux, macOS, Windows

## Contributing

Contributions are welcome! Here's how you can help:

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/Jonhvmp/local-work.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Install dependencies: `npm install`
5. Make your changes
6. Run tests: `npm test`
7. Commit: `git commit -m 'feat: add amazing feature'`
8. Push: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation (README.md, ONBOARDING.md)
- Use conventional commit messages (feat:, fix:, docs:, etc.)
- Ensure all tests pass before submitting PR

### Areas for Contribution

- Bug fixes and improvements
- New features (templates, commands, integrations)
- Documentation enhancements
- Test coverage improvements
- Platform-specific optimizations

## Support

Need help or want to contribute?

- **Report bugs**: [GitHub Issues](https://github.com/jonhvmp/local-work/issues)
- **Request features**: [GitHub Issues](https://github.com/jonhvmp/local-work/issues)
- **Documentation**: [README](https://github.com/jonhvmp/local-work#readme)
- **NPM Package**: [npmjs.com/package/local-work](https://www.npmjs.com/package/local-work)

## Author

**Jonh Alex**

- GitHub: [@jonhvmp](https://github.com/jonhvmp)
- NPM: [jonhvmp](https://www.npmjs.com/~jonhvmp)

---

**Built for developers who value productivity and simplicity.**
