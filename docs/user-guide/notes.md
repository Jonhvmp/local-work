# Note Taking

Complete guide to taking notes with local-work v3.0.2.

---

## :material-calendar-today: Daily Notes

### Create Daily Note

Create a note for today:

```bash
note daily
```

**Output:**

```
✓ Daily note created!
  File: /project/.local-work/notes/daily/2025-11-07.md

  Opening in editor...
```

### Daily Note Template

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

### Behavior

- **One note per day**: Running `note daily` multiple times on the same day opens the existing note
- **Auto-naming**: File named by date: `YYYY-MM-DD.md`
- **Auto-open**: Opens in your configured editor (unless `--no-edit` flag is used)

### Use Cases

- Daily standup notes
- Work journal
- Daily accomplishments
- Tomorrow's planning

### Example

```markdown
---
title: Daily Note - 2025-11-07
date: 2025-11-07
type: daily
tags:
  - daily
---

## Today's Focus

- Complete user authentication feature
- Review Sarah's PR on dark mode
- Team retrospective at 3pm

## Notes

- Had productive morning session
- Figured out JWT refresh token implementation
- Team decided to use TypeScript for new services

## Action Items

- [x] Finish auth middleware
- [x] Write auth tests
- [ ] Deploy to staging tomorrow
- [ ] Update API documentation
```

---

## :material-account-group: Meeting Notes

### Create Meeting Note

```bash
note meeting "Sprint Planning"
```

**Output:**

```
✓ Meeting note created!
  File: /project/.local-work/notes/meetings/2025-11-07-sprint-planning.md

  Opening in editor...
```

### Meeting Note Template

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

### File Naming

Format: `YYYY-MM-DD-meeting-title.md`

Example: `2025-11-07-sprint-planning.md`

### Use Cases

- Team meetings
- Standups
- Planning sessions
- Retrospectives
- Client calls
- One-on-ones

### Example

```markdown
---
title: Sprint Planning - November 2025
date: 2025-11-07
time: 09:00
type: meeting
attendees:
  - Jonh (Dev)
  - Sarah (Design)
  - Mike (PM)
  - Lisa (QA)
tags:
  - meeting
  - sprint
  - planning
---

## Agenda

1. Review last sprint
2. Plan next sprint goals
3. Estimate stories
4. Assign tasks

## Discussion

### Last Sprint Review

- Completed 12/15 stories
- 2 stories moved to backlog
- Good velocity overall

### Next Sprint Goals

- Focus on authentication feature
- Complete dark mode
- Start OAuth integration

## Decisions

- Use JWT for authentication (not sessions)
- Dark mode toggle in user settings
- OAuth: Support Google and GitHub first

## Action Items

- [ ] Jonh: Implement JWT authentication (5 story points)
- [ ] Sarah: Design OAuth login screens
- [ ] Mike: Create user stories for profile page
- [ ] Lisa: Write test plan for auth feature
```

---

## :material-file-document-outline: Technical Notes (ADR)

### Create Technical Decision Record

```bash
note tech "Migration to TypeScript"
```

**Alias:** `note technical "Migration to TypeScript"`

**Output:**

```
✓ Technical note created!
  File: /project/.local-work/notes/technical/2025-11-07-migration-to-typescript.md

  Opening in editor...
```

### Technical Note Template

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

### File Naming

Format: `YYYY-MM-DD-title.md`

Can also be named as ADR: `ADR-001-title.md`

### Status Values

Common status values for ADRs:

- `proposed` - Under consideration
- `accepted` - Approved and being implemented
- `rejected` - Decided against
- `deprecated` - No longer in use
- `superseded` - Replaced by another decision

### Use Cases

- Architecture decisions
- Technology choices
- Design patterns
- Database schema changes
- API design
- Security decisions

### Example

```markdown
---
title: Migration to TypeScript
date: 2025-11-07
type: technical
status: accepted
tags:
  - technical
  - adr
  - typescript
---

## Context

Our codebase has grown significantly, and we're experiencing:

- Runtime type errors in production
- Difficulty refactoring large files
- Lack of IDE autocomplete for complex objects
- New team members struggling with implicit contracts

We need better type safety and developer experience.

## Decision

We will migrate our entire codebase to TypeScript.

Migration approach:

1. Start with utility functions and types
2. Migrate backend services
3. Migrate frontend components
4. Enable strict mode after 80% migration

Timeline: 3 months

## Consequences

### Positive

- Catch type errors at compile time
- Better IDE support and autocomplete
- Improved code documentation through types
- Easier refactoring
- Better onboarding for new developers

### Negative

- Learning curve for team members unfamiliar with TypeScript
- Initial slowdown in feature development
- Build process becomes more complex
- Need to add types for third-party libraries

## Alternatives Considered

### JSDoc

**Pros:**

- No build step
- Gradual adoption
- Works with existing tooling

**Cons:**

- Verbose syntax
- Not enforced at runtime
- Limited IDE support

**Decision:** Not robust enough for our scale

### Flow

**Pros:**

- Similar to TypeScript
- Good type inference

**Cons:**

- Smaller community
- Less tooling support
- Facebook-centric

**Decision:** TypeScript has better ecosystem

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Migration Guide](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
```

