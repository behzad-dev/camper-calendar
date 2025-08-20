<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format, differenceInCalendarDays } from 'date-fns';
import { fetchBookingDetail } from '@/services/bookings';
import { useCalendarStore } from '@/store/calendar';

const route = useRoute();
const router = useRouter();
const store = useCalendarStore();

const booking = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    if (!store.stations.length) {
      await store.loadStations();
    }

    const id = String(route.params.id);

    let detail = null;
    try {
      detail = await fetchBookingDetail(id);
    } catch (_) {}

    const base = store.bookingById(id)?.booking ?? null;

    if (!detail && !base) {
      error.value = 'Booking not found';
      return;
    }

    booking.value = {
      id,
      customerName: detail?.customerName ?? base?.customerName ?? 'Unknown Customer',
      pickupReturnStationId:
        detail?.pickupReturnStationId ?? base?.pickupReturnStationId ?? store.selectedStationId,
      startDate: detail?.startDate ?? base?.startDate,
      endDate: detail?.endDate ?? base?.endDate,
    };
  } catch (e) {
    error.value = 'Failed to load booking details';
    console.error(e);
  } finally {
    loading.value = false;
  }
});

function duration(start, end) {
  return differenceInCalendarDays(new Date(end), new Date(start));
}
</script>
<template>
  <section class="max-w-xl mx-auto">
    <h2 class="text-xl font-semibold mb-4">Booking Detail</h2>

    <div v-if="loading" class="text-slate-600">Loading…</div>
    <div v-else-if="error" class="text-rose-600">{{ error }}</div>

    <div
      v-else-if="booking"
      class="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        <div class="text-sm text-slate-500">Customer</div>
        <div class="font-medium">{{ booking.customerName }}</div>

        <div class="text-sm text-slate-500">Start</div>
        <div class="font-medium">{{ format(new Date(booking.startDate), 'PPPP') }}</div>

        <div class="text-sm text-slate-500">End</div>
        <div class="font-medium">{{ format(new Date(booking.endDate), 'PPPP') }}</div>

        <div class="text-sm text-slate-500">Duration</div>
        <div class="font-medium">{{ duration(booking.startDate, booking.endDate) }} days</div>

        <div class="text-sm text-slate-500">Station</div>
        <div class="font-medium">
          {{
            store.stations.find((s) => s.id === booking.pickupReturnStationId)?.name ||
            store.stations.find(
              (s) => s.name.toLowerCase() === String(booking.pickupReturnStationId).toLowerCase(),
            )?.name ||
            'Unknown Station'
          }}
        </div>
      </div>

      <div class="pt-2">
        <button
          @click="router.push('/')"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 shadow-sm"
        >
          ← Back to Calendar
        </button>
      </div>
    </div>
  </section>
</template>
