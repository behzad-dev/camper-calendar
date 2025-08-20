<script setup>
const props = defineProps({ label: { type: String, required: true } });
const emit = defineEmits(['prev', 'today', 'next']);
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="inline-flex rounded-lg shadow-sm overflow-hidden border">
      <button
        class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700"
        type="button"
        aria-label="Previous week"
        @click="emit('prev')"
      >
        ‹ Prev
      </button>
      <button
        class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border-l"
        type="button"
        aria-label="This week"
        @click="emit('today')"
      >
        Today
      </button>
      <button
        class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border-l"
        type="button"
        aria-label="Next week"
        @click="emit('next')"
      >
        Next ›
      </button>
    </div>

    <div
      class="inline-flex items-center gap-2 rounded-full bg-white shadow border px-3 py-1 text-slate-700"
      data-testid="range-label"
    >
      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
      <span class="text-base font-medium">{{ label }}</span>
    </div>

    <slot name="right" />
  </div>
</template>
