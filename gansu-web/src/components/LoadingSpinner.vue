<template>
  <div class="loading"><div class="spinner"></div><p>{{ msg }}</p></div>
</template>
<script setup>defineProps({ msg: { type: String, default: '加载中…' } })</script>
<style scoped>
.loading { text-align: center; padding: 60px 20px; color: var(--grey); }
.spinner { width: 40px; height: 40px; margin: 0 auto 16px; border: 3px solid rgba(139,69,19,.1); border-top-color: var(--gold); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
