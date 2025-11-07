# Quick Start

Get up and running with local-work in minutes.

---

## :material-download: Install

```bash
npm install -g local-work
```

---

## :material-folder-plus: Initialize Your Project

Navigate to your project and initialize local-work:

```bash
cd /path/to/your/project
task init
```

This creates a `.local-work/` directory for your tasks and notes.

!!! success "Initialization Complete"

````
✓ Project initialized!

    You can now use task and note commands in this directory.
    Tasks and notes will be stored in this project.
    ```

---

## :material-checkbox-marked-circle: Your First Task

### Create a Task

```bash
task new "Implement user authentication" -p high
````

**Flags:**

- `-p <priority>`: Set priority (low, medium, high)
- `-a <assignee>`: Assign to someone
- `--no-edit`: Skip opening in editor

**Output:**

```
✓ Task created successfully!

  ID:       TASK-001
  Title:    Implement user authentication
  Status:   backlog
  Priority: high
  File:     /project/.local-work/tasks/backlog/TASK-001-implement-user-authentication.md

  Opening in editor...
```

The task file is created and opened in your configured editor:

```markdown
---
id: TASK-001
title: Implement user authentication
status: backlog
priority: high
assignee:
created: 2025-11-07
updated: 2025-11-07
estimated:
actual:
tags: []
---

## Description

<!-- Add task description here -->

## Subtasks

- [ ]

## Notes

<!-- Add any additional notes -->
```

### List Tasks

```bash
task list
```

**Output:**

```
Tasks (1)

backlog (1 task)
──────────────────────────────────────────────────────────────
◉ TASK-001: Implement user authentication
  Priority: high | Created: today
```

### Start Working

Move the task to active status:

```bash
task start TASK-001
```

**Output:**

```
✓ Task TASK-001 moved to active
```

### View Task Details

```bash
task view TASK-001
```

**Output:**

```
Task: TASK-001
─────────────────────────────────────────────────────────────

Title:     Implement user authentication
Status:    active
Priority:  high
Assignee:  -
Created:   2025-11-07
Updated:   2025-11-07
Estimated: -
Actual:    -
Tags:      -

File: /project/.local-work/tasks/active/TASK-001-implement-user-authentication.md

─────────────────────────────────────────────────────────────
## Description

<!-- Add task description here -->
```

### Update Task

Add time estimate:

```bash
task update TASK-001 estimated 2h
```

**Output:**

```
✓ Task updated successfully!
   estimated: 2h
```

Update assignee:

```bash
task update TASK-001 assignee Jonh
```

Add tags:

```bash
task update TASK-001 tags backend,security
```

### Complete Task

```bash
task done TASK-001
```

**Output:**

```
✓ Task TASK-001 marked as completed
```

---

## :material-notebook: Your First Note

### Daily Note

Create a daily note for today:

```bash
note daily
```

**Output:**

```
✓ Daily note created!
  File: /project/.local-work/notes/daily/2025-11-07.md

  Opening in editor...
```

The note opens with a template:

```markdown
---
title: Daily Note - 2025-11-07
date: 2025-11-07
type: daily
tags:
  - daily
---

## Today's Focus

## Notes

## Action Items

- [ ]
```

### Meeting Note

```bash
note meeting "Sprint Planning"
```

**Output:**

```
✓ Meeting note created!
  File: /project/.local-work/notes/meetings/2025-11-07-sprint-planning.md

  Opening in editor...
```

Template:

```markdown
---
title: Sprint Planning
date: 2025-11-07
time: 14:30
type: meeting
attendees: []
tags:
  - meeting
---

## Agenda

## Discussion

## Decisions

## Action Items

- [ ]
```

### Technical Decision

```bash
note tech "Migration to TypeScript"
```

Creates an Architecture Decision Record (ADR):

```markdown
---
title: Migration to TypeScript
date: 2025-11-07
type: technical
status: proposed
tags:
  - technical
  - adr
---

## Context

## Decision

## Consequences

## Alternatives Considered
```

