# Note CLI Reference

Complete reference for all note commands in local-work v3.0.0.

---

## :material-flag: Global Flag

All note commands support the global flag:

- `-g` or `--global` - Use global workspace instead of local

**Example:**

```bash
note -g daily             # Create daily note in global workspace
note meeting              # Create meeting note in local workspace (default)
```

---

## :material-calendar: note daily

Create a daily note.

### Syntax

```bash
note [-g] daily [--no-edit]
```

### Parameters

| Parameter      | Type | Required | Description            |
| -------------- | ---- | -------- | ---------------------- |
| `--no-edit`    | flag | No       | Skip opening in editor |
| `-g, --global` | flag | No       | Use global workspace   |

### Examples

```bash
# Today's daily note
note daily

# Without auto-open
note daily --no-edit

# Global workspace
note -g daily
```

### Output

```
✓ Daily note created successfully!

  Date:     2025-11-07
  Type:     daily
  File:     /project/.local-work/notes/daily/2025-11-07.md

  Opening in editor...
```

### Template Structure

```markdown
---
date: 2025-11-07
type: daily
tags: []
---

# Daily Note - November 7, 2025

## Today's Focus

<!-- What are your main priorities today? -->

## Notes

<!-- Your daily notes here -->

## Tomorrow

<!-- What to prepare for tomorrow? -->
```

---

## :material-account-group: note meeting

Create a meeting note.

### Syntax

```bash
note [-g] meeting [title] [--no-edit]
```

**Alias:** `note meet [title]`

### Parameters

| Parameter      | Type   | Required | Description                         |
| -------------- | ------ | -------- | ----------------------------------- |
| `[title]`      | string | No       | Meeting title (prompted if omitted) |
| `--no-edit`    | flag   | No       | Skip opening in editor              |
| `-g, --global` | flag   | No       | Use global workspace                |

### Examples

```bash
# Basic meeting note
note meeting "Sprint Planning"

# Alias
note meet "Team Sync"

# Without auto-open
note meeting "Weekly Review" --no-edit

# Global workspace
note -g meeting "Personal Review"

# Interactive prompt
note meeting
# Prompts: Meeting title?
```

### Output

```
✓ Meeting note created successfully!

  Date:     2025-11-07
  Type:     meeting
  Title:    Sprint Planning
  File:     /project/.local-work/notes/meetings/2025-11-07-sprint-planning.md

  Opening in editor...
```

### Template Structure

```markdown
---
date: 2025-11-07
type: meeting
title: Sprint Planning
attendees: []
tags: []
---

# Meeting: Sprint Planning

**Date:** 2025-11-07
**Attendees:**
**Duration:**

## Agenda

<!-- Meeting agenda items -->

## Discussion

<!-- Meeting notes and discussion -->

## Action Items

- [ ]

## Decisions

<!-- Key decisions made -->
```

---

## :material-book: note tech

Create a technical/ADR note.

### Syntax

```bash
note [-g] tech [title] [--no-edit]
note [-g] technical [title] [--no-edit]
```

### Parameters

| Parameter      | Type   | Required | Description                                |
| -------------- | ------ | -------- | ------------------------------------------ |
| `[title]`      | string | No       | Decision/topic title (prompted if omitted) |
| `--no-edit`    | flag   | No       | Skip opening in editor                     |
| `-g, --global` | flag   | No       | Use global workspace                       |

### Examples

```bash
# Architecture decision record
note tech "Use PostgreSQL"

# Long form
note technical "Adopt Microservices"

# Without auto-open
note tech "Switch to TypeScript" --no-edit

# Global workspace
note -g tech "Personal Tech Choice"

# Interactive prompt
note tech
# Prompts: Decision/topic title?
```

### Output

```
✓ Technical note created successfully!

  Date:     2025-11-07
  Type:     technical
  Title:    Use PostgreSQL
  File:     /project/.local-work/notes/technical/2025-11-07-use-postgresql.md

  Opening in editor...
```

### Template Structure

```markdown
---
date: 2025-11-07
type: technical
title: Use PostgreSQL
status: proposed
tags: [architecture, database]
---

# ADR: Use PostgreSQL

**Status:** Proposed
**Date:** 2025-11-07
**Deciders:**

## Context

<!-- What is the issue that we're addressing? -->

## Decision

<!-- What decision was made? -->

## Consequences

### Positive

-

### Negative

-

## Alternatives Considered

<!-- What other options were evaluated? -->
```

---

## :material-lightbulb: note til

Create a learning/TIL note.

### Syntax

```bash
note [-g] til [title] [--no-edit]
note [-g] learning [title] [--no-edit]
```

### Parameters

