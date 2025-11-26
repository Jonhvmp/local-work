# Migration Guide: v2.x to v3.x

Guide for migrating from local-work v2.x to v3.x.

---

## :material-new-box: What's New in v3.x

### Major Changes

- **Git-like workspace model** - Local vs. global workspaces with `-g` flag
- **Cross-platform configuration** - XDG-compliant on Linux, platform-specific on macOS/Windows
- **Enhanced CLI** - Improved command structure and aliases
- **Better templates** - Updated note and task templates with richer metadata
- **Time tracking** - Built-in time estimation and tracking for tasks
- **Statistics** - Task statistics with `task stats` command
- **Standup Reports** - Generate daily/weekly standup reports (v3.1.0+)

---

## :material-alert: Breaking Changes

### 1. Directory Structure

**v2.x:**

```
~/local-work/
├── tasks/
└── notes/
```

**v3.x:**

**Local workspace:**

```
/project/.local-work/
├── tasks/
│   ├── backlog/
│   ├── active/
│   ├── completed/
│   └── archived/
└── notes/
    ├── daily/
    ├── meetings/
    ├── technical/
    └── learning/
```

**Global workspace:**

- **Linux:** `~/.local/share/local-work/`
- **macOS:** `~/Library/Application Support/local-work/`
- **Windows:** `%APPDATA%/local-work/`

### 2. Configuration Location

**v2.x:**

```
~/.local-work-config.json
```

**v3.x:**

- **Linux:** `~/.config/local-work/config.json`
- **macOS:** `~/Library/Preferences/local-work/config.json`
- **Windows:** `%APPDATA%/local-work/config.json`

### 3. Workspace Behavior

**v2.x:** All commands used single global directory

**v3.x:**

- By default: Uses **local** workspace (`.local-work/` in current project)
- With `-g` flag: Uses **global** workspace (platform-specific)

**Example:**

```bash
# v2.x - always global
task new "Fix bug"

# v3.x - local by default
task new "Fix bug"              # Creates in .local-work/

# v3.x - explicit global
task -g new "Personal task"     # Creates in global workspace
```

### 4. Task Statuses

**v2.x:** Tasks stored in flat structure

**v3.x:** Tasks organized by status directories:

- `backlog/` - New tasks
- `active/` - In-progress tasks
- `completed/` - Finished tasks
- `archived/` - Archived old tasks

### 5. Note Types

**v2.x:** Generic notes

**v3.x:** Four distinct note types with templates:

- `daily` - Daily notes
- `meeting` - Meeting notes
- `technical` - Architecture Decision Records (ADR)
- `learning` - Today I Learned (TIL)

### 6. Command Changes

| v2.x          | v3.x                          | Notes                              |
| ------------- | ----------------------------- | ---------------------------------- |
| `task create` | `task new`                    | New command name                   |
| `task finish` | `task done`                   | New command name, alias `complete` |
| -             | `task start`                  | New: Move task to active           |
| -             | `task stats`                  | New: Display statistics            |
| -             | `task archive`                | New: Archive old tasks             |
| `note create` | `note daily/meeting/tech/til` | Type-specific commands             |

---

## :material-backup-restore: Migration Steps

### Step 1: Backup Existing Data

Create backup of v2.x data:

```bash
# Backup tasks
cp -r ~/local-work/tasks ~/local-work-backup-tasks

# Backup notes
cp -r ~/local-work/notes ~/local-work-backup-notes

# Backup config
cp ~/.local-work-config.json ~/local-work-backup-config.json
```

### Step 2: Install v3.x

Update to latest version:

```bash
npm install -g local-work
```

Verify installation:

```bash
task --version
# Should show: 3.x.x
```

### Step 3: Initialize Workspace

Choose migration strategy:

#### Option A: Global Workspace (Similar to v2.x)

Continue using global workspace with `-g` flag:

```bash
# All existing commands need -g flag
task -g list
task -g new "Task"
note -g daily
```

**Migrate data using built-in command:**

```bash
task migrate --from ~/local-work/tasks
```

This will:

- Copy tasks to new global location
- Organize by status (backlog/active/completed)
- Preserve all metadata