---

## :material-school: Learning Notes (TIL)

### Create Learning Note

```bash
note til "React Server Components"
```

**Alias:** `note learning "React Server Components"`

**Output:**

```
✓ Learning note created!
  File: /project/.local-work/notes/learning/2025-11-07-react-server-components.md

  Opening in editor...
```

### Learning Note Template

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

### File Naming

Format: `YYYY-MM-DD-topic.md`

Example: `2025-11-07-react-server-components.md`

### Use Cases

- New concepts learned
- Technology discoveries
- Problem-solving insights
- Tutorial notes
- Conference takeaways
- Book notes

### Example

````markdown
---
title: React Server Components
date: 2025-11-07
type: learning
topic: React
tags:
  - learning
  - til
  - react
  - nextjs
---

## What I Learned

React Server Components allow components to render on the server, reducing JavaScript bundle size and improving performance.

Key concepts:

- Server Components render once on the server
- Client Components use 'use client' directive
- Automatic code splitting
- Zero bundle size for Server Components

## Key Takeaways

- Server Components can directly access backend resources (databases, file system)
- Cannot use hooks like useState, useEffect in Server Components
- Client Components can import and render Server Components as children
- Great for data fetching and reducing client bundle size
- Next.js App Router uses Server Components by default

## Example Code

```jsx
// app/page.tsx - Server Component by default
async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data.title}</div>;
}

// components/Counter.tsx - Client Component
('use client');
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```
````

## Resources

- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Next.js Server Components Docs](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Dan Abramov's Talk](https://www.youtube.com/watch?v=TQQPAU21ZUw)

## Follow-up

- [ ] Try building a blog with Server Components
- [ ] Compare bundle sizes: Client vs Server Components
- [ ] Learn about streaming and Suspense integration

````

---

## :material-pencil: Editing Notes

### Edit Existing Note

```bash
note edit <pattern>
````

Search by filename or pattern:

```bash
note edit 2025-11-07              # Edit daily note by date
note edit sprint-planning         # Edit meeting by pattern
note edit ADR-001                 # Edit technical decision
note edit react-server            # Edit learning note by pattern
```

**Output:**

```
✓ Opening note in editor...
```

---

## :material-view-list: Listing Notes

### List All Notes

Show all notes across all types:

```bash
note list
```

**Alias:** `note ls`

**Output:**

```
Daily Notes (5)
─────────────────────────────────────────────────────────────
◈ 2025-11-07.md
  Date: today

◈ 2025-11-06.md
  Date: yesterday

◈ 2025-11-05.md
  Date: 2 days ago

Meetings (3)
─────────────────────────────────────────────────────────────
◈ 2025-11-07-sprint-planning.md
  Date: today

◈ 2025-11-06-team-standup.md
  Date: yesterday

Technical (2)
─────────────────────────────────────────────────────────────
◈ 2025-11-07-migration-to-typescript.md
  Date: today

◈ 2025-11-05-api-versioning.md
  Date: 2 days ago

Learning (4)
─────────────────────────────────────────────────────────────
◈ 2025-11-07-react-server-components.md
  Date: today

◈ 2025-11-06-postgresql-indexes.md
  Date: yesterday
```

### List by Type

Filter notes by specific type:

```bash
note list daily
note list meetings
note list technical
note list learning
```

**Example:**

```bash
note list technical
```

**Output:**

```
Technical (2)
─────────────────────────────────────────────────────────────
◈ 2025-11-07-migration-to-typescript.md
  Date: today

◈ 2025-11-05-api-versioning.md
  Date: 2 days ago
```

---

## :material-magnify: Searching Notes

### Search by Term

Find notes by searching titles and content:

```bash
note search <term>
```

**Alias:** `note find <term>`

**Examples:**

```bash
note search "authentication"
note search "react"
note search "sprint planning"
```

**Output:**

```
Search Results (3)

Searching for: "authentication"

• Implement user authentication
  Type: technical | Date: today | 2025-11-07-user-authentication.md

• Sprint Planning - November
  Type: meetings | Date: 2 days ago | 2025-11-05-sprint-planning.md

• JWT Tokens
  Type: learning | Date: yesterday | 2025-11-06-jwt-tokens.md
```

---

## :material-file-tree: Note Directory Structure

```
.local-work/notes/
├── daily/
│   ├── 2025-11-07.md
│   ├── 2025-11-06.md
│   └── 2025-11-05.md
├── meetings/
│   ├── 2025-11-07-sprint-planning.md
│   ├── 2025-11-06-team-standup.md
│   └── 2025-11-05-client-call.md
├── technical/
│   ├── 2025-11-07-migration-to-typescript.md
│   ├── 2025-11-05-api-versioning.md
│   └── ADR-001-database-choice.md
└── learning/
    ├── 2025-11-07-react-server-components.md
    ├── 2025-11-06-postgresql-indexes.md
    └── 2025-11-05-docker-compose.md
```

---

## :material-folder-open: Opening Notes Directory

### Open in File Manager

```bash
note open              # Open local notes directory
note -g open           # Open global notes directory
```

Opens the appropriate directory in your system's file manager.

---

## :material-earth: Global vs Local Notes

### Local Notes (Project-specific)

After running `task init`, notes are project-specific:

```bash
note daily
note meeting "Team standup"
note tech "API design"
```

These create notes in `.local-work/notes/` in your project.

### Global Notes (Personal)

Use `-g` or `--global` for personal notes:

```bash
note -g daily
note -g til "New concept"
```

These create notes in your global workspace.

---

## :material-flag: Command Flags

### --no-edit

Create note without opening in editor:

```bash
note daily --no-edit
note meeting "Standup" --no-edit
note tech "Decision" --no-edit
note til "Concept" --no-edit
```

Useful for automation or batch creation.

---

## :material-lightbulb: Tips & Best Practices

### Daily Notes

**Best practices:**

- Write at the start of the day (planning)
- Update throughout the day
- Review at end of day
- Keep it concise but meaningful

**Template customization:**

```markdown
## Morning Plan

- Priority tasks
- Meetings

## Progress

- What I worked on
- Blockers encountered

## Evening Review

- Completed items
- Tomorrow's priorities
```

### Meeting Notes

**Best practices:**

- Update attendees list
- Note meeting time
- Capture decisions clearly
- Create action items with owners
- Link to related tasks

**Action item format:**

```markdown
## Action Items

- [ ] @Jonh Implement auth endpoint (TASK-001)
- [ ] @sarah Design login screen
- [ ] @mike Update project timeline
```

### Technical Notes

**Best practices:**

- Document context fully
- List alternatives considered
- Be honest about trade-offs
- Update status as decision evolves
- Reference related resources

**Numbering ADRs:**

```bash
note tech "ADR-001: Database Choice"
note tech "ADR-002: Authentication Strategy"
note tech "ADR-003: API Versioning"
```

### Learning Notes

**Best practices:**

- Write immediately after learning
- Include code examples
- Add resource links
- Note follow-up tasks
- Tag by technology/topic

**Organize by topic:**

```markdown
---
tags:
  - learning
  - til
  - react
  - performance
  - optimization
---
```

---

## :material-link: Integration with Tasks

### Link Notes to Tasks

Reference tasks in notes:

```markdown
## Action Items

- [ ] Complete TASK-001: Implement auth
- [ ] Review TASK-005: Update docs
```

Reference notes in tasks:

```markdown
## Resources

- Meeting notes: 2025-11-07-sprint-planning.md
- Technical decision: ADR-001-database-choice.md
```

---

## :material-help-circle: Common Workflows

### Daily Routine

```bash
# Morning
note daily
# Plan your day in the note

# Throughout day
# Update progress in daily note

# Evening
# Review and plan tomorrow
```

### After Meetings

```bash
# Create meeting note
note meeting "Sprint Planning"

# Convert action items to tasks
task new "Implement auth endpoint" -a Jonh -p high
task new "Design login screen" -a sarah -p medium
```

### Learning Something New

```bash
# Create TIL note
note til "Docker Multi-stage Builds"

# Document what you learned
# Add code examples
# Note resources

# Create task if needed
task new "Refactor Dockerfile to use multi-stage builds"
```

### Making Technical Decisions

```bash
# Create ADR
note tech "ADR-003: State Management Library"

# Document:
# - Current problem
# - Considered options
# - Decision and rationale
# - Trade-offs

# Create implementation tasks
task new "Implement Redux store" -p high
task new "Update documentation"
```

---

## :material-arrow-right: Next Steps

- [Task Management Guide](tasks.md) - Learn about tasks
- [Note CLI Reference](../reference/note-cli.md) - Complete command reference
- [Configuration](../getting-started/configuration.md) - Customize note behavior
