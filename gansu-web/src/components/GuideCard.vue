<template>
  <div class="guide-card" @click="$emit('click')">
    <img :src="guide.coverImage" class="guide-img" />
    <div class="guide-body">
      <div class="guide-top">
        <span class="badge badge-brown" v-if="guide.type === 'itinerary'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> 线路</span>
        <span class="badge badge-gold" v-else><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> 游记</span>
        <span class="guide-views"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> {{ guide.views || 0 }}</span>
      </div>
      <div class="guide-title">{{ guide.title }}</div>
      <p class="guide-summary" v-if="guide.summary">{{ guide.summary }}</p>
      <div class="tags"><span class="tag" v-for="(t, i) in (guide.tags || []).slice(0, 3)" :key="i">{{ t }}</span></div>
    </div>
  </div>
</template>

<script setup>
defineProps({ guide: Object })
defineEmits(['click'])
</script>

<style scoped>
.guide-card { background: #fff; border-radius: var(--radius); overflow: hidden; border: 1px solid rgba(212,168,106,.12); cursor: pointer; transition: all var(--normal) var(--ease); }
.guide-card:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
.guide-card:active { transform: scale(0.985); }
.guide-img { width: 100%; height: 180px; object-fit: cover; }
.guide-body { padding: 14px; }
.guide-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.guide-title { font-family: var(--font-serif); font-size: 1rem; font-weight: 700; color: var(--dark); margin-bottom: 6px; }
.guide-summary { font-size: .82rem; color: var(--grey); margin-bottom: 6px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.guide-views { font-size: .75rem; color: var(--grey-light); display: flex; align-items: center; gap: 3px; }
</style>
