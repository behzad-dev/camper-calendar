<script setup>
import { computed } from 'vue';
import { formatInTimeZone } from 'date-fns-tz';
import { TZ, dayKey } from '@/utils/date-helpers.js';

const props = defineProps({
  booking: { type: Object, required: true },
  date: { type: [Date, String, Number], required: true },
});

const isStart = computed(() => dayKey(props.booking.startDate) === dayKey(props.date));
const isEnd = computed(() => dayKey(props.booking.endDate) === dayKey(props.date));

const phase = computed(() => {
  if (isStart.value && isEnd.value) return 'same';
  if (isStart.value) return 'start';
  if (isEnd.value) return 'end';
  return 'mid';
});

const whichEdge = computed(() =>
  phase.value === 'end' ? 'end' : phase.value === 'same' ? 'same' : 'start',
);

const startHM = computed(() => formatInTimeZone(new Date(props.booking.startDate), TZ, 'HH:mm'));
const endHM = computed(() => formatInTimeZone(new Date(props.booking.endDate), TZ, 'HH:mm'));
const name = computed(() => props.booking.customerName || 'Booking #' + props.booking.id);

const colorClass = computed(() => {
  if (phase.value === 'start')
    return 'border-l-4 border-emerald-500 bg-emerald-50 text-emerald-800';
  if (phase.value === 'end') return 'border-l-4 border-rose-500 bg-rose-50 text-rose-800';
  if (phase.value === 'same') return 'border-l-4 border-indigo-500 bg-indigo-50 text-indigo-800';
  return 'border-l-4 border-slate-400 bg-slate-50 text-slate-800';
});

function setPayload(e, which) {
  const payload = {
    type: 'booking-edge',
    id: props.booking.id,
    which, // 'start' | 'end' | 'same'
    originDate: dayKey(props.date),
  };
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', props.booking.id);
  }
}

function onDragStartChip(e) {
  setPayload(e, whichEdge.value);
}
function onDragStartHandle(which, e) {
  e.stopPropagation();
  setPayload(e, which);
}
</script>

<template>
  <router-link
    :to="'/booking/' + booking.id"
    class="group flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1 shadow-sm hover:shadow transition-colors hover:bg-white select-none cursor-grab active:cursor-grabbing"
    :class="colorClass"
    draggable="true"
    @dragstart="onDragStartChip"
  >
    <div class="text-xs font-medium truncate">{{ name }}</div>

    <div class="ml-auto flex items-center gap-1 text-[11px]">
      <span v-if="phase === 'same'">{{ startHM }}&ndash;{{ endHM }}</span>
      <span v-else-if="phase === 'start'">{{ startHM }}</span>
      <span v-else-if="phase === 'end'">{{ endHM }}</span>
    </div>

    <span
      v-if="phase === 'start'"
      class="text-[10px] font-semibold bg-white/70 text-emerald-700 px-1.5 py-0.5 rounded"
    >
      Start
    </span>
    <span
      v-else-if="phase === 'end'"
      class="text-[10px] font-semibold bg-white/70 text-rose-700 px-1.5 py-0.5 rounded"
    >
      End
    </span>

    <div v-else-if="phase === 'same'" class="flex items-center gap-1">
      <button
        class="text-[10px] font-semibold bg-white/70 text-emerald-700 px-1.5 py-0.5 rounded cursor-grab active:cursor-grabbing"
        title="Drag to move start date"
        draggable="true"
        @dragstart.stop="(e) => onDragStartHandle('start', e)"
        @click.stop
      >
        Start
      </button>
      <button
        class="text-[10px] font-semibold bg-white/70 text-rose-700 px-1.5 py-0.5 rounded cursor-grab active:cursor-grabbing"
        title="Drag to move end date"
        draggable="true"
        @dragstart.stop="(e) => onDragStartHandle('end', e)"
        @click.stop
      >
        End
      </button>
    </div>
  </router-link>
</template>
