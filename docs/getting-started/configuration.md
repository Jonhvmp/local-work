# Configuration

local-work v3.x uses a **Git-like workspace model** with both local and global configurations.

---

## :material-file-tree: Workspace Model

### Local Workspace (Project-specific)

When you run `task init` in a project directory, local-work creates a `.local-work/` folder:

```
your-project/
├── .local-work/
│   ├── config.json          # Local configuration
│   ├── tasks/               # Project tasks
│   │   ├── active/
│   │   ├── backlog/
│   │   ├── completed/
│   │   └── archived/
│   └── notes/               # Project notes
│       ├── daily/
│       ├── meetings/
│       ├── technical/
│       └── learning/
└── (your project files)
```

**Commands run from any subdirectory** automatically use the local workspace.

### Global Workspace (Personal)

Global workspace is stored in platform-specific locations:

=== "Linux"

````
~/.local/share/local-work/
├── tasks/
└── notes/

    ~/.config/local-work/
    └── config.json
    ```

=== "macOS"
````

~/Library/Application Support/local-work/
├── tasks/
└── notes/

    ~/Library/Preferences/local-work/
    └── config.json
    ```

=== "Windows"
`     %APPDATA%\local-work\
    ├── tasks\
    ├── notes\
    └── config\
        └── config.json
    `

Use the `-g` or `--global` flag to access the global workspace:

```bash
task -g list          # List global tasks
note -g daily         # Create global daily note
```

---

## :material-cog: Configuration File

### Structure

The `config.json` file contains:

```json
{
  "version": "3.1.1",
  "global": {
    "tasksDir": "/home/user/.local/share/local-work/tasks",
    "notesDir": "/home/user/.local/share/local-work/notes"
  },
  "preferences": {
    "editor": "vim",
    "autoOpen": true,
    "dateFormat": "YYYY-MM-DD",
    "colorOutput": true,
    "autoArchive": false,
    "archiveDays": 30,
    "defaultPriority": "medium",
    "defaultTaskStatus": "backlog"
  },
  "sync": {
    "enabled": false,
    "provider": null,
    "lastSync": null
  },
  "createdAt": "2025-11-07T10:00:00.000Z",
  "updatedAt": "2025-11-07T10:00:00.000Z"
}
```

### Preferences

| Key                 | Type    | Default        | Description                              |
| ------------------- | ------- | -------------- | ---------------------------------------- |
| `editor`            | string  | `"vim"`        | Default text editor for opening files    |
| `autoOpen`          | boolean | `true`         | Auto-open files in editor after creation |
| `dateFormat`        | string  | `"YYYY-MM-DD"` | Date format for notes and tasks          |
| `colorOutput`       | boolean | `true`         | Enable colored terminal output           |
| `autoArchive`       | boolean | `false`        | Automatically archive old tasks          |
| `archiveDays`       | number  | `30`           | Days before auto-archiving tasks         |
| `defaultPriority`   | string  | `"medium"`     | Default priority for new tasks           |
| `defaultTaskStatus` | string  | `"backlog"`    | Default status for new tasks             |

---

## :material-console: Managing Configuration

### View Configuration

Display current configuration:

```bash
task config show
```

Output example:

```
Configuration (v3.1.1):

Platform: linux
Config Dir: /home/user/.config/local-work
Data Dir: /home/user/.local/share/local-work

Workspace: local
Tasks Dir: /home/user/project/.local-work/tasks
Notes Dir: /home/user/project/.local-work/notes

Preferences:
  editor: vim
  autoOpen: true
  dateFormat: YYYY-MM-DD
  colorOutput: true
  autoArchive: false
  archiveDays: 30
  defaultPriority: medium
  defaultTaskStatus: backlog
```

### Set Preferences

Update a preference value:

```bash
task config set <key> <value>
```

**Examples:**

