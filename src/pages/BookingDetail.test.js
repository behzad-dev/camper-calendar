import { render, screen } from '@testing-library/vue';
import { beforeEach, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

import BookingDetail from './BookingDetail.vue';
import { useCalendarStore } from '@/store/calendar';

vi.mock('@/services/bookings', () => ({
  fetchBookingDetail: vi.fn().mockResolvedValue(null), // API returns nothing
}));

function makeRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [{ path: '/booking/:id', component: BookingDetail }],
  });
}

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
});

test('falls back to store when API detail is missing', async () => {
  const router = makeRouter();
  const store = useCalendarStore();

  store.stations = [
    {
      id: 's1',
      name: 'Berlin',
      bookings: [
        {
          id: '101',
          pickupReturnStationId: 's1',
          customerName: 'New Customer #101',
          startDate: '2025-08-11T09:00:00.000Z',
          endDate: '2025-08-15T12:00:00.000Z',
        },
      ],
    },
  ];
  store.selectedStationId = 's1';

  router.push('/booking/101');
  await router.isReady();

  render(BookingDetail, {
    global: { plugins: [router] },
  });

  await screen.findByText('Booking Detail');      
  await screen.findByText('New Customer #101');  

  screen.getByText(/Duration/i);
  screen.getByText('Berlin');
});
