import { render } from '@testing-library/vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import CalendarView from './pages/CalendarView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: CalendarView }],
});

test('renders app header', () => {
  const { getByText } = render(App, {
    global: { plugins: [createPinia(), router] },
  });
  getByText('Camper Calendar');
});
