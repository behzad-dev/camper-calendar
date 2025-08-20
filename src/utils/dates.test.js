import { expect, test } from 'vitest';
import { mondayOfWeek, getWeekDays, dayKey, isSameLocalDay } from './date-helpers.js';

const BASE = new Date('2025-04-09T10:00:00.000Z'); // Wed

test('mondayOfWeek computes Monday (Berlin local)', () => {
  const monday = mondayOfWeek(BASE);
  expect(dayKey(monday)).toBe('2025-04-07'); // Mon of that week in Berlin
});

test('getWeekDays returns 7 consecutive local days', () => {
  const days = getWeekDays(BASE);
  expect(days).toHaveLength(7);
  expect(dayKey(days[0])).toBe('2025-04-07');
  expect(dayKey(days[6])).toBe('2025-04-13');
});

test('isSameLocalDay compares by Berlin local day', () => {
  const a = new Date('2025-04-07T00:30:00.000Z'); // still Monday Berlin (02:30)
  const b = new Date('2025-04-07T21:59:59.000Z'); // still Monday Berlin (23:59)
  expect(isSameLocalDay(a, b)).toBe(true);
});
