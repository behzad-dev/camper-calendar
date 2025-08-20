import { test, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useCalendarStore } from './calendar';
import { mondayOfWeek, dayKey } from '@/utils/date-helpers.js';

beforeEach(() => {
  setActivePinia(createPinia());
});

function seed(store) {
  store.stations = [
    {
      id: 'berlin',
      name: 'Berlin',
      bookings: [
        {
          id: 'b1',
          pickupReturnStationId: 'berlin',
          customerName: 'Lena Müller',
          startDate: '2025-04-07T10:00:00.000Z',
          endDate: '2025-04-10T10:00:00.000Z',
        },
        {
          id: 'same',
          pickupReturnStationId: 'berlin',
          customerName: 'Same Day',
          startDate: '2025-04-11T08:00:00.000Z',
          endDate: '2025-04-11T18:00:00.000Z',
        },
      ],
    },
  ];
  store.selectedStationId = 'berlin';
  store.weekStart = mondayOfWeek(new Date('2025-04-09T10:00:00.000Z'));
}

test('bookingsForDay returns start/end matches (including same-day duplicate)', () => {
  const store = useCalendarStore();
  seed(store);

  const mon = new Date('2025-04-07T12:00:00.000Z');
  const fri = new Date('2025-04-11T12:00:00.000Z');
  const thu = new Date('2025-04-10T12:00:00.000Z');

  const monHits = store.bookingsForDay(mon);
  expect(monHits.map((x) => [x.id, x._edge])).toEqual([['b1', 'start']]);

  const thuHits = store.bookingsForDay(thu);
  expect(thuHits.map((x) => [x.id, x._edge])).toEqual([['b1', 'end']]);

  const friHits = store.bookingsForDay(fri);
  expect(friHits.map((x) => [x.id, x._edge])).toEqual([
    ['same', 'start'],
    ['same', 'end'],
  ]);
});

test('week navigation updates Monday correctly', () => {
  const store = useCalendarStore();
  seed(store);

  expect(dayKey(store.weekStart)).toBe('2025-04-07');
  store.nextWeek();
  expect(dayKey(store.weekStart)).toBe('2025-04-14');
  store.prevWeek();
  expect(dayKey(store.weekStart)).toBe('2025-04-07');
  store.thisWeek(); 
  expect(dayKey(store.weekStart)).toBe(dayKey(mondayOfWeek(new Date())));
});
