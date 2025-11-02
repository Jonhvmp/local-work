# Subdirectory Behavior

## Overview

`local-work` is designed to work intelligently in subdirectories, similar to Git's behavior. You can execute commands from anywhere within your project.

## Core Behaviors

### 1. Init Command in Subdirectories

When you run `task init` or `note init` from a subdirectory:

**Automatic Project Root Detection**
**Automatic Project Root Detection**

```bash
# Project structure:
/my-project/
├── .git/                    # <- Project marker
├── package.json            # <- Another marker
└── src/
    └── components/         # <- You are HERE

# Running from subdirectory:
cd /my-project/src/components
task init

# Output:
# [>] Detected project root at: /my-project
#     (../..)
# [+] Local configuration created: .local-work/config.json
#     Project root: /my-project
```

**Behavior:**

1. Checks if config already exists above (prevents duplicates)
2. Detects project root by markers:
   - `.git` (Git repository)
   - `package.json` (Node.js project)
   - `Cargo.toml` (Rust project)
   - `go.mod` (Go project)
   - `pom.xml` (Maven/Java project)
   - `pyproject.toml`, `setup.py` (Python project)
   - `composer.json` (PHP project)
   - `Gemfile` (Ruby project)
3. Creates `.local-work/` at **detected root**
4. Shows clearly where it was created

### 2. Regular Commands in Subdirectories

All commands (`list`, `new`, `view`, etc.) work from any subdirectory:

```bash
# Structure after init:
/my-project/
├── .local-work/
│   └── config.json
├── tasks/
│   ├── active/
│   ├── backlog/
│   └── completed/
└── src/
    └── components/         # <- You can work HERE

# From anywhere within the project:
cd /my-project/src/components
task list                   # Works!
task new "New task"         # Works!
note daily                  # Works!
```

**Behavior:**

1. Searches for `.local-work/config.json` up the directory tree
2. Finds config at project root
3. Uses project configuration
4. All operations use correct directories

## Directory Structure

### Scenario 1: Init from Root (Traditional)

```bash
cd /my-project
task init

# Result:
/my-project/
├── .local-work/
│   └── config.json         # projectRoot: /my-project
├── tasks/
│   ├── active/
│   ├── backlog/
│   ├── completed/
│   └── archived/
└── notes/
    ├── daily/
    ├── meetings/
    ├── technical/
    └── learning/
```

### Scenario 2: Init from Subdirectory (Auto-Detection)

```bash
cd /my-project/src/components
task init

# Result (SAME as scenario 1):
/my-project/                # <- Detected and created HERE
├── .local-work/
│   └── config.json         # projectRoot: /my-project
├── tasks/
└── notes/
```

### Scenario 3: Force Creation in Current Directory

```bash
cd /my-project/src/components
task init --here

# Result:
/my-project/src/components/
├── .local-work/
│   └── config.json         # projectRoot: .../components
├── tasks/
└── notes/
```

> **Note on `--here`**: Rarely needed. Useful only for specific cases where you want isolated config in a subdirectory (e.g., monorepos with multiple projects).

## Detection Algorithm

### Existing Config Search (`findLocalConfig`)

```
Current directory: /project/src/components/ui
                              ↓
1. Check: /project/src/components/ui/.local-work/config.json  ✗
2. Check: /project/src/components/.local-work/config.json     ✗
3. Check: /project/src/.local-work/config.json                ✗
4. Check: /project/.local-work/config.json                    ✓ FOUND!

Uses config from: /project/
```

### Root Detection (`findProjectRoot`)

```
Current directory: /project/src/components/ui
                              ↓
1. Check markers in: /project/src/components/ui/  ✗
2. Check markers in: /project/src/components/     ✗
3. Check markers in: /project/src/                ✗
4. Check markers in: /project/                    ✓ (.git, package.json)

Detected root: /project/
```

## Use Cases

### Case 1: Developer in Subdirectory

```bash
# Working on components
cd /project/src/components
task new "Create login button"
task list

# Working on tests
cd /project/tests/integration
note tech "E2E testing strategy"
```

**Result**: All operations use the same config and directories from root.

### Case 2: Duplicate Prevention

```bash
# Config already exists at root
cd /project/src
task init

# Output:
# [X] Local configuration already exists at: /project/.local-work
# Use existing config or remove it before creating a new one
```

**Result**: Protects against accidental creation of multiple configs.

### Case 3: Project Without Markers

```bash
# Directory without .git, package.json, etc.
cd /my-folder
task init

# Output:
# [!] No project markers found (.git, package.json, etc.)
# Creating config in current directory
# [+] Local configuration created: .local-work/config.json
```

**Result**: Still works, but warns that no markers were detected.

## Benefits

1. **Convenience**: Work from any subdirectory
2. **Safety**: Prevents creation of multiple configs
3. **Intelligence**: Automatically detects root
4. **Compatibility**: Works like Git, familiar to developers
5. **Flexibility**: Allows override with `--here` when needed

## Comparison with Git

| Aspect               | Git                       | local-work                |
| -------------------- | ------------------------- | ------------------------- |
| Root detection       | Searches for `.git/`      | Searches multiple markers |
| Init in subdir       | Creates in current dir    | Creates at detected root  |
| Commands in subdir   | ✓ Works                   | ✓ Works                   |
| Duplicate prevention | May allow nested          | Blocks duplicates         |
| Override             | `git init` always creates | `--here` to force         |

## Tips

1. **Version Control**: Add `.local-work/` to Git to share config with team

   ```bash
   git add .local-work/
   ```

2. **Privacy**: Add `tasks/` and `notes/` to `.gitignore` to keep them private

   ```bash
   echo "tasks/" >> .gitignore
   echo "notes/" >> .gitignore
   ```

3. **Multiple Projects**: Use global workspaces or local configs per project

   ```bash
   # Global config (workspace)
   task workspace add project1 ~/projects/app1

   # Local config (per project)
   cd ~/projects/app2
   task init
   ```

## Troubleshooting

### Config Not Found

```bash
# Check if it exists:
find . -name ".local-work" -type d

# If not, create:
task init
```

### Multiple Configs

```bash
# List all:
find /project -name ".local-work" -type d

# Remove duplicates:
rm -rf /project/src/.local-work  # Keep only root one
```

### Init Creates in Wrong Place

```bash
# If root wasn't detected correctly:
# 1. Add marker (.git or package.json)
# 2. Or use explicit cwd:
cd /project
task init
```

## Complete Example

```bash
# 1. Create project
mkdir my-app && cd my-app
git init
npm init -y

# 2. Structure
mkdir -p src/{components,utils} tests

# 3. Init local-work (from anywhere)
cd src/components
task init
# [>] Detected project root at: /home/user/my-app
# [+] Local configuration created: .local-work/config.json

# 4. Use from any subdirectory
cd ../../tests
task new "Write unit tests"
task list
# * TASK-001 [backlog] Write unit tests

cd ../src/utils
note tech "Utility patterns"

# 5. Verify structure
cd ../..
ls -la
# .local-work/
# tasks/
# notes/
# src/
# tests/
```

## Summary

`local-work` works intelligently and conveniently:

- **Init**: Detects root and creates config there (or use `--here`)
- **Commands**: Work from any subdirectory
- **Safety**: Prevents duplicates
- **Familiar**: Behavior similar to Git
- **Flexible**: Allows customization when needed
