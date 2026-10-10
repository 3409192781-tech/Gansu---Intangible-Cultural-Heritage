<template>
  <div class="event-list">
    <div class="event-item" v-for="(ev, i) in events" :key="i">
      <div class="event-date">
        <span class="ev-month">{{ ev.month }}</span>
        <span class="ev-day">{{ ev.day }}</span>
      </div>
      <div class="event-body">
        <div class="ev-title">{{ ev.title }}</div>
        <div class="ev-loc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> {{ ev.location }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ events: { type: Array, default: () => [] } })
</script>

<style scoped>
.event-list { background: #fff; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid rgba(212,168,106,.1); }
.event-item { display: flex; align-items: center; padding: 18px 20px; border-bottom: 1px solid rgba(212,168,106,.1); gap: 16px; }
.event-item:last-child { border-bottom: none; }
.event-date { width: 72px; height: 72px; flex-shrink: 0; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--brown), var(--brown-dark)); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(139,69,19,.2); }
.ev-month { font-size: .72rem; color: var(--gold); font-weight: 500; }
.ev-day { font-size: 1.2rem; font-weight: 700; color: var(--cream); font-family: var(--font-serif); }
.event-body { flex: 1; }
.ev-title { font-family: var(--font-serif); font-size: .95rem; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.ev-loc { font-size: .8rem; color: var(--grey); }
</style>
