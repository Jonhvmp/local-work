#!/usr/bin/env node

/**
 * Note CLI - Global executable
 * Wrapper for the main note CLI script
 */

const { run } = require('../cli/note/cli');
const { error, icons } = require('../cli/utils');

run().catch((err) => {
  console.error(error(`\n${icons.error} ${err.message}\n`));
  process.exit(1);
});
