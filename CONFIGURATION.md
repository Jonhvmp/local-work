# Configuration System - Local Work CLI

## Overview

The Local Work CLI now includes a comprehensive cross-platform configuration system that follows industry standards for file storage and workspace management.

## Platform-Specific Storage

### Linux (XDG Base Directory)

- **Config**: `~/.config/local-work/config.json`
- **Data**: `~/.local/share/local-work/`
- **Tasks**: `~/.local/share/local-work/tasks/`
- **Notes**: `~/.local/share/local-work/notes/`

Environment variable overrides:

- `XDG_CONFIG_HOME` - Custom config directory
- `XDG_DATA_HOME` - Custom data directory

### macOS

- **Config & Data**: `~/Library/Application Support/local-work/`
- **Tasks**: `~/Library/Application Support/local-work/tasks/`
- **Notes**: `~/Library/Application Support/local-work/notes/`

### Windows

- **Config**: `%APPDATA%\local-work\config.json`
- **Data**: `%LOCALAPPDATA%\local-work\`
- **Tasks**: `%LOCALAPPDATA%\local-work\tasks\`
- **Notes**: `%LOCALAPPDATA%\local-work\notes\`

## Configuration File

The `config.json` file stores all settings and workspace information:

```json
{
  "version": "2.0.0",
  "workspaces": {
    "default": {
      "name": "default",
      "path": "/home/user/.local/share/local-work",
      "active": true,
      "description": "Default workspace",
      "createdAt": "2025-11-02T00:00:00.000Z"
    }
  },
  "activeWorkspace": "default",
  "editor": "vim",
  "preferences": {
    "colorOutput": true,
    "autoArchive": true,
    "archiveDays": 30,
    "defaultPriority": "medium",
    "defaultTaskStatus": "backlog"
  },
  "sync": {
    "enabled": false,
    "provider": null,
    "lastSync": null
  },
  "firstRun": false
}
```

## Workspace Management

Workspaces allow you to maintain separate sets of tasks and notes for different projects or contexts.

### Commands

#### List Workspaces

```bash
task workspace list
note workspace list
```

Output:

```
Workspaces:

  ● active default
    Path: /home/user/.local/share/local-work
    Description: Default workspace

  ○ inactive project-x
    Path: /home/user/projects/x/.local-work
    Description: Project X workspace
```

#### Add Workspace

```bash
task workspace add <name> <path> [description]
```

Examples:

```bash
task workspace add frontend ~/projects/frontend "Frontend project"
task workspace add backend ~/projects/backend
```

#### Switch Workspace

```bash
task workspace switch <name>
note workspace switch <name>
```

Example:

```bash
task workspace switch frontend
# ✓ Switched to workspace 'frontend'
#   Tasks: /home/user/projects/frontend/tasks
```

#### Remove Workspace

```bash
task workspace remove <name> [--delete-files]
```

Examples:

```bash
# Remove workspace but keep files
task workspace remove old-project

# Remove workspace AND delete all files
task workspace remove old-project --delete-files
```

## Configuration Management

### View Configuration

```bash
task config show
note config show
```

Output:

```
Configuration:

Platform: linux
Config Dir: /home/user/.config/local-work
Data Dir: /home/user/.local/share/local-work

Active Workspace: default
Tasks Dir: /home/user/.local/share/local-work/tasks
Notes Dir: /home/user/.local/share/local-work/notes

Preferences:
  colorOutput: true
  autoArchive: true
  archiveDays: 30
  defaultPriority: medium
  defaultTaskStatus: backlog
```

### Set Preference

```bash
task config set <key> <value>
```

Examples:

```bash
task config set colorOutput false
task config set autoArchive true
task config set archiveDays 60
task config set defaultPriority high
```

### Get Preference

```bash
task config get <key>
```

Example:

```bash
task config get editor
# vim
```

## Environment Variables

Override default locations with environment variables:

### Priority Order

1. **Specific directory** (highest priority)
   - `LOCAL_WORK_TASKS_DIR` - Custom tasks location
   - `LOCAL_WORK_NOTES_DIR` - Custom notes location

2. **Workspace directory**
   - `LOCAL_WORK_DIR` - Custom workspace root

3. **Active workspace** (from config)

4. **Platform default** (lowest priority)

### Examples

```bash
# Use custom tasks directory
export LOCAL_WORK_TASKS_DIR="/custom/path/tasks"
task list

# Use custom workspace
export LOCAL_WORK_DIR="/projects/myproject"
task new "Feature implementation"
note daily
```

## Migration

### Automatic Migration

On first run, the CLI will detect existing tasks/notes in old locations and offer to migrate them:

```
🎉 Welcome to local-work CLI!

📁 Found existing tasks/notes at: /home/user/old-location

