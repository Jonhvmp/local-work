/**
 * Task edit operations
 * @module task/edit
 */

const fs = require('fs');
const {
  error,
  info,
  success,
  icons,
  getCurrentDate,
  updateFrontmatter,
  openInEditor,
} = require('../utils');

/**
 * Open task file in default editor
 * @param {string} taskId - Task ID to edit
 * @param {(taskId: string, getTasksDir: () => string) => {file: string, path: string, status: string}|null} findTask - Function to find task
 * @param {() => string} getTasksDir - Function to get tasks directory
 */
async function editTask(taskId, findTask, getTasksDir) {
  const task = findTask(taskId, getTasksDir);

  if (!task) {
    console.log(error(`\n${icons.cross} Task ${taskId} not found\n`));
    return;
  }

  console.log(info(`\n${icons.edit} Opening task in editor...\n`));

  // Store original content to detect changes
  const originalContent = fs.readFileSync(task.path, 'utf8');

  await openInEditor(task.path);

  // Only update 'updated' field if content actually changed
  const newContent = fs.readFileSync(task.path, 'utf8');
  if (newContent !== originalContent) {
    const updatedContent = updateFrontmatter(newContent, 'updated', getCurrentDate());
    fs.writeFileSync(task.path, updatedContent);
    console.log(success(`\n${icons.check} Task updated!\n`));
  } else {
    console.log(info(`\n${icons.info} No changes made\n`));
  }
}

module.exports = {
  editTask,
};
