# Local Work CLI

[![npm version](https://img.shields.io/npm/v/local-work.svg)](https://www.npmjs.com/package/local-work)
[![CI Status](https://github.com/jonhvmp/local-work/workflows/CI/badge.svg)](https://github.com/jonhvmp/local-work/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/jonhvmp/local-work/branch/main/graph/badge.svg)](https://codecov.io/gh/jonhvmp/local-work)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/jestjs/jest)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Professional CLI tools for task and note management. Boost your development productivity with organized tasks, daily notes, and meeting logs.

## Features ✨

### Task Management

- ✅ Auto-increment task IDs (TASK-001, TASK-002, etc)
- ✅ Status tracking (backlog → active → completed → archived)
- ✅ Priority management (low, medium, high)
- ✅ Time tracking (estimated vs actual)
- ✅ Search and filter tasks
- ✅ View detailed task information
- ✅ Edit tasks in your preferred editor
- ✅ Update specific fields
- ✅ Task statistics and analytics
- ✅ Auto-archive old tasks
- ✅ Colorized terminal output
- ✅ **Multi-workspace support** 🆕
- ✅ **Cross-platform configuration** 🆕

### Note Management

- ✅ Daily notes with date-based naming
- ✅ Meeting notes with agenda and action items
- ✅ Technical decisions (ADRs) with auto-numbering
- ✅ Learning notes (TILs) for knowledge capture
- ✅ Search notes by content
- ✅ Auto-open in editor after creation
- ✅ List recent notes by type
- ✅ Colorized terminal output
- ✅ **Multi-workspace support** 🆕
- ✅ **Cross-platform configuration** 🆕

### Configuration & Workspaces 🆕

- ✅ Platform-specific storage (XDG on Linux, Library on macOS, AppData on Windows)
- ✅ Multiple isolated workspaces for different projects
- ✅ Environment variable overrides
- ✅ Configurable preferences
- ✅ Automatic migration from old locations
- ✅ Open directory in file manager

## Installation

### Global Installation (Recommended)

```bash
npm install -g local-work
```

After installation, you can use `task` and `note` commands globally from anywhere:

```bash
task list
note daily
```

The CLI will automatically create configuration files in platform-specific locations:

- **Linux**: `~/.config/local-work/` and `~/.local/share/local-work/`
- **macOS**: `~/Library/Application Support/local-work/`
- **Windows**: `%APPDATA%\local-work\` and `%LOCALAPPDATA%\local-work\`

### Local Installation

```bash
npm install local-work
```

Use with npx:

```bash
npx task list
npx note daily
```

### Development Installation

Clone the repository and link locally:

```bash
git clone https://github.com/jonhvmp/local-work.git
cd local-work/scripts
npm link
```

Now you can use `task` and `note` commands globally.

## Quick Start

### First Run

1. Install globally:

```bash
npm install -g local-work
```

2. Run any command to initialize:

```bash
task list
# 🎉 Welcome to local-work CLI!
# Initializing workspace...
```

The CLI automatically creates all necessary directories and configuration files.

3. Set your editor (optional):

```bash
export EDITOR=code  # or vim, nano, etc
# Or set permanently in config:
task config set editor code
```

4. Create your first task:

```bash
task new "Setup project structure" -p high
```

5. Create a daily note:

```bash
note daily
```

## Usage

### Task Commands

**Create a new task:**

```bash
# Global installation
task new "Implement authentication" -p high -a jonhvmp
task new "Fix bug in login"

# Local/npm scripts
npm run task:new "Implement authentication" -p high -a jonhvmp
```

**Manage task status:**

```bash
# Start working on a task (move to active)
task start TASK-001

# Complete a task
task done TASK-001
```

**View and edit tasks:**

```bash
# View detailed task information
task view TASK-001

# Edit task in your editor
task edit TASK-001
```

**Search and list tasks:**

```bash
# List all tasks
task list

# List tasks by status
task list active
task list backlog
task list completed

# Search tasks by term
task search "authentication"
```

**Update task fields:**

```bash
# Update priority
task update TASK-001 priority high

# Update assignee
task update TASK-001 assignee jonhvmp

# Update time estimates
task update TASK-001 estimated 8h
task update TASK-001 actual 6h

# Add tags
task update TASK-001 tags "backend,auth,security"
```

**View statistics:**

```bash
# Show task statistics
task stats
```

**Archive old tasks:**

````bash
**Archive old tasks:**
```bash
# Archive completed tasks older than 30 days
task archive
````

**Workspace management:**

```bash
# List all workspaces
task workspace list

# Add a new workspace
task workspace add my-project ~/projects/my-project

# Switch to a different workspace
task workspace switch my-project

# Remove a workspace
task workspace remove old-project
```

**Configuration management:**

```bash
# Show current configuration
task config show

# Get a specific preference
task config get editor

# Set a preference
task config set editor vim
task config set autoOpen true
```

**Open directory in file manager:**

```bash
# Open tasks directory
task open

# Open notes directory
note open
```

# Archive completed tasks older than 60 days

task archive 60

````

### Note Commands

**Create notes:**
```bash
# Daily note (auto-opens in editor)
note daily

# Meeting note
note meeting "Sprint Planning"

# Technical decision (ADR)
note tech "Migration to Next.js 15"

# Learning note (TIL)
note til "React Server Components"
````

**List and search notes:**

```bash
# List all recent notes
note list

# List by type
note list daily
note list meetings
note list technical
note list learning

# Search notes
note search "authentication"
```

## Command Reference

### Global Commands (after `npm install -g`)

| Task Command                       | Description                   |
| ---------------------------------- | ----------------------------- |
| `task new <title> [options]`       | Create new task               |
| `task start <id>`                  | Move task to active           |
| `task done <id>`                   | Mark task as completed        |
| `task list [status]`               | List tasks (all or by status) |
| `task view <id>`                   | View task details             |
| `task edit <id>`                   | Edit task in editor           |
| `task search <term>`               | Search tasks                  |
| `task update <id> <field> <value>` | Update task field             |
| `task stats`                       | Show statistics               |
| `task archive [days]`              | Archive old tasks             |
| `task workspace list`              | List all workspaces           |
| `task workspace add <name> <path>` | Add new workspace             |
| `task workspace switch <name>`     | Switch to workspace           |
| `task workspace remove <name>`     | Remove workspace              |
| `task config show`                 | Show configuration            |
| `task config get <key>`            | Get preference value          |
| `task config set <key> <value>`    | Set preference value          |
| `task open`                        | Open tasks directory          |

| Note Command                   | Description                 |
| ------------------------------ | --------------------------- |
| `note daily`                   | Create daily note           |
| `note meeting <title>`         | Create meeting note         |
| `note tech <title>`            | Create technical note (ADR) |
| `note til <title>`             | Create learning note (TIL)  |
| `note list [type]`             | List notes (all or by type) |
| `note search <term>`           | Search notes by content     |
| `note workspace list`          | List all workspaces         |
| `note workspace switch <name>` | Switch to workspace         |
| `note config show`             | Show configuration          |
| `note open`                    | Open notes directory        |

## Configuration & Storage

### Platform-Specific Locations

The CLI automatically stores configuration and data in platform-specific directories following industry standards:

#### Linux (XDG Base Directory Specification)

- **Configuration**: `~/.config/local-work/config.json`
- **Data**: `~/.local/share/local-work/`
  - Tasks: `~/.local/share/local-work/tasks/`
  - Notes: `~/.local/share/local-work/notes/`

#### macOS

- **Configuration & Data**: `~/Library/Application Support/local-work/`
  - Tasks: `~/Library/Application Support/local-work/tasks/`
  - Notes: `~/Library/Application Support/local-work/notes/`

#### Windows

- **Configuration**: `%APPDATA%\local-work\config.json`
- **Data**: `%LOCALAPPDATA%\local-work\`
  - Tasks: `%LOCALAPPDATA%\local-work\tasks\`
  - Notes: `%LOCALAPPDATA%\local-work\notes\`

### Environment Variable Overrides

You can override default locations using environment variables:

```bash
# Override entire workspace directory
export LOCAL_WORK_DIR=~/my-custom-workspace

# Override only tasks directory
export LOCAL_WORK_TASKS_DIR=~/my-tasks

# Override only notes directory
export LOCAL_WORK_NOTES_DIR=~/my-notes
```

**Priority order**: ENV variables → Active workspace → Default platform location

### Workspace Management

Workspaces allow you to maintain separate task and note collections for different projects:

```bash
# List all workspaces
task workspace list

# Add a workspace for a specific project
task workspace add client-alpha ~/projects/client-alpha

# Switch to that workspace
task workspace switch client-alpha

# Now all tasks and notes are scoped to client-alpha
task list  # Shows only client-alpha tasks
note daily # Creates note in client-alpha workspace

# Switch back to default workspace
task workspace switch default
```

Each workspace has its own isolated:

- Task collection (with independent ID numbering)
- Note collection
- Directory structure

### Migration from Old Locations

If you were using an older version that stored files in the package installation directory, the CLI will automatically detect this and offer to migrate your data:

```bash
$ task list
🔄 Old workspace detected at: /old/location
Would you like to migrate to the new location? (yes/no): yes
✅ Migration completed successfully!
```

You can also manually migrate using:

```bash
task migrate --from /path/to/old/workspace
```

For comprehensive configuration details, see [CONFIGURATION.md](./CONFIGURATION.md).

## Directory Structure

Each workspace maintains this structure:

```
tasks/
  ├── active/       # Tasks currently being worked on
  ├── backlog/      # Tasks waiting to be started
  ├── completed/    # Finished tasks
  └── archived/     # Old completed tasks

notes/
  ├── daily/        # Daily notes (YYYY-MM-DD.md)
  ├── meetings/     # Meeting notes
  ├── technical/    # Technical decisions (ADR-NNN-*.md)
  └── learning/     # Learning notes (TIL-*.md)
```

This structure is automatically created when you initialize a workspace.

### NPM Scripts (local development)

All commands can also be run with `npm run`:

```bash
npm run task:new "Title"
npm run task:list
npm run note:daily
```

## Task Fields

- **id**: Auto-generated (TASK-001, TASK-002, etc)
- **title**: Task title
- **status**: backlog, active, completed, archived
- **priority**: low, medium, high
- **created**: Creation date
- **updated**: Last update date
- **assignee**: Person assigned
- **tags**: Array of tags
- **estimated**: Estimated time (e.g., "8h", "2.5h", "30m")
- **actual**: Actual time spent

## Environment Variables

### Editor Configuration

- `EDITOR`: Your preferred text editor (default: nano)
- `VISUAL`: Alternative editor variable

Set your editor:

```bash
export EDITOR=code  # VS Code
export EDITOR=vim   # Vim
export EDITOR=nano  # Nano
```

Or configure it permanently in the CLI:

```bash
task config set editor code
```

### Directory Overrides

- `LOCAL_WORK_DIR`: Override entire workspace directory
- `LOCAL_WORK_TASKS_DIR`: Override tasks directory only
- `LOCAL_WORK_NOTES_DIR`: Override notes directory only

These take priority over workspace configuration. See [Configuration & Storage](#configuration--storage) for details.

## Color Scheme

The CLI uses colors to improve readability:

- 🟢 **Green**: Success, completed tasks
- 🟡 **Yellow**: Active tasks, warnings
- 🔵 **Blue**: Backlog, info
- 🔴 **Red**: High priority, errors
- ⚪ **Gray**: Archived tasks, dimmed text

## Time Format

Use these formats for time tracking:

- Hours: `2h`, `8h`, `1.5h`
- Minutes: `30m`, `45m`

## Tips & Best Practices

1. **Daily Workflow**: Start your day with `note daily` to plan your work
2. **Task Tracking**: Use `task start` when beginning work and `task done` when finishing
3. **Time Estimates**: Add estimated time when creating tasks for better planning
4. **Tags**: Use tags to categorize related tasks
5. **Search**: Use search to quickly find tasks or notes by keywords
6. **Statistics**: Run `task stats` regularly to track your progress
7. **Archive**: Set up a monthly cron job to archive old completed tasks
8. **Workspaces**: Use separate workspaces for different projects or clients to keep work organized
9. **Editor Preference**: Set your preferred editor once with `task config set editor <editor>` instead of using ENV variables
10. **Backup**: The CLI stores data in standard locations - include these in your backup strategy

## Customization

Edit the CLI scripts to customize:

- Template formats (`cli/task.js`, `cli/note.js`)
- File naming conventions
- Default values
- Color scheme (`cli/utils.js`)
- Output formatting

## Requirements

- Node.js (any recent version)
- No external dependencies required
- Works on Linux, macOS, and Windows

## Version

Current version: 2.0.0

## Changelog

### v2.0.0 (2025-11-01)

- ✨ Added task edit command with auto-editor opening
- ✨ Added task update command for field updates
- ✨ Added task statistics
- ✨ Added note search functionality
- ✨ Auto-open editor after creating notes
- ✨ Improved error handling and validation
- ✨ Better formatted output with icons
- ✨ Created shared utilities module
- ✨ Added npm package support with global CLI executables
- ✨ Added templates included in package
- 🐛 Fixed directory creation issues
- 🐛 Fixed task ID parsing

### v1.0.0

- Initial release with basic task and note management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Jonh Alex](https://github.com/jonhvmp)

## Support

- 🐛 [Report bugs](https://github.com/jonhvmp/local-work/issues)
- 💡 [Request features](https://github.com/jonhvmp/local-work/issues)
- 📖 [Documentation](https://github.com/jonhvmp/local-work#readme)

## Author

**Jonh Alex** ([@jonhvmp](https://github.com/jonhvmp))

---

Made with ❤️ for developers who love productivity

```
- Initial release with basic task and note management
```
