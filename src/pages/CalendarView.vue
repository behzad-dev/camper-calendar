<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useCalendarStore } from '@/store/calendar';
import * as Dates from '@/utils/date-helpers.js';
import WeekNav from '@/components/WeekNav.vue';
import DayTile from '@/components/DayTile.vue';
import BookingChip from '@/components/BookingChip.vue';
import Autocomplete from '@/components/Autocomplete.vue';

const store = useCalendarStore();

const rangeLabel = computed(() => Dates.formatRangeLabel(store.weekStart));
const days = computed(() => store.daysOfWeek);

const stationText = ref('');
watch(
  () => store.selectedStationId,
  () => {
    stationText.value = store.selectedStation?.name ?? '';
  },
  { immediate: true },
);

async function searchStations(q) {
  return store.stations
    .filter((st) => st.name.toLowerCase().includes(q.toLowerCase()))
    .map((st) => ({ id: st.id, label: st.name }));
}
function onSelectStation(item) {
  store.setStation(item.id);
  stationText.value = item.label;
}

function onPrev() {
  store.prevWeek();
}
function onNext() {
  store.nextWeek();
}
function onToday() {
  store.thisWeek();
}

onMounted(() => {
  store.loadStations();
});
</script>

<template>
  <div class="p-4 space-y-4">
    <WeekNav :label="rangeLabel" @prev="onPrev" @today="onToday" @next="onNext">
      <template #right>
        <div class="flex items-center gap-2">
          <label class="text-sm">Station</label>
          <Autocomplete
            test-id="station-select"
            class="w-72"
            :model-value="stationText"
            @update:modelValue="(v) => (stationText = v)"
            :fetcher="searchStations"
            placeholder="Type to search…"
            :min-chars="2"
            :debounce-ms="250"
            @select="onSelectStation"
          />
        </div>
      </template>
    </WeekNav>

    <div v-if="store.loading" class="text-sm text-slate-600">Loading stations…</div>
    <div v-else-if="store.error" class="text-sm text-rose-600">{{ store.error }}</div>

    <div v-else>
      <div v-if="!store.selectedStationId" class="text-sm text-slate-600">
        Please choose a station to see bookings.
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 lg:gap-4"
        role="grid"
        aria-label="Week grid"
      >
        <DayTile
          v-for="d in days"
          :key="Dates.dayKey(d)"
          :date="d"
          :bookings="store.bookingsForDay(d)"
        >
          <template #booking="{ booking, date }">
            <BookingChip :booking="booking" :date="date" />
          </template>
        </DayTile>
      </div>
    </div>
  </div>
</template>