#### Option B: Project Workspaces (Recommended)

Adopt local workspaces for project-specific organization:

```bash
# In each project directory
cd /path/to/project
task init

# Tasks and notes now stored in /path/to/project/.local-work/
```

**Selective migration:**

```bash
# Copy relevant project tasks
cp ~/local-work/tasks/project-*.md .local-work/tasks/backlog/

# Copy project notes
cp ~/local-work/notes/project-*.md .local-work/notes/daily/
```

#### Option C: Hybrid Approach

Use both local and global workspaces:

```bash
# Work tasks in project
cd /path/to/work-project
task init
task new "Work task"

# Personal tasks global
task -g new "Personal task"
note -g daily
```

### Step 4: Migrate Configuration

Transfer preferences to new config location:

```bash
# View old config
cat ~/.local-work-config.json

# Set preferences in v3.x
task config set editor code
task config set autoOpen true
task config set archiveDays 30

# Verify
task config show
```

### Step 5: Update Task Files

Task files may need frontmatter updates for v3.x features:

**v2.x task:**

```markdown
---
id: TASK-001
title: Fix login bug
status: todo
---

# Task content
```

**v3.x task (enhanced):**

```markdown
---
id: TASK-001
title: Fix login bug
status: active
priority: high
assignee: john
created: 2025-11-07
updated: 2025-11-07
estimated: 2h
actual: 1.5h
tags: [bug, auth]
---

# Task content
```

**Batch update script:**

```bash
#!/bin/bash
# add-task-metadata.sh

for file in .local-work/tasks/*/*.md; do
  # Add missing fields using sed or your preferred tool
  # This is a simplified example
  if ! grep -q "priority:" "$file"; then
    sed -i '/status:/a priority: medium' "$file"
  fi
  if ! grep -q "created:" "$file"; then
    sed -i '/status:/a created: 2025-11-07' "$file"
  fi
done
```

### Step 6: Migrate Notes

Organize notes into type-specific directories:

```bash
# Create directories
mkdir -p .local-work/notes/{daily,meetings,technical,learning}

# Move notes based on naming convention
mv ~/local-work/notes/daily-*.md .local-work/notes/daily/
mv ~/local-work/notes/meeting-*.md .local-work/notes/meetings/
mv ~/local-work/notes/tech-*.md .local-work/notes/technical/
mv ~/local-work/notes/til-*.md .local-work/notes/learning/
```

**Update note frontmatter:**

```bash
#!/bin/bash
# update-note-types.sh

# Daily notes
for file in .local-work/notes/daily/*.md; do
  sed -i 's/type: note/type: daily/' "$file"
done

# Meeting notes
for file in .local-work/notes/meetings/*.md; do
  sed -i 's/type: note/type: meeting/' "$file"
  # Add title field if missing
  if ! grep -q "title:" "$file"; then
    filename=$(basename "$file" .md)
    title=$(echo "$filename" | sed 's/-/ /g' | sed 's/\b\w/\u&/g')
    sed -i "/type:/a title: $title" "$file"
  fi
done
```

### Step 7: Update Scripts and Integrations

If you have automation or scripts using old commands:

**Old script (v2.x):**

```bash
#!/bin/bash
task create "Daily review"
note create "Today's notes"
```

**Updated script (v3.x):**

```bash
#!/bin/bash
# Use local workspace
task new "Daily review"
note daily

# Or use global workspace
task -g new "Daily review"
note -g daily
```

### Step 8: Git Integration

Update `.gitignore` for local workspace:

```bash
# Add to project .gitignore
echo ".local-work/" >> .gitignore
```

If you want to version control tasks/notes:

```bash
# Don't ignore .local-work
# Instead, add to git
git add .local-work/
git commit -m "Add local-work workspace"
```

### Step 9: Verify Migration

Check that everything works:

```bash
# List tasks
task list
task -g list

# List notes
note list
note -g list

# View config
task config show
note config show

# Test new features
task stats
task search "keyword"
note search "keyword"
```

---

## :material-script-text: Migration Automation

Complete migration script:

