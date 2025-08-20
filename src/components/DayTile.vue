<script setup>
import { computed, ref } from 'vue';
import { formatInTimeZone } from 'date-fns-tz';
import { TZ, dayKey } from '@/utils/date-helpers.js';
import { useCalendarStore } from '@/store/calendar';

const store = useCalendarStore();

const props = defineProps({
  date: { type: [Date, String, Number], required: true },
  bookings: { type: Array, default: () => [] },
});

const heading = computed(() => formatInTimeZone(new Date(props.date), TZ, 'EEE d'));
const dayId = computed(() => dayKey(props.date));
const count = computed(() => props.bookings.length);

const isOver = ref(false);

function onDragOver(e) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  isOver.value = true;
}
function onDragLeave() {
  isOver.value = false;
}
function onDrop(e) {
  e.preventDefault();
  isOver.value = false;

  let payload = null;
  try {
    const raw = e.dataTransfer?.getData('application/json') || '{}';
    payload = JSON.parse(raw);
  } catch {
    return;
  }
  if (!payload || payload.type !== 'booking-edge') return;

  store.rescheduleBookingEdge({
    id: payload.id,
    which: payload.which, // 'start' | 'end' | 'same'
    targetKey: dayId.value, // YYYY-MM-DD of this tile
  });
}
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 min-h-[140px] flex flex-col gap-2 transition ring-offset-2"
    role="gridcell"
    :aria-label="`Day ${dayId}`"
    :class="isOver ? 'ring-2 ring-indigo-300' : ''"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="flex items-baseline justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-slate-800">{{ heading }}</span>
        <span class="text-[11px] text-slate-500">{{ dayId }}</span>
      </div>
      <span
        class="ml-auto text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
        :data-testid="`count-${dayId}`"
      >
        {{ count }}
      </span>
    </div>

    <div class="flex flex-col gap-1">
      <slot :bookings="bookings" :date="date">
        <div v-if="!bookings.length" class="text-sm text-slate-400 italic">No bookings</div>
        <div v-else class="flex flex-col gap-1">
          <slot name="booking" v-for="b in bookings" :key="b.id" :booking="b" :date="date" />
        </div>
      </slot>
    </div>
  </div>
</template>
