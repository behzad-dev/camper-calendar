<template>
  <div class="min-h-screen">
    <header
      class="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-sm"
    >
      <div class="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        <h1 class="text-xl font-semibold tracking-tight">Camper Calendar</h1>
        <nav class="ml-auto text-sm">
          <RouterLink class="rounded px-2 py-1 hover:bg-white/10" to="/">Calendar</RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