```bash
#!/bin/bash
# migrate-to-v3.sh

set -e

echo "Local-work v2.x to v3.x Migration Script"
echo "==========================================="

# Backup
echo "Creating backups..."
mkdir -p ~/local-work-v2-backup
cp -r ~/local-work/* ~/local-work-v2-backup/
cp ~/.local-work-config.json ~/local-work-v2-backup/config.json
echo "✓ Backup created at ~/local-work-v2-backup"

# Install v3.x
echo "Installing v3.x..."
npm install -g local-work
echo "✓ Installed $(task --version)"

# Migrate to global workspace
echo "Migrating tasks..."
task migrate --from ~/local-work/tasks
echo "✓ Tasks migrated"

# Set preferences
echo "Migrating configuration..."
if [ -f ~/.local-work-config.json ]; then
  EDITOR=$(jq -r '.editor // "vim"' ~/.local-work-config.json)
  AUTO_OPEN=$(jq -r '.autoOpen // true' ~/.local-work-config.json)

  task config set editor "$EDITOR"
  task config set autoOpen "$AUTO_OPEN"
  echo "✓ Configuration migrated"
fi

# Create local workspace in current directory (optional)
read -p "Initialize local workspace in current directory? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  task init
  echo "✓ Local workspace initialized"
fi

echo ""
echo "Migration completed!"
echo "- Old data backed up to: ~/local-work-v2-backup"
echo "- Global workspace: $(task config get dataDir)"
echo ""
echo "Next steps:"
echo "1. Review migrated data: task -g list"
echo "2. Update your scripts to use 'task -g' for global workspace"
echo "3. Use 'task init' in projects for local workspaces"
```

**Usage:**

```bash
chmod +x migrate-to-v3.sh
./migrate-to-v3.sh
```

---

## :material-alert-circle: Common Issues

### Issue: Commands not found after upgrade

**Problem:** `task: command not found`

**Solution:**

```bash
# Verify npm global bin path
npm config get prefix

# Should be in your PATH
echo $PATH

# Add to PATH if missing (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.npm-global/bin:$PATH"
```

### Issue: Old config not recognized

**Problem:** Preferences not applied after migration

**Solution:**

```bash
# Manually set each preference
task config set editor code
task config set autoOpen true
task config set colorOutput true
task config set archiveDays 30

# Verify
task config show
```

### Issue: Tasks in wrong status directory

**Problem:** All tasks in backlog, should be in active/completed

**Solution:**

```bash
# Move tasks manually
mv .local-work/tasks/backlog/TASK-001* .local-work/tasks/active/

# Or use CLI commands
task start TASK-001
task done TASK-002
```

### Issue: Global workspace not found

**Problem:** `task -g list` shows no tasks

**Solution:**

```bash
# Check global path
task config show

# Verify data exists
ls -la $(task config get dataDir)/tasks

# Re-run migration if needed
task migrate --from ~/local-work/tasks
```

### Issue: Notes not opening in editor

**Problem:** `note daily` creates file but doesn't open

**Solution:**

```bash
# Check editor setting
task config get editor

# Set correct editor
task config set editor code      # VS Code
task config set editor vim       # Vim
task config set editor nano      # Nano

# Or disable auto-open
task config set autoOpen false
```

---

## :material-help-circle: Getting Help

If you encounter issues during migration:

1. **Check version:** `task --version`
2. **View config:** `task config show`
3. **Check paths:** Ensure data directories exist
4. **Review backups:** Original data in backup location
5. **File an issue:** [GitHub Issues](https://github.com/yourusername/local-work/issues)

---

## :material-restore: Rollback to v2.x

If you need to revert:

```bash
# Uninstall v3.x
npm uninstall -g local-work

# Install v2.x
npm install -g local-work@2

# Restore backup
cp -r ~/local-work-v2-backup/* ~/local-work/
cp ~/local-work-v2-backup/config.json ~/.local-work-config.json

# Verify
task --version
```

---

## :material-arrow-right: See Also

- [Configuration Guide](../getting-started/configuration.md) - Workspace model details
- [Quick Start](../getting-started/quick-start.md) - Get started with v3.x
- [Task CLI Reference](../reference/task-cli.md) - All task commands
- [Note CLI Reference](../reference/note-cli.md) - All note commands
