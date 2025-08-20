<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import { useDebounceFn, onClickOutside } from '@vueuse/core';

const props = defineProps({
  modelValue: { type: String, default: '' }, // display text
  fetcher: { type: Function, required: true },
  placeholder: { type: String, default: 'Search…' },
  minChars: { type: Number, default: 2 },
  debounceMs: { type: Number, default: 250 },
  testId: { type: String, default: undefined },
});
const emit = defineEmits(['update:modelValue', 'select']);

const root = ref(null);
const input = ref(null);
const open = ref(false);
const query = ref(props.modelValue);
const options = ref([]);
const loading = ref(false);
const error = ref(null);
const activeIndex = ref(-1);
const listId = `ac-list-${Math.random().toString(36).slice(2)}`;

watch(
  () => props.modelValue,
  (v) => {
    if (v !== query.value) query.value = v;
  },
);

const doSearch = useDebounceFn(async () => {
  const q = query.value?.trim() ?? '';
  if (q.length < props.minChars) {
    options.value = [];
    open.value = false;
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const res = await props.fetcher(q);
    options.value = Array.isArray(res) ? res : [];
    open.value = options.value.length > 0;
    activeIndex.value = options.value.length ? 0 : -1;
  } catch (e) {
    error.value = 'Search failed';
    options.value = [];
    open.value = false;
    console.error(e);
  } finally {
    loading.value = false;
  }
}, props.debounceMs);

watch(query, (v) => {
  emit('update:modelValue', v);
  doSearch();
});

function onKeydown(e) {
  if (!open.value && ['ArrowDown', 'ArrowUp'].includes(e.key)) {
    open.value = options.value.length > 0;
  }
  if (!open.value) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % options.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + options.value.length) % options.value.length;
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (activeIndex.value >= 0) choose(options.value[activeIndex.value]);
  } else if (e.key === 'Escape') {
    open.value = false;
  }
}

function choose(item) {
  query.value = item.label;
  open.value = false;
  emit('select', item);
  nextTick(() => input.value?.blur());
}

onClickOutside(root, () => (open.value = false));

const activeId = computed(() =>
  activeIndex.value >= 0 ? `${listId}-opt-${activeIndex.value}` : undefined,
);
</script>

<template>
  <div ref="root" class="relative w-64">
    <input
      :data-testid="testId"
      ref="input"
      type="text"
      class="w-full rounded border px-3 py-2"
      :placeholder="placeholder"
      :value="query"
      @input="(e) => (query = e.target.value)"
      @focus="open = options.length > 0"
      @keydown="onKeydown"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="listId"
      :aria-activedescendant="activeId"
    />
    <div v-if="loading" class="absolute right-2 top-2 text-xs text-gray-500">…</div>

    <ul
      v-show="open"
      :id="listId"
      role="listbox"
      class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded border bg-white shadow"
    >
      <li
        v-for="(opt, i) in options"
        :key="opt.id"
        :id="`${listId}-opt-${i}`"
        role="option"
        :aria-selected="i === activeIndex"
        class="px-3 py-2 cursor-pointer hover:bg-gray-50"
        :class="i === activeIndex ? 'bg-gray-50' : ''"
        @mouseenter="activeIndex = i"
        @mousedown.prevent="choose(opt)"
      >
        {{ opt.label }}
      </li>

      <li v-if="!options.length && !loading" class="px-3 py-2 text-sm text-gray-500">No results</li>
    </ul>
  </div>
</template>
