<template>
  <div class="culture-card" @click="$emit('click')">
    <div class="culture-img-ring">
      <img :src="culture.image" class="culture-img" />
    </div>
    <div class="culture-name">{{ culture.name }}</div>
    <div class="culture-desc">{{ culture.desc }}</div>
  </div>
</template>

<script setup>
defineProps({ culture: Object })
defineEmits(['click'])
</script>

<style scoped>
.culture-card { width: 140px; flex-shrink: 0; text-align: center; cursor: pointer; }
.culture-img-ring { width: 96px; height: 96px; border-radius: 50%; margin: 0 auto 10px; padding: 3px; border: 2px dashed rgba(212,168,106,.3); }
.culture-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 16px rgba(139,69,19,.12); }
.culture-name { font-family: var(--font-serif); font-size: .92rem; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.culture-desc { font-size: .78rem; color: var(--grey); }
</style>
