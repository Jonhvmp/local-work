# local-work

**Professional CLI toolkit for task and note management v3.0.0**

Streamline your development workflow with organized tasks, daily notes, and meeting logs—all from your terminal.

[![npm version](https://img.shields.io/npm/v/local-work.svg)](https://www.npmjs.com/package/local-work)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jonhvmp/local-work/blob/main/LICENSE)
[![Tests](https://img.shields.io/badge/tests-143%20passing-brightgreen.svg)](https://github.com/jonhvmp/local-work)
[![Portfolio](https://img.shields.io/badge/portfolio-Jonh%20Alex%20portfolio-black.svg)](https://jonhvmp.vercel.app)

---

## :rocket: Quick Start

```bash
# Install globally
npm install -g local-work

# Initialize in your project
cd /path/to/your/project
task init

# Create your first task
task new "Implement user authentication" -p high

# Start working
task start TASK-001

# Take notes
note daily
note meeting "Sprint Planning"
```

---

## :star: Features

### Task Management

- **Auto-incrementing IDs** - Sequential task numbering (TASK-001, TASK-002, ...)
- **Status Workflow** - backlog → active → completed → archived
- **Priority System** - low, medium, high with color coding
- **Time Tracking** - Estimated vs actual time with variance analysis
- **Full-text Search** - Find tasks across all fields

### Note Taking

- **Daily Notes** - One note per day with automatic dating
- **Meeting Notes** - Structured meeting logs with participants and action items
- **Technical Decisions** - Architecture Decision Records (ADRs)
- **Learning Notes** - Today I Learned (TIL) documentation

### Project-Aware (v3.0.0)

- **Git-like Model** - Local workspace (.local-work/) or global workspace
- **Auto-detection** - Works from any subdirectory in your project
- **Global Flag** - Use `-g` or `--global` to access global workspace
- **Zero Config** - Works out of the box with sensible defaults

### Cross-Platform

- **Linux** - XDG Base Directory specification
- **macOS** - Standard ~/Library paths
- **Windows** - AppData directories

---

## :package: Requirements

- **Node.js** >= 18.18.0
- **npm** (included with Node.js)
- Supported platforms: Linux, macOS, Windows

---

## :book: Documentation Structure

<div class="grid cards" markdown>

- :material-download:{ .lg .middle } **Getting Started**

  ***

  Installation, initialization, and basic usage

  [:octicons-arrow-right-24: Installation](getting-started/installation.md)
  [:octicons-arrow-right-24: Configuration](getting-started/configuration.md)
  [:octicons-arrow-right-24: Quick Start](getting-started/quick-start.md)

- :material-checkbox-marked-circle:{ .lg .middle } **User Guide**

  ***

  Complete guides for tasks and notes

  [:octicons-arrow-right-24: Task Management](user-guide/tasks.md)
  [:octicons-arrow-right-24: Note Taking](user-guide/notes.md)

- :material-book-open-variant:{ .lg .middle } **Reference**

  ***

  Complete CLI command reference

  [:octicons-arrow-right-24: Task Commands](reference/task-cli.md)
  [:octicons-arrow-right-24: Note Commands](reference/note-cli.md)

- :material-update:{ .lg .middle } **Migration**

  ***

  Upgrade guides for existing users

  [:octicons-arrow-right-24: v2.x to v3.0](migration/v2-to-v3.md)

</div>

---

## :link: Links

- [:fontawesome-brands-github: GitHub Repository](https://github.com/jonhvmp/local-work)
- [:fontawesome-brands-npm: npm Package](https://www.npmjs.com/package/local-work)
- [:material-file-document: Blog Post](https://jonhvmp.vercel.app/blog/local-work-the-ultimate-cli-toolkit-for-productive-developers)
- [:material-bug: Report Issues](https://github.com/jonhvmp/local-work/issues)

---

## :handshake: Contributing

Contributions are welcome! See the [Contributing Guide](https://github.com/jonhvmp/local-work/blob/main/CONTRIBUTING.md) for details.

---

## :page_with_curl: License

MIT License - see [LICENSE](https://github.com/jonhvmp/local-work/blob/main/LICENSE) for details.
