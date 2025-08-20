import { beforeEach, expect, test, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';

import CalendarView from './CalendarView.vue';
import { useCalendarStore } from '@/store/calendar';
import * as Dates from '@/utils/date-helpers.js';

beforeEach(() => {
  setActivePinia(createPinia());
});

function seedWeekAndStations(store) {
  store.weekStart = Dates.mondayOfWeek(new Date('2025-04-09T10:00:00.000Z'));

  store.stations = [
    {
      id: 'berlin',
      name: 'Berlin',
      bookings: [
        {
          id: 'b1',
          pickupReturnStationId: 'berlin',
          customerName: 'Lena Müller',
          startDate: '2025-04-07T10:00:00.000Z', // Monday start
          endDate: '2025-04-10T10:00:00.000Z',   // Thursday end
        },
        {
          id: 'same',
          pickupReturnStationId: 'berlin',
          customerName: 'Same Day',
          startDate: '2025-04-11T08:00:00.000Z', // Friday start
          endDate: '2025-04-11T18:00:00.000Z',   // Friday end (same day)
        },
      ],
    },
    {
      id: 'munich',
      name: 'Munich',
      bookings: [
        {
          id: 'm1',
          pickupReturnStationId: 'munich',
          customerName: 'Max',
          startDate: '2025-04-08T12:00:00.000Z', // Tuesday
          endDate: '2025-04-12T12:00:00.000Z',   // Saturday
        },
      ],
    },
  ];

  // Default to Berlin
  store.selectedStationId = 'berlin';
}

test('range label updates on Prev/Next', async () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const store = useCalendarStore();

  store.loadStations = vi.fn();

  seedWeekAndStations(store);

  render(CalendarView, {
    global: {
      plugins: [pinia],
    },
  });

  const initial = Dates.formatRangeLabel(store.weekStart);
  expect(screen.getByTestId('range-label').textContent).toBe(initial);

  await fireEvent.click(screen.getByText(/next/i));
  const nextLabel = Dates.formatRangeLabel(
    Dates.nextWeek(Dates.mondayOfWeek(new Date('2025-04-09T10:00:00.000Z')))
  );
  expect(screen.getByTestId('range-label').textContent).toBe(nextLabel);

  await fireEvent.click(screen.getByText(/prev/i));
  expect(screen.getByTestId('range-label').textContent).toBe(initial);
});

test('changing station updates per-day counts', async () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const store = useCalendarStore();

  store.loadStations = vi.fn();

  seedWeekAndStations(store);

  render(CalendarView, {
    global: {
      plugins: [pinia],
      stubs: {
        'router-link': { template: '<a><slot /></a>' },
      },
    },
  });

  const monKey = '2025-04-07';
  const friKey = '2025-04-11';
  const tueKey = '2025-04-08';

  expect(screen.getByTestId(`count-${monKey}`).textContent).toBe('1');
  expect(screen.getByTestId(`count-${friKey}`).textContent).toBe('2');
  expect(screen.getByTestId(`count-${tueKey}`).textContent).toBe('0');

  await fireEvent.update(screen.getByTestId('station-select'), 'Munich');
  store.setStation('munich');
  await nextTick();

  expect(screen.getByTestId(`count-${monKey}`).textContent).toBe('0');
  expect(screen.getByTestId(`count-${friKey}`).textContent).toBe('0');
  expect(screen.getByTestId(`count-${tueKey}`).textContent).toBe('1');
});
