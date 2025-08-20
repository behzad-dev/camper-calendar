import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useCalendarStore } from './calendar';
import { dayKey } from '@/utils/date-helpers.js';

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
});

function seed(store) {
  store.stations = [
    {
      id: 's1',
      name: 'Berlin',
      bookings: [
        {
          id: 'b1',
          pickupReturnStationId: 's1',
          customerName: 'Alice',
          startDate: '2025-08-08T09:00:00.000Z', // Fri
          endDate:   '2025-08-10T12:00:00.000Z', // Sun
        },
      ],
    },
  ];
  store.selectedStationId = 's1';
}

describe('rescheduleBookingEdge', () => {
  test('moves start keeping time-of-day', () => {
    const store = useCalendarStore();
    seed(store);
    const spy = vi.spyOn(store, 'saveStations');

    store.rescheduleBookingEdge({
      id: 'b1',
      which: 'start',
      targetKey: '2025-08-09', // move to Sat
    });

    const b = store.stations[0].bookings[0];
    expect(dayKey(b.startDate)).toBe('2025-08-09');
    expect(new Date(b.startDate).getUTCHours()).toBe(9);
    expect(spy).toHaveBeenCalled();
  });

  test('moves end keeping time-of-day', () => {
    const store = useCalendarStore();
    seed(store);

    store.rescheduleBookingEdge({
      id: 'b1',
      which: 'end',
      targetKey: '2025-08-12', // move to Tue
    });

    const b = store.stations[0].bookings[0];
    expect(dayKey(b.endDate)).toBe('2025-08-12');
    expect(new Date(b.endDate).getUTCHours()).toBe(12);
  });

  test('same: moves both edges', () => {
    const store = useCalendarStore();
    seed(store);

    store.rescheduleBookingEdge({
      id: 'b1',
      which: 'same',
      targetKey: '2025-08-15',
    });

    const b = store.stations[0].bookings[0];
    expect(dayKey(b.startDate)).toBe('2025-08-15');
    expect(dayKey(b.endDate)).toBe('2025-08-15');
    expect(new Date(b.startDate).getUTCHours()).toBe(9);
    expect(new Date(b.endDate).getUTCHours()).toBe(12);
  });

  test('guard: if start > end after move, end is clamped to start', () => {
    const store = useCalendarStore();
    seed(store);
    // Move start ahead of end
    store.rescheduleBookingEdge({
      id: 'b1',
      which: 'start',
      targetKey: '2025-08-20',
    });

    const b = store.stations[0].bookings[0];
    expect(b.endDate).toBe(b.startDate);
  });

  test('guard: if end < start after move, start is clamped to end', () => {
    const store = useCalendarStore();
    seed(store);
    // Move end behind start
    store.rescheduleBookingEdge({
      id: 'b1',
      which: 'end',
      targetKey: '2025-08-05',
    });

    const b = store.stations[0].bookings[0];
    expect(b.startDate).toBe(b.endDate);
  });
});
