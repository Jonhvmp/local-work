const {
  colorize,
  success,
  error,
  warning,
  info,
  formatDate,
  parseTime,
  formatTime,
} = require('../cli/utils');

describe('Utils Module', () => {
  describe('Color Functions', () => {
    test('colorize should add ANSI color codes', () => {
      const result = colorize('test', 'green');
      expect(result).toContain('\x1b[32m');
      expect(result).toContain('test');
      expect(result).toContain('\x1b[0m');
    });

    test('success should return green text', () => {
      const result = success('Success message');
      expect(result).toContain('\x1b[32m');
      expect(result).toContain('Success message');
    });

    test('error should return red text', () => {
      const result = error('Error message');
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('Error message');
    });

    test('warning should return yellow text', () => {
      const result = warning('Warning message');
      expect(result).toContain('\x1b[33m');
      expect(result).toContain('Warning message');
    });

    test('info should return blue text', () => {
      const result = info('Info message');
      expect(result).toContain('\x1b[34m');
      expect(result).toContain('Info message');
    });
  });

  describe('Date Formatting', () => {
    test('formatDate should return relative date', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = formatDate(today);
      // Should return a string (could be 'today', 'yesterday', or relative)
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('formatDate should handle date strings', () => {
      const oldDate = '2025-01-15';
      const result = formatDate(oldDate);
      // For old dates, should return original string or relative format
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Time Parsing', () => {
    test('parseTime should parse hours correctly', () => {
      expect(parseTime('2h')).toBe(2);
      expect(parseTime('1h')).toBe(1);
    });

    test('parseTime should parse minutes correctly', () => {
      expect(parseTime('30m')).toBe(0.5);
      expect(parseTime('15m')).toBe(0.25);
      expect(parseTime('60m')).toBe(1);
    });

    test('parseTime should parse decimal hours', () => {
      expect(parseTime('2.5h')).toBe(2.5);
      expect(parseTime('1.25h')).toBe(1.25);
    });

    test('parseTime should return null for invalid input', () => {
      expect(parseTime('invalid')).toBeNull();
      expect(parseTime('2x')).toBeNull();
      expect(parseTime('')).toBeNull();
    });
  });

  describe('Time Formatting', () => {
    test('formatTime should format hours correctly', () => {
      expect(formatTime(2)).toBe('2h');
      expect(formatTime(1)).toBe('1h');
    });

    test('formatTime should format hours and minutes', () => {
      expect(formatTime(2.5)).toBe('2h 30m');
      expect(formatTime(1.25)).toBe('1h 15m');
    });

    test('formatTime should handle zero', () => {
      expect(formatTime(0)).toBe('0h');
    });

    test('formatTime should handle minutes only', () => {
      expect(formatTime(0.5)).toBe('30m');
      expect(formatTime(0.25)).toBe('15m');
    });
  });
});
