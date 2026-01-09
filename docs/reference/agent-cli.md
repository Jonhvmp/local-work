# Agent CLI Reference

Agent integration lets you generate provider-specific agent files from the
local-work instructions and templates. Supports Claude, GitHub Copilot,
Google Gemini, and OpenAI.

---

## :material-robot: Commands

### task agent setup

Create or update an agent file for a provider.

```bash
task agent setup [provider] [--global|--workspace]
task agent setup --provider <name> [--global|--workspace]
```

**Defaults**
- Provider: `claude`
- Scope: interactive prompt (default is global)

**Examples**
```bash
# Default provider (claude), prompt for scope
task agent setup

# Explicit provider
task agent setup --provider claude

# Workspace scope (project-local provider dirs)
task agent setup --provider claude --workspace

# Global scope (home provider dirs)
task agent setup --provider claude --global
```

### task agent list

List agent files for all providers and scopes.

```bash
task agent list
```

### task agent test

Validate the agent file for a provider.

```bash
task agent test [provider] [--global|--workspace]
```

For Markdown agents, the test validates frontmatter (must include `name`).

---

## :material-folder-open: Paths and Scopes

**Workspace (project) paths**

- Claude: `./.claude/agents/localwork.md`
- Copilot: `./.github/agents/localwork.md` (or `./.github/copilot/agents/localwork.md` if present)
- Gemini: `./.config/gemini/agents/localwork.md`
- OpenAI: `./.openai/custom-agents/localwork.md`

**Global (home) paths**

- Claude: `~/.claude/agents/localwork.md`
- Copilot: `~/.github/copilot/agents/localwork.md`
- Gemini: `~/.config/gemini/agents/localwork.md`
- OpenAI: `~/.openai/custom-agents/localwork.md`

---

## :material-file-document: Instruction Sources

The agent content is built from Markdown instructions:

1. `.local-work/localwork.agent.md` (project override, if present)
2. `templates/localwork.agent.md` (default packaged file)

The provider template lives in `templates/agent/<provider>.md` and is replaced
with `{{INSTRUCTIONS}}`.
