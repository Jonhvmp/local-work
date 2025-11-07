<div align="center">
  <img width="800" height="300" alt="local-work-banner" src="https://github.com/user-attachments/assets/18f059f1-23d6-4f43-9886-cabd84105efc" />
</div>

# local-work

[![npm version](https://img.shields.io/npm/v/local-work.svg)](https://www.npmjs.com/package/local-work)
[![CI Status](https://github.com/jonhvmp/local-work/workflows/CI/badge.svg)](https://github.com/jonhvmp/local-work/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.18.0-brightgreen.svg)](https://nodejs.org)
[![Documentation](https://img.shields.io/badge/docs-mkdocs-blue.svg)](https://jonhvmp.github.io/local-work)

> Professional CLI toolkit for task and note management. Streamline your development workflow with organized tasks, daily notes, and meeting logs—all from your terminal.

**📚 [Complete Documentation](https://jonhvmp.github.io/local-work)** | **📝 [Blog Post](https://jonhvmp.vercel.app/blog/local-work-the-ultimate-cli-toolkit-for-productive-developers)**

## Features

✨ **Task Management** - Auto-incrementing IDs, status workflow, priorities, time tracking
📓 **Note Taking** - Daily notes, meeting logs, technical decisions, learning notes
🚀 **Project-Aware** - Works from any subdirectory, detects project root automatically
🔧 **Zero Config** - Works out of the box with sensible defaults
🌍 **Cross-Platform** - Linux, macOS, and Windows support

## Quick Start

### Installation

```bash
npm install -g local-work
```

### Initialize Project

```bash
cd /path/to/your/project
task init
```

### Create Your First Task

```bash
# Create a task
task new "Implement user authentication" -p high

# Start working
task start TASK-001

# Mark as done
task done TASK-001

# List tasks
task list
```

### Take Notes

```bash
# Daily note
note daily

# Meeting note
note meeting "Sprint Planning"

# Technical decision
note tech "Migration to TypeScript"
```

## Documentation

📚 **[Full Documentation](https://jonhvmp.github.io/local-work)**

- [Getting Started](https://jonhvmp.github.io/local-work/getting-started/installation/) - Installation and setup
- [Task Management](https://jonhvmp.github.io/local-work/user-guide/tasks/) - Complete task guide
- [Note Taking](https://jonhvmp.github.io/local-work/user-guide/notes/) - Note types and usage
- [Configuration](https://jonhvmp.github.io/local-work/getting-started/configuration/) - Customization options
- [Task CLI Reference](https://jonhvmp.github.io/local-work/reference/task-cli/) - Task commands
- [Note CLI Reference](https://jonhvmp.github.io/local-work/reference/note-cli/) - Note commands
- [Migration Guide](https://jonhvmp.github.io/local-work/migration/v2-to-v3/) - Upgrading from v2.x

## Requirements

- Node.js ≥ 18.18.0
- Cross-platform: Linux, macOS, Windows

## Contributing

Contributions welcome! Please read our contributing guidelines in the documentation.

```bash
# Fork and clone
git clone https://github.com/jonhvmp/local-work.git
cd local-work

# Install dependencies
npm install

# Run tests
npm test

# Link for local testing
npm link
```

## License

MIT © [Jonh Alex](https://github.com/jonhvmp)

---

**Built for developers who value productivity and simplicity.**
