module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['cli/**/*.js', 'bin/**/*.js', '!**/node_modules/**'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  coverageThreshold: {
    // Utils.js maintains high coverage (pure business logic functions)
    './cli/utils.js': {
      branches: 75,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    // Note: CLI interaction files (task.js, note.js) are validated through:
    // - E2E integration tests (cli.e2e.test.js, task.test.js, note.test.js)
    // - Unit tests for business logic (task.unit.test.js, note.unit.test.js)
    // - Manual testing for readline interaction flows
    //
    // These files use readline for interactive prompts and calculate paths
    // from __dirname at module load time, making traditional unit testing
    // and line coverage metrics impractical. Functional validation through
    // E2E tests provides better quality assurance for CLI tools.
  },
  verbose: true,
  coverageReporters: ['text', 'lcov', 'html'],
};
