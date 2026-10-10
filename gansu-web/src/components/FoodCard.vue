<template>
  <div class="food-card" @click="$emit('click')">
    <div class="food-img-wrap">
      <img :src="food.image" class="food-img" />
      <span class="food-badge">推荐</span>
    </div>
    <div class="food-info">
      <div class="food-top">
        <span class="food-name">{{ food.name }}</span>
        <span class="food-rating" v-if="food.rating">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          {{ food.rating }}
        </span>
      </div>
      <div class="tags"><span class="tag" v-for="(t, i) in (food.tags || []).slice(0, 3)" :key="i">{{ t }}</span></div>
      <span class="food-area">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        {{ food.area || food.location }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({ food: Object })
defineEmits(['click'])
</script>

<style scoped>
.food-card { display: flex; background: #fff; border-radius: var(--radius); overflow: hidden; margin-bottom: 14px; border: 1px solid rgba(212,168,106,.12); cursor: pointer; transition: all var(--normal) var(--ease); }
.food-card:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
.food-card:active { transform: scale(0.985); }
.food-img-wrap { position: relative; width: 160px; flex-shrink: 0; }
.food-img { width: 100%; height: 100%; object-fit: cover; }
.food-badge { position: absolute; top: 10px; left: 10px; background: var(--orange); color: #fff; padding: 2px 10px; border-radius: 8px; font-size: .7rem; font-weight: 600; }
.food-info { flex: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
.food-top { display: flex; justify-content: space-between; align-items: center; }
.food-name { font-family: var(--font-serif); font-size: 1rem; font-weight: 700; color: var(--dark); }
.food-rating { font-size: .82rem; color: var(--gold-dark); font-weight: 600; display: flex; align-items: center; gap: 3px; }
.food-rating svg { color: var(--gold); }
.food-area { font-size: .78rem; color: var(--grey); display: flex; align-items: center; gap: 4px; }
.food-area svg { color: var(--brown-light); }
</style>