| Parameter      | Type   | Required | Description                                |
| -------------- | ------ | -------- | ------------------------------------------ |
| `[title]`      | string | No       | Learning topic title (prompted if omitted) |
| `--no-edit`    | flag   | No       | Skip opening in editor                     |
| `-g, --global` | flag   | No       | Use global workspace                       |

### Examples

```bash
# Today I learned
note til "Git Bisect"

# Long form
note learning "Docker Networking"

# Without auto-open
note til "Regex Lookbehind" --no-edit

# Global workspace
note -g til "Personal Learning"

# Interactive prompt
note til
# Prompts: What did you learn?
```

### Output

```
✓ Learning note created successfully!

  Date:     2025-11-07
  Type:     learning
  Title:    Git Bisect
  File:     /project/.local-work/notes/learning/2025-11-07-git-bisect.md

  Opening in editor...
```

### Template Structure

```markdown
---
date: 2025-11-07
type: learning
title: Git Bisect
tags: [git]
---

# TIL: Git Bisect

**Date:** 2025-11-07
**Topic:** Git Bisect
**Source:**

## What I Learned

<!-- Explain what you learned -->

## Example

<!-- Code example or demonstration -->

## Use Cases

<!-- When to apply this knowledge -->

## References

-
```

---

## :material-pencil: note edit

Edit a note in your configured editor.

### Syntax

```bash
note [-g] edit <note-file>
```

### Parameters

| Parameter      | Type   | Required | Description              |
| -------------- | ------ | -------- | ------------------------ |
| `<note-file>`  | string | Yes      | Note filename or pattern |
| `-g, --global` | flag   | No       | Use global workspace     |

### Examples

```bash
# Full filename
note edit 2025-11-07.md

# Partial match
note edit sprint-planning

# Recent date
note edit 2025-11-07

# Global workspace
note -g edit 2025-11-07
```

### Output

```
✎ Opening note in editor...

✓ Done!
```

---

## :material-view-list: note list

List notes by type or date.

### Syntax

```bash
note [-g] list [type] [--date <date>] [--limit <n>]
```

**Alias:** `note ls [type]`

### Parameters

| Parameter       | Type   | Required | Description                                                 |
| --------------- | ------ | -------- | ----------------------------------------------------------- |
| `[type]`        | string | No       | Filter by type: `daily`, `meeting`, `technical`, `learning` |
| `--date <date>` | string | No       | Filter by date (YYYY-MM-DD)                                 |
| `--limit <n>`   | number | No       | Limit results (default: 20)                                 |
| `-g, --global`  | flag   | No       | Use global workspace                                        |

### Examples

```bash
# All recent notes
note list

# By type
note list daily
note list meeting
note list technical
note list learning

# By date
note list --date 2025-11-07

# Combined filters
note list meeting --date 2025-11-07

# Limit results
note list --limit 10

# Global workspace
note -g list
```

### Output

```
Notes (15)

daily (5 notes)
──────────────────────────────────────────────────────────────
📅 2025-11-07.md
   Created: today

📅 2025-11-06.md
   Created: yesterday

meeting (8 notes)
──────────────────────────────────────────────────────────────
👥 2025-11-07-sprint-planning.md
   Title: Sprint Planning
   Created: today

👥 2025-11-06-team-sync.md
   Title: Team Sync
   Created: yesterday

technical (2 notes)
──────────────────────────────────────────────────────────────
📚 2025-11-05-use-postgresql.md
   Title: Use PostgreSQL
   Status: accepted
   Created: 2 days ago
```

---

## :material-magnify: note search

Search notes by term.

### Syntax

```bash
note [-g] search <term> [--type <type>]
```

**Alias:** `note find <term>`

### Parameters

| Parameter       | Type   | Required | Description                              |
| --------------- | ------ | -------- | ---------------------------------------- |
| `<term>`        | string | Yes      | Search term (searches title and content) |
| `--type <type>` | string | No       | Filter by note type                      |
| `-g, --global`  | flag   | No       | Use global workspace                     |

### Examples

```bash
# Search all notes
note search "authentication"

# Search with spaces
note search "sprint planning"

# Filter by type
note search "database" --type technical

# Alias
note find oauth

# Global workspace
note -g search "personal"
```

### Output

```
Search Results (3)

Searching for: "authentication"

• 2025-11-07-sprint-planning.md (meeting)
  Title: Sprint Planning
  Match: "...discuss authentication implementation..."

• 2025-11-05-use-postgresql.md (technical)
  Title: Use PostgreSQL
  Match: "...user authentication and sessions..."

• 2025-11-03-git-bisect.md (learning)
  Title: OAuth 2.0 Flow
  Match: "...authentication and authorization..."
```

---

## :material-cog: note config

Manage configuration settings.

### Subcommands

#### show

Display current configuration.

```bash
note config show
```

**Output:**

