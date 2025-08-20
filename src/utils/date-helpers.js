import { addDays, addWeeks } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const TZ = 'Europe/Berlin';

function toDate(d) {
  if (d instanceof Date) return d;
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date input: ${String(d)}`);
  }
  return parsed;
}

// ISO weekday 1..7 (Mon..Sun) in Berlin local time
function isoWeekday(dateLike) {
  return Number(formatInTimeZone(toDate(dateLike), TZ, 'i'));
}

export function mondayOfWeek(baseDate = new Date()) {
  const dow = isoWeekday(baseDate);       // 1..7
  const delta = dow - 1;                  // days since Monday
  return addDays(toDate(baseDate), -delta);
}

export function getWeekDays(weekStartDate = new Date()) {
  const mon = mondayOfWeek(weekStartDate);
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

export function dayKey(dateLike) {
  return formatInTimeZone(toDate(dateLike), TZ, 'yyyy-MM-dd');
}

export function isSameLocalDay(a, b) {
  return dayKey(a) === dayKey(b);
}

export function prevWeek(dateLike) {
  return addWeeks(mondayOfWeek(dateLike), -1);
}

export function nextWeek(dateLike) {
  return addWeeks(mondayOfWeek(dateLike), 1);
}

export function formatRangeLabel(weekStartDate) {
  const days = getWeekDays(weekStartDate);
  const startLabel = formatInTimeZone(toDate(days[0]), TZ, 'MMM d');
  const endLabel = formatInTimeZone(toDate(days[6]), TZ, 'MMM d, yyyy');
  return `${startLabel}–${endLabel}`;
}
