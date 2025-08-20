import { render, fireEvent, screen } from '@testing-library/vue';
import { vi, test, expect } from 'vitest';
import Autocomplete from './Autocomplete.vue';

test('debounced fetch + select emits and updates input', async () => {
  const fetcher = vi.fn(async (q) => {
    return [
      { id: '1', label: 'Berlin' },
      { id: '2', label: 'Munich' },
    ].filter(x => x.label.toLowerCase().includes(q.toLowerCase()));
  });

  const onSelect = vi.fn();

  render(Autocomplete, {
    props: {
      modelValue: '',
      minChars: 1,
      debounceMs: 0,
      fetcher,
      placeholder: 'Type…',
      onSelect,
      testId: 'ac',
    },
  });

  const input = screen.getByTestId('ac');

  await fireEvent.update(input, 'ber');

  // list should open with Berlin
  await screen.findByRole('option'); // wait for at least one option
  const berlin = screen.getByText('Berlin');

  await fireEvent.mouseDown(berlin);

  expect(input.value).toBe('Berlin');

  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith({ id: '1', label: 'Berlin' });
});
