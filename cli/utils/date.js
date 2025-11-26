/**
 * Date and time utilities
 * @module utils/date
 */

/**
 * Format date string to relative time
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted relative date (e.g., "today", "2 days ago")
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return dateString.toString();
}

/**
 * Parse time string to hours
 * @param {string} timeStr - Time string (e.g., "2h", "30m", "1.5h")
 * @returns {number|null} Time in hours, or null if invalid format
 */
function parseTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const match = timeStr.match(/^(\d+\.?\d*)([hm])$/);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2];

  return unit === 'h' ? value : value / 60;
}

/**
 * Format hours to human-readable time string
 * @param {number} hours - Hours to format
 * @returns {string} Formatted time (e.g., "2h 30m")
 */
function formatTime(hours) {
  if (hours === 0) return '0h';

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 * @returns {string} Current date
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current time in HH:MM format
 * @returns {string} Current time
 */
function getCurrentTime() {
  return new Date().toTimeString().split(' ')[0].substring(0, 5);
}

/**
 * Get current date and time in ISO-like format
 * @returns {string} Current datetime (YYYY-MM-DD HH:MM:SS)
 */
function getCurrentDateTime() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Check if a date string is from today
 * @param {string|undefined} dateStr - Date string to check
 * @returns {boolean} True if date is today
 */
function isToday(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date string is from yesterday
 * @param {string|undefined} dateStr - Date string to check
 * @returns {boolean} True if date is yesterday
 */
function isYesterday(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Check if a date string is within this week (Monday to Sunday)
 * @param {string|undefined} dateStr - Date string to check
 * @returns {boolean} True if date is this week
 */
function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();

  // Get Monday of current week
  const monday = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  // Get Sunday of current week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return date >= monday && date <= sunday;
}

/**
 * Get day name in English
 * @param {Date} date - Date object
 * @returns {string} Day name
 */
function getDayName(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Format date to long format
 * @param {Date} date - Date object
 * @returns {string} Formatted date (e.g., "Wednesday, November 26, 2025")
 */
function formatDateLong(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

module.exports = {
  formatDate,
  parseTime,
  formatTime,
  getCurrentDate,
  getCurrentTime,
  getCurrentDateTime,
  isToday,
  isYesterday,
  isThisWeek,
  getDayName,
  formatDateLong,
};
