import { createRouter, createWebHistory } from 'vue-router';

const CalendarView = () => import('@/pages/CalendarView.vue');
const BookingDetail = () => import('@/pages/BookingDetail.vue');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'calendar', component: CalendarView },
    { path: '/booking/:id', name: 'booking', component: BookingDetail, props: true },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

export default router;
