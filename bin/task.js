#!/usr/bin/env node

/**
 * Task CLI - Global executable
 * Wrapper for the main task CLI script
 */

const { run } = require('../cli/task/cli');
const { error, icons } = require('../cli/utils');

run().catch((err) => {
  console.error(error(`\n${icons.error} ${err.message}\n`));
  process.exit(1);
});