Would you like to migrate your existing files? (y/n): y

Migrating from: /home/user/old-location
           to: /home/user/.local/share/local-work

Migrating tasks...
  ✓ Migrated 42 task files
Migrating notes...
  ✓ Migrated 15 note files

✓ Migration complete! Migrated 57 files

Your old files are still in the original location.
You can safely delete them after verifying the migration.
```

### Manual Migration

```bash
task migrate --from /path/to/old/location
```

## Opening Directories

Quickly open the tasks or notes directory in your file manager:

```bash
task open   # Opens tasks directory
note open   # Opens notes directory
```

Platform-specific behavior:

- **Linux**: Uses `xdg-open`
- **macOS**: Uses `open`
- **Windows**: Uses `explorer`

## Preferences Reference

| Key                 | Type    | Default     | Description                     |
| ------------------- | ------- | ----------- | ------------------------------- |
| `colorOutput`       | boolean | `true`      | Enable colored terminal output  |
| `autoArchive`       | boolean | `true`      | Automatically archive old tasks |
| `archiveDays`       | number  | `30`        | Days before tasks are archived  |
| `defaultPriority`   | string  | `"medium"`  | Default priority for new tasks  |
| `defaultTaskStatus` | string  | `"backlog"` | Default status for new tasks    |

## Best Practices

### Use Workspaces for Different Projects

```bash
# Create workspace for each project
task workspace add project-a ~/projects/a
task workspace add project-b ~/projects/b

# Switch between them as needed
task workspace switch project-a
task new "Implement feature X"

task workspace switch project-b
task new "Fix bug Y"
```

### Environment Variables for CI/CD

```bash
# In CI/CD pipeline
export LOCAL_WORK_DIR="/tmp/ci-workspace"
export LOCAL_WORK_TASKS_DIR="/tmp/ci-tasks"

# Tasks will be created in CI-specific location
task new "Build project"
task done TASK-001
```

### Shared Team Workspace

```bash
# Point to shared network drive (with caution!)
export LOCAL_WORK_DIR="/mnt/team-share/project-x"

# Or use workspace
task workspace add team-x /mnt/team-share/project-x
task workspace switch team-x
```

## Troubleshooting

### Config File Corrupted

Delete the config file and it will be recreated:

```bash
# Linux/macOS
rm ~/.config/local-work/config.json

# Windows
del %APPDATA%\local-work\config.json

# Next command will create new config
task config show
```

### Wrong Directory

Check where files are being stored:

```bash
task config show
```

### Permission Errors

Ensure you have write permissions:

```bash
# Linux/macOS - check permissions
ls -ld ~/.config/local-work
ls -ld ~/.local/share/local-work

# Fix permissions if needed
chmod 755 ~/.config/local-work
chmod 755 ~/.local/share/local-work
```

### Migration Failed

Manually copy files:

```bash
# Linux/macOS
cp -r /old/location/tasks ~/.local/share/local-work/
cp -r /old/location/notes ~/.local/share/local-work/

# Windows
xcopy /E C:\old\location\tasks %LOCALAPPDATA%\local-work\tasks\
xcopy /E C:\old\location\notes %LOCALAPPDATA%\local-work\notes\
```

## Advanced Usage

### Multiple Configurations

Use different configurations for different purposes:

```bash
# Development workspace
task workspace add dev ~/dev-workspace
task config set autoArchive false  # Keep all tasks

# Personal workspace
task workspace add personal ~/personal
task config set archiveDays 7  # Archive faster
```

### Script Integration

```bash
#!/bin/bash
# Backup script

# Switch to project workspace
task workspace switch my-project

# Archive old tasks
task archive 30

# Export tasks
cp -r $(task config show | grep "Tasks Dir" | cut -d: -f2) /backup/
```

## Migration Guide

### From Version 1.x

The old version saved files in `<project-root>/tasks/` and `<project-root>/notes/`.

When upgrading:

1. Run any `task` or `note` command
2. CLI will detect old files and prompt for migration
3. Choose 'yes' to migrate automatically
4. Verify files in new location
5. Delete old files when satisfied

### Manual Migration

If automatic migration fails:

```bash
# 1. Find old location
ls -la ~/documents/github/ecosystem-jrs-soft/local-work/

# 2. Run migration
task migrate --from ~/documents/github/ecosystem-jrs-soft/local-work

# 3. Verify
task list
note list
```

## Future Enhancements

Planned features:

- Cloud sync support (Google Drive, Dropbox, OneDrive)
- Team collaboration features
- Web interface for browsing tasks/notes
- Mobile app integration
- Git-based versioning

## Support

For issues or questions:

- GitHub: https://github.com/jonhvmp/local-work
- Issues: https://github.com/jonhvmp/local-work/issues