```
Configuration (v3.0.0):

Platform: linux
Config Dir: /home/user/.config/local-work
Data Dir: /home/user/.local/share/local-work

Workspace: local
Tasks Dir: /project/.local-work/tasks
Notes Dir: /project/.local-work/notes

Preferences:
  editor: vim
  autoOpen: true
  colorOutput: true
  archiveDays: 30
```

#### set

Set a preference value.

```bash
note config set <key> <value>
```

**Examples:**

```bash
note config set editor code
note config set autoOpen false
note config set colorOutput true
```

#### get

Get a preference value.

```bash
note config get <key>
```

**Examples:**

```bash
note config get editor
# Output: code

note config get autoOpen
# Output: true
```

---

## :material-folder-open: note open

Open notes directory in file manager.

### Syntax

```bash
note [-g] open
```

### Parameters

| Parameter      | Type | Required | Description           |
| -------------- | ---- | -------- | --------------------- |
| `-g, --global` | flag | No       | Open global workspace |

### Examples

```bash
note open                  # Open local notes directory
note -g open               # Open global notes directory
```

### Output

```
Opening notes directory:
  /project/.local-work/notes
```

---

## :material-rocket: note init

Initialize local-work in current project.

### Syntax

```bash
note init [tasks-dir] [notes-dir]
```

### Parameters

| Parameter     | Type   | Required | Description                                           |
| ------------- | ------ | -------- | ----------------------------------------------------- |
| `[tasks-dir]` | string | No       | Custom tasks directory (default: `.local-work/tasks`) |
| `[notes-dir]` | string | No       | Custom notes directory (default: `.local-work/notes`) |

### Examples

```bash
# Default initialization
note init

# Custom directories
note init custom-tasks custom-notes

# Using different paths
note init ./tasks ./notes
```

### Output

```
Initializing local-work in current project...

✓ Project initialized!

You can now use task and note commands in this directory.
Tasks and notes will be stored in this project.
```

---

## :material-help: note help

Display help information.

### Syntax

```bash
note
note --help
note help
```

### Output

Shows complete usage information with all commands, examples, and options.

---

## :material-format-text: Note Formats

### Date Format

All dates use ISO 8601 format: `YYYY-MM-DD`

**Examples:**

- `2025-11-07`
- `2025-01-15`

### Filename Patterns

| Type      | Pattern                    |
| --------- | -------------------------- |
| Daily     | `YYYY-MM-DD.md`            |
| Meeting   | `YYYY-MM-DD-title-slug.md` |
| Technical | `YYYY-MM-DD-title-slug.md` |
| Learning  | `YYYY-MM-DD-title-slug.md` |

### Title Slugs

Titles are converted to slugs:

- Lowercase
- Spaces replaced with hyphens
- Special characters removed

**Examples:**

- "Sprint Planning" → `sprint-planning`
- "Use PostgreSQL" → `use-postgresql`
- "OAuth 2.0 Flow" → `oauth-20-flow`

---

## :material-file-tree: Directory Structure

```
.local-work/notes/
├── daily/
│   ├── 2025-11-07.md
│   ├── 2025-11-06.md
│   └── 2025-11-05.md
├── meetings/
│   ├── 2025-11-07-sprint-planning.md
│   ├── 2025-11-06-team-sync.md
│   └── 2025-11-05-weekly-review.md
├── technical/
│   ├── 2025-11-05-use-postgresql.md
│   ├── 2025-11-01-adopt-microservices.md
│   └── 2025-10-28-api-versioning.md
└── learning/
    ├── 2025-11-07-git-bisect.md
    ├── 2025-11-03-docker-networking.md
    └── 2025-11-01-regex-lookbehind.md
```

---

## :material-pencil-box: YAML Frontmatter

All notes include YAML frontmatter with metadata:

### Common Fields

| Field  | Type   | Required | Description             |
| ------ | ------ | -------- | ----------------------- |
| `date` | string | Yes      | Note date (YYYY-MM-DD)  |
| `type` | string | Yes      | Note type               |
| `tags` | array  | No       | Tags for categorization |

### Type-Specific Fields

**Meeting:**

- `title` - Meeting title
- `attendees` - List of participants

**Technical:**

- `title` - Decision/topic title
- `status` - `proposed`, `accepted`, `deprecated`, `superseded`

**Learning:**

- `title` - Learning topic title
- `source` - Where you learned it (optional)

---

## :material-keyboard-return: Exit Codes

| Code | Description                                     |
| ---- | ----------------------------------------------- |
| `0`  | Success                                         |
| `1`  | Error (invalid arguments, note not found, etc.) |

---

## :material-arrow-right: See Also

- [Note Taking Guide](../user-guide/notes.md) - Complete note workflow
- [Configuration](../getting-started/configuration.md) - Configure preferences
- [Quick Start](../getting-started/quick-start.md) - Getting started guide
