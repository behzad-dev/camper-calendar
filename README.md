# Camper Calendar

A small calendar app for a campervan rental business. It shows pickups (start dates) and returns (end dates) for each station. You can change weeks, pick stations with autocomplete, view booking details, and move bookings by drag-and-drop.

**Live demo:** `https://behzad-dev.github.io/camper-calendar/`

---

## What it does

- Reusable autocomplete to search and pick a station  
- Week view with 7 day tiles, responsive from mobile to desktop  
- Week navigation: Previous, Today, Next  
- Booking detail page with customer name, dates, duration, and station  
- Drag and drop to move booking start/end or both to another day  
- State handled with Pinia and saved to `localStorage`

---

## Tech

- Vue 3 + Vite  
- Pinia, Vue Router  
- Tailwind CSS  
- date-fns / date-fns-tz  
- Zod  
- Vitest + @testing-library/vue

---

## Setup and run

Requirements: Node 18+ and npm.

```bash
# install dependencies
npm install

# start dev server
npm run dev

# build for production (outputs to dist/)
npm run build

# preview the production build locally
npm run preview