# Local Work - Onboarding Guide

Welcome to **local-work**! This guide will help you get started with managing tasks and notes efficiently using our CLI tool.

## Table of Contents

- [What is local-work?](#what-is-local-work)
- [Installation](#installation)
- [First-Time Setup](#first-time-setup)
- [Core Concepts](#core-concepts)
- [Your First Task](#your-first-task)
- [Your First Note](#your-first-note)
- [Common Workflows](#common-workflows)
- [Configuration Options](#configuration-options)
- [Team Collaboration](#team-collaboration)
- [Tips for Success](#tips-for-success)
- [Next Steps](#next-steps)
- [Getting Help](#getting-help)

---

## What is local-work?

`local-work` is a lightweight, file-based CLI tool for managing tasks and notes directly from your terminal. It's designed for developers who want to:

- Track tasks with auto-incrementing IDs (TASK-001, TASK-002, etc.)
- Take structured notes (daily logs, meeting notes, technical decisions)
- Work seamlessly across multiple projects
- Collaborate with teams using shared configuration
- Keep everything organized without leaving the command line

**Key Benefits:**

- **No backend required** - Everything stored locally in JSON files
- **Git-friendly** - Commit tasks and notes with your code
- **Multi-project support** - Per-project configuration or global workspaces
- **Simple & Fast** - Pure Node.js, no external dependencies
- **Cross-platform** - Works on Linux, macOS, and Windows

---

## Installation

### Prerequisites

- **Node.js** >= 18.18.0 ([Download Node.js](https://nodejs.org/))

### Install Globally

```bash
npm install -g local-work
```

### Verify Installation

```bash
task --version
note --version
```

You should see version `2.0.1` or higher.

---

## First-Time Setup

### Option 1: Per-Project Configuration (Recommended for Teams)

If you're working on a project with a team or want tasks/notes tied to a specific codebase:

```bash
# Navigate to your project root
cd /path/to/your/project

# Initialize local-work configuration
task init

# This creates:
# .local-work/config.json  <- Configuration file
# tasks/                   <- Task directories (backlog, active, etc.)
# notes/                   <- Note directories (daily, meetings, etc.)
```

**What happens:**

- Creates `.local-work/` directory at your project root
- Detects project root automatically (looks for `.git`, `package.json`, etc.)
- Commands work from any subdirectory within your project
- Configuration can be committed to version control for team sharing

**Example:**

```bash
# Even from a subdirectory...
cd /path/to/project/src/components
task init

# Output:
# [>] Detected project root at: /path/to/project
# [+] Local configuration created: .local-work/config.json
```

### Option 2: Global Workspace (Personal Use)

For managing tasks across multiple projects or personal to-do lists:

```bash
# Create a workspace for personal tasks
task workspace add personal ~/personal-tasks

# Create workspaces for different projects
task workspace add work ~/work-projects
task workspace add client-alpha ~/clients/alpha

# Switch between workspaces
task workspace switch personal
```

**What happens:**

- Stores configuration in platform-specific locations
  - Linux: `~/.config/local-work/` and `~/.local/share/local-work/`
  - macOS: `~/Library/Application Support/local-work/`
  - Windows: `%APPDATA%\local-work\`
- Each workspace has independent task numbering
- Great for context switching between different projects

---

## Core Concepts

### Tasks

Tasks represent work items with:

- **Auto-generated IDs**: `TASK-001`, `TASK-002`, etc.
- **Status workflow**: `backlog` → `active` → `completed` → `archived`
- **Priorities**: `low`, `medium`, `high`
- **Time tracking**: Estimated vs. actual time
- **Tags**: Categorize with custom labels
- **Assignees**: Track who's responsible

**Task Lifecycle:**

```
Create → Start → Update → Complete → Archive
  (backlog)  (active)  (progress)  (completed)  (archived)
```

### Notes

Notes are structured documents for different purposes:

| Type          | Command                | Use Case                                      |
| ------------- | ---------------------- | --------------------------------------------- |
| **Daily**     | `note daily`           | Daily logs, plans, reflections                |
| **Meeting**   | `note meeting "Title"` | Meeting notes with attendees and action items |
| **Technical** | `note tech "Title"`    | Architecture decisions (ADR)                  |
| **Learning**  | `note til "Title"`     | Today I Learned entries                       |

**Naming Convention:**

```
notes/
  daily/2025-01-15.md
  meetings/2025-01-15-sprint-planning.md
  technical/2025-01-15-database-migration.md
  learning/2025-01-15-typescript-generics.md
```

### Configuration Priority

When you run a command, the CLI checks locations in this order:

1. **Local project config** (`.local-work/config.json`) - **Highest priority**
2. **Environment variables** (`LOCAL_WORK_TASKS_DIR`, etc.)
3. **Active workspace** (global workspace configuration)
4. **Default platform location** - **Fallback**

This allows flexibility while maintaining sensible defaults.

---

## Your First Task

Let's create and manage your first task:

### Step 1: Create a Task

```bash
task new "Set up development environment" -p high -e 4h

# Output:
# [+] Task created: TASK-001
# [*] Title: Set up development environment
# [*] Status: backlog
# [*] Priority: high
# [*] Estimated: 4h
```

**Options:**

- `-p, --priority`: Set priority (`low`, `medium`, `high`)
- `-e, --estimated`: Estimate time (`4h`, `2.5h`, `30m`)
- `-t, --tags`: Add tags (`-t backend,security`)
- `-a, --assignee`: Assign to someone

### Step 2: View Your Tasks

```bash
task list

# Output:
# === TASKS: BACKLOG ===
# TASK-001 [high] Set up development environment (est: 4h)
#   Created: 2025-01-15T10:30:00Z
```

### Step 3: Start Working

```bash
task start TASK-001

# Output:
# [*] Task TASK-001 moved to active
```

### Step 4: Track Progress

```bash
# Log actual time spent
task update TASK-001 actual 2h

# Add tags
task update TASK-001 tags backend,devops

# Change priority
task update TASK-001 priority medium
```

### Step 5: Complete the Task

```bash
task done TASK-001

# Output:
# [*] Task TASK-001 marked as completed
```

### Step 6: View Statistics

```bash
task stats

# Output:
# === TASK STATISTICS ===
# Total tasks: 1
# Backlog: 0
# Active: 0
# Completed: 1
# Archived: 0
#
# Completion rate: 100.0%
```

---

## Your First Note

Let's create different types of notes:

### Daily Note

```bash
note daily

# Opens editor with template:
# # Daily Note - 2025-01-15
#
# ## Today's Focus
#
# ## Accomplishments
#
# ## Challenges
#
# ## Tomorrow's Plan
```

**Tip:** Run this every morning to plan your day!

### Meeting Note

```bash
note meeting "Sprint Planning"

# Opens editor with template:
# # Meeting: Sprint Planning
# Date: 2025-01-15
#
# ## Attendees
# -
#
# ## Agenda
# 1.
#
# ## Notes
#
# ## Action Items
# - [ ]
#
# ## Next Meeting
```

### Technical Decision

```bash
note tech "Migrate to microservices architecture"

# Opens editor with ADR template:
# # ADR: Migrate to microservices architecture
# Date: 2025-01-15
# Status: Proposed
#
# ## Context
#
# ## Decision
#
# ## Consequences
#
# ### Positive
#
# ### Negative
#
# ## Alternatives Considered
```

### Learning Note

```bash
note til "Docker multi-stage builds"

# Opens editor with template:
# # TIL: Docker multi-stage builds
# Date: 2025-01-15
#
# ## What I Learned
#
# ## How It Works
#
# ## Example
#
# ## Resources
```

### Search Your Notes

```bash
note search "docker"

# Output:
# === SEARCH RESULTS FOR: docker ===
#
# learning/2025-01-15-docker-multi-stage-builds.md
#   TIL: Docker multi-stage builds
#   Date: 2025-01-15
```

---

## Common Workflows

### Morning Routine

```bash
# 1. Review yesterday's work
task list completed | tail -5

# 2. Plan today
note daily

# 3. Check active tasks
task list active

# 4. Start first task
task start TASK-005
```

### Feature Development Workflow

```bash
# 1. Create task for feature
task new "Implement user authentication" -p high -e 8h -t backend,security

# 2. Start working
task start TASK-010

# 3. Document technical decisions
note tech "JWT vs Session-based auth"

# 4. Log progress throughout the day
task update TASK-010 actual 3h  # After 3 hours
task update TASK-010 actual 6h  # After 6 hours

# 5. Complete when done
task done TASK-010

# 6. Review statistics
task stats
```

### Meeting Workflow

```bash
# Before meeting: Create note
note meeting "Architecture Review"

# During meeting: Take notes in opened editor
# - Add attendees
# - Capture key points
# - List action items

# After meeting: Create tasks from action items
task new "Update API documentation" -p medium -e 2h
task new "Refactor auth service" -p high -e 6h
```

### Weekly Review

```bash
# 1. View completed tasks
task list completed

# 2. Check statistics
task stats

# 3. Archive old completed tasks
task archive 30  # Archive tasks older than 30 days

# 4. Plan next week
note daily
```

---

## Configuration Options

### Set Your Preferred Editor

```bash
# Option 1: CLI configuration (recommended)
task config set editor code  # VS Code
task config set editor vim   # Vim
task config set editor nano  # Nano

# Option 2: Environment variable
export EDITOR=code
```

### Customize Storage Locations

```bash
# Override entire workspace
export LOCAL_WORK_DIR=~/my-workspace

# Override only tasks
export LOCAL_WORK_TASKS_DIR=~/my-tasks

# Override only notes
export LOCAL_WORK_NOTES_DIR=~/my-notes
```

### View Current Configuration

```bash
task config show

# Output:
# === CONFIGURATION ===
# Editor: code
# Tasks Directory: ./tasks
# Notes Directory: ./notes
# Config Source: .local-work/config.json
```

---

## Team Collaboration

### Setting Up for Teams

**1. Project Lead: Initialize configuration**

```bash
cd /path/to/project
task init

# Commit configuration (but not tasks/notes if private)
echo "tasks/" >> .gitignore
echo "notes/" >> .gitignore
git add .local-work/
git commit -m "Add local-work configuration"
git push
```

**2. Team Members: Clone and use**

```bash
git clone <repository>
cd project

# Configuration already present!
task list                         # Works immediately
task new "Implement login page"   # Creates TASK-002 (correct sequence)
```

### Benefits of Shared Configuration

- **Consistent task IDs** - Everyone sees the same task numbers
- **Team standards** - Shared directory structure and conventions
- **Easy onboarding** - New team members get instant setup
- **Git integration** - Configuration versioned with code

### Keeping Tasks Private

If you want shared configuration but private tasks:

```bash
# In .gitignore:
tasks/
notes/

# In version control:
.local-work/config.json  # Shared
```

Each team member has their own tasks, but configuration stays consistent.

---

## Tips for Success

### Task Management

1. **Start small** - Create a few high-priority tasks, not dozens
2. **Use status workflow** - Move tasks through: backlog → active → completed
3. **Log time honestly** - Helps improve estimation skills
4. **Review regularly** - Run `task stats` weekly to track progress
5. **Archive old tasks** - Use `task archive 30` monthly to keep lists clean
6. **Descriptive titles** - Write actionable titles: "Fix login validation" not "Bug"

### Note Taking

1. **Daily notes routine** - Run `note daily` every morning
2. **Meeting templates** - Use `note meeting` for structured meeting notes
3. **Link to tasks** - Reference task IDs in notes (e.g., "See TASK-042")
4. **Search often** - Use `note search` to find past decisions
5. **Consistent naming** - Templates ensure consistent file naming

### Multi-Project Management

1. **Per-project config** - Use `.local-work/` for team projects
2. **Global workspaces** - Use workspaces for personal tasks
3. **Clear workspace names** - Name workspaces clearly: `work`, `personal`, `client-alpha`
4. **Context switching** - Switch workspaces when changing projects
5. **Separate concerns** - Don't mix personal and work tasks

### Time Tracking

1. **Estimate everything** - Add `-e` flag when creating tasks
2. **Update regularly** - Log actual time as you work
3. **Review variance** - Compare estimated vs. actual to improve
4. **Break down large tasks** - Split tasks over 8h into smaller ones

---

## Next Steps

### Explore Advanced Features

```bash
# Edit tasks in your editor
task edit TASK-001

# Add custom tags
task new "Refactor API" -t refactoring,backend,priority

# Manage multiple workspaces
task workspace add side-project ~/side-projects
task workspace switch side-project

# Archive old tasks
task archive 30  # Archive completed tasks older than 30 days
```

### Integrate with Your Workflow

- **Git hooks** - Commit tasks with code changes
- **Scripts** - Create custom automation scripts
- **Templates** - Customize note templates in `templates/`
- **Aliases** - Create shell aliases for common commands:
  ```bash
  alias td="task done"
  alias ts="task start"
  alias tn="task new"
  alias tl="task list"
  ```

### Learn More

- **README.md** - Complete command reference and examples
- **SUBDIRECTORY_BEHAVIOR.md** - Detailed guide on project root detection
- **GitHub Repository** - [github.com/jonhvmp/local-work](https://github.com/jonhvmp/local-work)
- **NPM Package** - [npmjs.com/package/local-work](https://www.npmjs.com/package/local-work)

---

## Getting Help

### Troubleshooting

**Commands not working:**

```bash
# Check configuration
task config show

# Check if you're in the right directory
pwd

# Verify installation
which task
task --version
```

**Task IDs out of sync:**

```bash
# Ensure .local-work/config.json is committed
git status .local-work/

# Pull latest config
git pull
```

**Permission errors (Linux/macOS):**

```bash
# Fix permissions
chmod -R 755 ~/.local/share/local-work/
```

### Support Channels

- **Report bugs** - [GitHub Issues](https://github.com/jonhvmp/local-work/issues)
- **Request features** - [GitHub Issues](https://github.com/jonhvmp/local-work/issues)
- **Documentation** - [README](https://github.com/jonhvmp/local-work#readme)

### Contributing

Want to contribute? Check out the [Contributing Guide](https://github.com/jonhvmp/local-work#contributing) in README.md.

---

## Quick Reference Card

### Essential Task Commands

```bash
task new "Title" -p high -e 4h    # Create task
task list [status]                 # List tasks
task start TASK-001               # Start task
task update TASK-001 actual 2h    # Log time
task done TASK-001                # Complete task
task stats                        # View statistics
```

### Essential Note Commands

```bash
note daily                        # Daily log
note meeting "Title"              # Meeting notes
note tech "Title"                 # Technical decision
note til "Title"                  # Learning note
note search "keyword"             # Search notes
```

### Configuration Commands

```bash
task init                         # Initialize project config
task config show                  # Show current config
task config set editor code       # Set editor
task workspace add <name> <path>  # Add workspace
task workspace switch <name>      # Switch workspace
```

---

**Welcome aboard! Happy task managing!**

Built with care by [Jonh Alex](https://github.com/jonhvmp)
