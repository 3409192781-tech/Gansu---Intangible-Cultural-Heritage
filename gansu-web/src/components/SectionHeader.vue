<template>
  <div class="section-header">
    <h2 class="sec-title">{{ title }}</h2>
    <span v-if="moreLink" class="sec-more" @click="$emit('more-click')">
      更多
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
    </span>
    <small v-if="disclaimer" class="sec-disclaimer">{{ disclaimer }}</small>
  </div>
</template>

<script setup>
defineProps({ title: String, moreLink: String, disclaimer: String })
defineEmits(['more-click'])
</script>

<style scoped>
.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.sec-title { font-family: var(--font-serif); font-size: 1.08rem; font-weight: 700; color: var(--dark); display: flex; align-items: center; gap: 8px; letter-spacing: .4px; }
.sec-title::before { content: ''; width: 3px; height: 18px; border-radius: 2px; background: linear-gradient(180deg, var(--gold), var(--brown)); }
.sec-more { font-size: .83rem; color: var(--brown); font-weight: 500; cursor: pointer; margin-left: auto; flex-shrink: 0; display: flex; align-items: center; gap: 3px; transition: color var(--fast); }
.sec-more:hover { color: var(--brown-dark); }
.sec-more svg { transition: transform var(--fast); }
.sec-more:hover svg { transform: translateX(2px); }
.sec-disclaimer { font-size: .72rem; color: var(--grey-light); flex-shrink: 0; }
</style>
