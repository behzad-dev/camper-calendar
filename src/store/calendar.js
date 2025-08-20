import { defineStore } from 'pinia';
import { fetchStations } from '@/services/stations';
import {
  mondayOfWeek,
  getWeekDays,
  dayKey,
  prevWeek as prevWeekDate,
  nextWeek as nextWeekDate,
} from '@/utils/date-helpers.js';

const LS_STATIONS_KEY = 'cc:stations';
const LS_SELECTED_KEY = 'cc:selectedStationId';

function loadStationsFromLS() {
  try {
    const raw = localStorage.getItem(LS_STATIONS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
function saveStationsToLS(stations) {
  try {
    localStorage.setItem(LS_STATIONS_KEY, JSON.stringify(stations));
  } catch (e) {
    console.warn('Failed to save stations to localStorage', e);
  }
}
function loadSelectedFromLS() {
  try {
    return localStorage.getItem(LS_SELECTED_KEY);
  } catch {
    return null;
  }
}
function saveSelectedToLS(id) {
  try {
    if (id == null) localStorage.removeItem(LS_SELECTED_KEY);
    else localStorage.setItem(LS_SELECTED_KEY, id);
  } catch (e) {
    console.warn('Failed to save selectedStationId', e);
  }
}

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    stations: [],
    selectedStationId: null,
    weekStart: mondayOfWeek(new Date()),
    loading: false,
    error: null,
  }),

  getters: {
    selectedStation(state) {
      return state.stations.find((s) => s.id === state.selectedStationId) || null;
    },
    daysOfWeek(state) {
      return getWeekDays(state.weekStart);
    },

    bookingsForDay() {
      return (dateLike) => {
        const station = this.selectedStation;
        if (!station) return [];
        const key = dayKey(dateLike);
        const out = [];
        for (const b of station.bookings) {
          if (dayKey(b.startDate) === key) out.push({ ...b, _edge: 'start' });
          if (dayKey(b.endDate) === key) out.push({ ...b, _edge: 'end' });
        }
        return out;
      };
    },

    bookingsOverlappingDay() {
      return (dateLike) => {
        const station = this.selectedStation;
        if (!station) return [];
        const key = dayKey(dateLike);
        return station.bookings.filter((b) => {
          const s = dayKey(b.startDate);
          const e = dayKey(b.endDate);
          return s <= key && key <= e;
        });
      };
    },

    bookingById() {
      return (id) => {
        for (const s of this.stations) {
          const found = s.bookings.find((b) => b.id === id);
          if (found) return { booking: found, station: s };
        }
        return null;
      };
    },
  },

  actions: {
    saveStations() {
      saveStationsToLS(this.stations);
    },

    async loadStations() {
      this.loading = true;
      this.error = null;
      try {
        const cached = loadStationsFromLS();
        const cachedSelected = loadSelectedFromLS();

        if (cached) {
          this.stations = cached;
          this.selectedStationId = cachedSelected ?? (cached[0]?.id ?? null);
          return; 
        }

        const stations = await fetchStations();
        this.stations = stations;
        this.selectedStationId = stations[0]?.id ?? null;
        saveStationsToLS(this.stations);
        saveSelectedToLS(this.selectedStationId);
      } catch (e) {
        this.error = 'Failed to load stations.json';
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    setStation(id) {
      this.selectedStationId = id;
      saveSelectedToLS(id); 
    },

    prevWeek() {
      this.weekStart = prevWeekDate(this.weekStart);
    },
    nextWeek() {
      this.weekStart = nextWeekDate(this.weekStart);
    },
    thisWeek() {
      this.weekStart = mondayOfWeek(new Date());
    },

    findBookingById(id) {
      for (const s of this.stations) {
        const b = s.bookings.find((x) => x.id === id);
        if (b) return { booking: b, station: s };
      }
      return null;
    },


    rescheduleBookingEdge({ id, which, targetKey }) {
      const hit = this.findBookingById(id);
      if (!hit) {
        console.warn('Booking not found:', id);
        return;
      }
      const b = hit.booking;

      function moveDateKeepingTime(iso, ymd) {
        const d = new Date(iso);
        const [y, m, dd] = ymd.split('-').map(Number);
        d.setFullYear(y, m - 1, dd);
        return d.toISOString();
      }

      if (which === 'start') {
        b.startDate = moveDateKeepingTime(b.startDate, targetKey);
        if (new Date(b.startDate) > new Date(b.endDate)) {
          b.endDate = b.startDate;
        }
      } else if (which === 'end') {
        b.endDate = moveDateKeepingTime(b.endDate, targetKey);
        if (new Date(b.startDate) > new Date(b.endDate)) {
          b.startDate = b.endDate;
        }
      } else if (which === 'same') {
        b.startDate = moveDateKeepingTime(b.startDate, targetKey);
        b.endDate = moveDateKeepingTime(b.endDate, targetKey);
      }

      console.log('[mock] PATCH /bookings/%s', id, {
        startDate: b.startDate,
        endDate: b.endDate,
      });
      this.saveStations(); 
    },

    rescheduleBooking({ id, edge, newDate }) {
      const key = dayKey(newDate);
      const which = edge === 'start' ? 'start' : 'end';
      this.rescheduleBookingEdge({ id, which, targetKey: key });
    },
  },
});
