# Contributing to local-work

First off, thank you for considering contributing to this project! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to provide a welcoming and inspiring community for all. Please be respectful and constructive.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/jonhvmp/local-work.git
   cd local-work
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/jonhvmp/local-work.git
   ```

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Link the package globally** for testing:
   ```bash
   npm link
   ```

3. **Run tests** to verify setup:
   ```bash
   npm test
   ```

4. **Run linting**:
   ```bash
   npm run lint
   ```

## How to Contribute

### Types of Contributions

- 🐛 **Bug fixes** - Fix issues or unexpected behavior
- ✨ **Features** - Add new functionality or commands
- 📝 **Documentation** - Improve or add documentation
- 🎨 **Code quality** - Refactoring, performance improvements
- 🧪 **Tests** - Add or improve test coverage

### Workflow

1. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes** following the coding standards

3. **Test your changes**:
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes** with a clear message:
   ```bash
   git commit -m "feat: add time tracking command"
   # or
   git commit -m "fix: resolve task status transition bug"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for test additions/changes
   - `refactor:` for code refactoring
   - `chore:` for maintenance tasks

5. **Push to your fork**:
   ```bash
   git push origin your-branch-name
   ```

6. **Open a Pull Request** on GitHub

## Coding Standards

### JavaScript Style

- We use **ESLint** and **Prettier** for code formatting
- Run `npm run format` before committing
- Use **ES6+** features (const/let, arrow functions, template literals)
- Prefer **const** over let when possible
- Use **meaningful variable names**

### Code Organization

```javascript
// Good
const createTask = (title, priority) => {
  const taskId = generateTaskId();
  return { id: taskId, title, priority };
};

// Avoid
var t = function (x, y) {
  return { i: id(), t: x, p: y };
};
```

### File Structure

- **CLI commands** → `cli/` directory
- **Utilities** → `utils/` directory
- **Templates** → `templates/` directory
- **Tests** → `__tests__/` directory
- **Bin executables** → `bin/` directory

## Testing Guidelines

### Writing Tests

- Place tests in `__tests__/` directory
- Name test files with `.test.js` suffix
- Use descriptive test names

```javascript
describe('Task CLI', () => {
  test('should create task with valid ID format', () => {
    const taskId = generateTaskId();
    expect(taskId).toMatch(/^TASK-\d{3}$/);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Strategy

Our project uses a multi-layered testing approach optimized for CLI tools:

#### 1. **Utils Functions (High Coverage)**
- **Target**: 85%+ line coverage
- **Type**: Pure unit tests
- **Location**: `__tests__/utils.test.js`
- Functions in `cli/utils.js` are pure business logic with no I/O dependencies
- Full coverage ensures reliability of color formatting, date parsing, frontmatter handling, etc.

#### 2. **CLI Commands (E2E + Logic Validation)**
- **Type**: Integration and end-to-end tests
- **Location**:
  - `__tests__/cli.e2e.test.js` - End-to-end command execution
  - `__tests__/task.test.js` - Task CLI integration tests
  - `__tests__/note.test.js` - Note CLI integration tests
  - `__tests__/task.unit.test.js` - Business logic validation
  - `__tests__/note.unit.test.js` - Business logic validation

CLI files (`task.js`, `note.js`) use `readline` for interactive prompts and calculate paths from `__dirname` at module load time. Traditional line coverage metrics are impractical for these files. Instead, we validate:

- ✅ **Functional behavior** through E2E tests
- ✅ **Business logic** (ID generation, validation rules, search algorithms)
- ✅ **File structure** and frontmatter formatting
- ✅ **User workflows** via manual testing

#### 3. **Coverage Thresholds**

```javascript
// jest.config.js
coverageThreshold: {
  './cli/utils.js': {
    statements: 85,
    branches: 75,
    lines: 85,
    functions: 85
  }
  // CLI interaction files validated through E2E tests
}
```

### Coverage Requirements

- **Utils.js**: Maintain 85%+ coverage (pure business logic)
- **CLI files**: E2E tests + logic validation (interaction code)
- Add tests for new features
- Update tests when modifying existing code

**Note**: Don't be discouraged by overall coverage percentages. For CLI tools with `readline` interaction, comprehensive E2E tests provide better quality assurance than line coverage metrics.

## Pull Request Process

1. **Update documentation** if needed (README, CHANGELOG)
2. **Add tests** for new functionality
3. **Ensure all tests pass**: `npm test`
4. **Ensure linting passes**: `npm run lint`
5. **Update CHANGELOG.md** with your changes
6. **Fill out the PR template** completely
7. **Link related issues** using keywords (fixes #123)

### PR Checklist

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Self-review completed
- [ ] No console.log or debug code

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Description** - Clear and concise description
- **Steps to reproduce** - Numbered steps
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Environment**:
  - OS: [e.g., Ubuntu 22.04]
  - Node version: [e.g., 18.0.0]
  - Package version: [e.g., 2.0.0]
- **Screenshots** - If applicable

### Feature Requests

When requesting features, please include:

- **Problem description** - What problem does this solve?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other approaches you thought of
- **Use cases** - Real-world scenarios

## Questions?

- Open an issue with the `question` label
- Check existing issues and discussions first
- Be specific about what you need help with

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🚀
