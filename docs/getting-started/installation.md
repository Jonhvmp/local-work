# Installation

## :package: Prerequisites

Before installing local-work, ensure you have:

- **Node.js** >= 18.18.0
- **npm** (included with Node.js)

Check your versions:

```bash
node --version  # Should be >= 18.18.0
npm --version
```

!!! tip "Installing Node.js"
    If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/) or use a version manager like [nvm](https://github.com/nvm-sh/nvm).

---

## :rocket: Global Installation

Install local-work globally to use `task` and `note` commands from anywhere:

```bash
npm install -g local-work
```

Verify the installation:

```bash
task --help
note --help
```

---

## :arrows_counterclockwise: Updating

Update to the latest version:

```bash
npm update -g local-work
```

Check your current version:

```bash
npm list -g local-work
```

---

## :x: Uninstallation

Remove local-work from your system:

```bash
npm uninstall -g local-work
```

!!! warning "Data Preservation"
    Uninstalling local-work **does not** delete your tasks and notes. Your data remains in:

    - **Linux**: `~/.local/share/local-work/`
    - **macOS**: `~/Library/Application Support/local-work/`
    - **Windows**: `%APPDATA%\local-work\`

    Project-local data remains in `.local-work/` directories.

---

## :computer: Platform-Specific Notes

### Linux

local-work follows the [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html):

- **Config**: `$XDG_CONFIG_HOME/local-work/` (defaults to `~/.config/local-work/`)
- **Data**: `$XDG_DATA_HOME/local-work/` (defaults to `~/.local/share/local-work/`)

### macOS

Standard macOS application directories:

- **Config**: `~/Library/Preferences/local-work/`
- **Data**: `~/Library/Application Support/local-work/`

### Windows

Standard Windows application directories:

- **Config**: `%APPDATA%\local-work\config\`
- **Data**: `%APPDATA%\local-work\`

---

## :wrench: Post-Installation

After installation, you can:

1. **Initialize a project workspace** (recommended):
   ```bash
   cd /path/to/your/project
   task init
   ```

2. **Use global workspace** (for personal tasks):
   ```bash
   task -g new "Personal task"
   note -g daily
   ```

3. **Configure preferences**:
   ```bash
   task config set editor "code"
   task config set autoOpen true
   ```

---

## :material-help-circle: Troubleshooting

### Command Not Found

If `task` or `note` commands are not found after installation:

1. **Verify installation**:
   ```bash
   npm list -g local-work
   ```

2. **Check npm global bin directory**:
   ```bash
   npm config get prefix
   ```

3. **Add to PATH** (if needed):

   **Linux/macOS**:
   ```bash
   echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

   **Windows**:
   Add the npm global bin directory to your System Environment Variables.

### Permission Errors (Linux/macOS)

If you encounter permission errors:

```bash
# Option 1: Use npx (no global installation needed)
npx local-work task new "My task"

# Option 2: Fix npm permissions
# https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
```

---

## :material-arrow-right: Next Steps

- [Configuration](configuration.md) - Set up your preferences
- [Quick Start](quick-start.md) - Create your first task and note
- [Task Management](../user-guide/tasks.md) - Learn task commands
- [Note Taking](../user-guide/notes.md) - Learn note commands