### Learning Note

```bash
note til "React Server Components"
```

Creates a Today I Learned (TIL) note:

```markdown
---
title: React Server Components
date: 2025-11-07
type: learning
topic: React
tags:
  - learning
  - til
---

## What I Learned

## Key Takeaways

-

## Resources

-
```

### List Notes

```bash
note list
```

**Output:**

```
Daily Notes (1)
─────────────────────────────────────────────────────────────
◈ 2025-11-07.md
  Date: today

Meetings (1)
─────────────────────────────────────────────────────────────
◈ 2025-11-07-sprint-planning.md
  Date: today

Technical (1)
─────────────────────────────────────────────────────────────
◈ 2025-11-07-migration-to-typescript.md
  Date: today

Learning (1)
─────────────────────────────────────────────────────────────
◈ 2025-11-07-react-server-components.md
  Date: today
```

---

## :material-magnify: Search

### Search Tasks

```bash
task search "authentication"
```

**Output:**

```
Search Results (1)

Searching for: "authentication"

• TASK-001: Implement user authentication
  Status: completed | Priority: high
```

### Search Notes

```bash
note search "sprint"
```

**Output:**

```
Search Results (1)

Searching for: "sprint"

• Sprint Planning
  Type: meetings | Date: today | 2025-11-07-sprint-planning.md
```

---

## :material-chart-bar: Statistics

View task statistics:

```bash
task stats
```

**Output:**

```
Task Statistics

Status Distribution:
  backlog     : 5
  active      : 2
  completed   : 10
  archived    : 3

Priority Distribution:
  low         : 4
  medium      : 8
  high        : 5

Time Tracking:
  Estimated: 16h
  Actual:    14h 30m
  Variance:  1h 30m (under)

Total Tasks: 20
```

---

## :material-sync: Global vs Local Workspace

### Local Workspace (Default)

After running `task init`, all commands use the local workspace:

```bash
task new "Project task"          # Creates in .local-work/tasks/
note daily                        # Creates in .local-work/notes/
```

Works from any subdirectory:

```bash
cd src/components/
task new "Create Button component"  # Still uses project workspace
```

### Global Workspace

Use the `-g` or `--global` flag for personal tasks:

```bash
task -g new "Buy groceries"      # Creates in global workspace
note -g daily                     # Creates in global workspace
task -g list                      # Lists global tasks
```

---

## :material-pencil: Editing

### Edit Task

```bash
task edit TASK-001
```

Opens the task file in your configured editor.

### Edit Note

```bash
note edit 2025-11-07              # Edit by date
note edit sprint-planning         # Edit by pattern
```

---

## :material-archive: Archiving

Archive old completed tasks:

```bash
task archive           # Archive tasks older than 30 days
task archive 60        # Archive tasks older than 60 days
```

**Output:**

```
✓ Archived 5 tasks older than 30 days
```

---

## :material-folder-open: Opening Directories

Open the tasks or notes directory in your file manager:

```bash
task open              # Open local tasks directory
task -g open           # Open global tasks directory
note open              # Open local notes directory
note -g open           # Open global notes directory
```

---

## :material-cog: Configuration

### View Configuration

```bash
task config show
```

### Set Preferences

```bash
task config set editor "code"
task config set autoOpen false
task config set archiveDays 60
```

### Get Preference

```bash
task config get editor
```

---

## :material-help: Getting Help

View command help:

```bash
task                   # Show task help
task --help           # Show task help
note                  # Show note help
note --help          # Show note help
```

---

## :material-arrow-right: Next Steps

Now that you've learned the basics:

- [Task Management Guide](../user-guide/tasks.md) - Complete task workflow
- [Note Taking Guide](../user-guide/notes.md) - All note types explained
- [Configuration](configuration.md) - Customize your setup
- [Task CLI Reference](../reference/task-cli.md) - All task commands
- [Note CLI Reference](../reference/note-cli.md) - All note commands