```bash
# Set editor
task config set editor "code"              # VS Code
task config set editor "nvim"              # Neovim
task config set editor "subl"              # Sublime Text

# Set auto-open behavior
task config set autoOpen false             # Disable auto-open

# Set archive settings
task config set autoArchive true           # Enable auto-archive
task config set archiveDays 60             # Archive after 60 days

# Set default priority
task config set defaultPriority high       # Default to high priority

# Set color output
task config set colorOutput false          # Disable colors
```

### Get Preferences

Retrieve a specific preference value:

```bash
task config get <key>
```

**Examples:**

```bash
task config get editor
# Output: code

task config get autoOpen
# Output: true

task config get archiveDays
# Output: 30
```

---

## :material-rocket: Initialization

### Initialize Local Project

Create a local workspace in the current directory:

```bash
cd /path/to/your/project
task init
```

Custom directories (relative to project root):

```bash
task init custom-tasks custom-notes
```

This creates:

```
.local-work/
├── config.json
├── custom-tasks/
│   ├── active/
│   ├── backlog/
│   ├── completed/
│   └── archived/
└── custom-notes/
    ├── daily/
    ├── meetings/
    ├── technical/
    └── learning/
```

### Behavior After Initialization

Once initialized:

- **All commands** use the local workspace by default
- Commands work from **any subdirectory** in the project
- Use `-g` flag to access global workspace when needed

```bash
# These all use the local workspace
task new "Implement feature"
note daily

# These use the global workspace
task -g new "Personal task"
note -g daily
```

---

## :material-folder-open: Opening Directories

Open the tasks or notes directory in your file manager:

```bash
# Open local tasks directory
task open

# Open global tasks directory
task -g open

# Open local notes directory
note open

# Open global notes directory
note -g open
```

Platform-specific behavior:

- **Linux**: Uses `xdg-open`
- **macOS**: Uses `open`
- **Windows**: Uses `explorer`

---

## :material-swap-horizontal: Migration

### Migrate from v2.x to v3.0

If you're upgrading from v2.x, migrate your old data:

```bash
task migrate --from /old/path/to/tasks
```

See the [Migration Guide](../migration/v2-to-v3.md) for detailed instructions.

---

## :material-pencil: Editor Configuration

### Supported Editors

local-work opens files in your configured editor. Common editors:

| Editor           | Command | Notes                    |
| ---------------- | ------- | ------------------------ |
| **Vim**          | `vim`   | Default                  |
| **Neovim**       | `nvim`  |                          |
| **VS Code**      | `code`  | Requires VS Code in PATH |
| **Sublime Text** | `subl`  | Requires Sublime in PATH |
| **Nano**         | `nano`  |                          |
| **Emacs**        | `emacs` |                          |

### Set Your Editor

```bash
task config set editor "code"
```

### Environment Variable

You can also set the `EDITOR` environment variable:

```bash
export EDITOR="code"
```

local-work will use this if no editor is configured in preferences.

---

## :material-file-code: File Structure

### Task File Format

Tasks are Markdown files with YAML frontmatter:

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
- [ ] Create auth middleware
- [ ] Add login endpoint
- [ ] Add logout endpoint

## Notes

Using jsonwebtoken library for token generation.
```

### Note File Format

Notes are also Markdown with YAML frontmatter:

```markdown
---
title: Daily Note - 2025-11-07
date: 2025-11-07
type: daily
tags:
  - daily
---

## Today's Focus

- Complete authentication feature
- Review pull requests

## Notes

- Had a productive morning session
- Team standup at 10am

## Action Items

- [ ] Finish auth middleware
- [ ] Deploy to staging
```

---

## :material-arrow-right: Next Steps

- [Quick Start](quick-start.md) - Create your first task and note
- [Task Management](../user-guide/tasks.md) - Learn task workflows
- [Note Taking](../user-guide/notes.md) - Learn note types
- [Task CLI Reference](../reference/task-cli.md) - All task commands
