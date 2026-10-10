<template>
  <div class="quick-grid">
    <div class="q-item" v-for="(e, i) in entries" :key="i" @click="$emit('click-entry', i)">
      <div class="q-icon" :style="{ background: colors[i % colors.length] }">
        <img :src="'/icons/' + iconFiles[i % iconFiles.length]" class="q-svg" :alt="e.text" />
      </div>
      <span class="q-text">{{ e.text }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({ entries: { type: Array, default: () => [] } })
defineEmits(['click-entry'])
const colors = [
  '#8B4513',
  '#D4A86A',
  '#4A8F6D',
  '#CC8800',
  '#C46210',
  '#3B7DD8',
  '#6B7B8B',
]
const iconFiles = [
  'map.svg',
  'spot.svg',
  'culture.svg',
  'creation.svg',
  'food.svg',
  'guide.svg',
  'phone.svg',
]
</script>

<style scoped>
.quick-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-4);
  padding: var(--sp-5); background: #fff;
  border-radius: var(--radius); border: 1px solid rgba(212,168,106,.12);
}
.q-item { text-align: center; cursor: pointer; }
.q-icon {
  width: 64px; height: 64px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto var(--sp-3);
}
.q-svg { width: 36px; height: 36px; }
.q-text { font-size: .82rem; color: var(--dark); font-weight: 500; }
@media (max-width: 480px) {
  .quick-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .q-icon { width: 52px; height: 52px; border-radius: 14px; }
  .q-svg { width: 28px; height: 28px; }
}
</style>
