<template>
  <div class="spot-card" @click="$emit('click')">
    <div class="spot-img-wrap">
      <img :src="spot.image" class="spot-img" />
      <div class="img-overlay"></div>
      <span class="rating-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        {{ spot.rating }}
      </span>
    </div>
    <div class="spot-body">
      <div class="spot-top">
        <span class="spot-name">{{ spot.name }}</span>
      </div>
      <div class="tags"><span class="tag" v-for="(t, i) in (spot.tags || []).slice(0, 3)" :key="i">{{ t }}</span></div>
      <div class="spot-meta">
        <span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {{ spot.location }}
        </span>
        <span class="spot-detail-link">查看详情
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ spot: Object })
defineEmits(['click'])
</script>

<style scoped>
.spot-card {
  background: #fff; border-radius: var(--radius-lg); overflow: hidden;
  border: 1px solid rgba(212,168,106,.12); cursor: pointer;
  transition: all var(--normal) var(--ease);
}
.spot-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.spot-card:active { transform: scale(0.985); }
.spot-img-wrap { position: relative; height: 220px; overflow: hidden; }
.spot-img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s var(--ease-out); }
.spot-card:hover .spot-img { transform: scale(1.05); }
.img-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 50%, rgba(44,24,16,.3)); }
.rating-badge {
  position: absolute; bottom: 12px; left: 14px;
  background: rgba(212,168,106,.92); padding: 4px 12px; border-radius: 10px;
  font-size: .78rem; font-weight: 600; color: var(--dark);
  display: flex; align-items: center; gap: 4px;
}
.spot-body { padding: 16px; }
.spot-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.spot-name { font-family: var(--font-serif); font-size: 1.05rem; font-weight: 700; color: var(--dark); flex: 1; }
.spot-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(212,168,106,.12); font-size: .82rem; color: var(--grey); }
.spot-meta span { display: flex; align-items: center; gap: 4px; }
.spot-meta svg { color: var(--brown-light); flex-shrink: 0; }
.spot-detail-link { font-size: .8rem; color: var(--brown); font-weight: 500; }
.spot-detail-link:hover { color: var(--brown-dark); }
</style>
