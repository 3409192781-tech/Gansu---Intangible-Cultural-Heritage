<template>
  <div class="banner-wrap">
    <div class="banner-track" :style="{ transform: `translateX(-${current * 100}%)` }">
      <div class="banner-slide" v-for="(b, i) in banners" :key="i" @click="$emit('click-banner', b.id)">
        <img :src="b.image" class="banner-img" />
        <div class="banner-overlay"></div>
        <div class="banner-text">
          <div class="banner-title-wrap">
            <span class="banner-line"></span>
            <h2 class="banner-title">{{ b.title }}</h2>
            <span class="banner-line"></span>
          </div>
          <p class="banner-desc">{{ b.desc }}</p>
        </div>
      </div>
    </div>
    <div class="banner-dots" v-if="banners.length > 1">
      <span v-for="(_, i) in banners" :key="i" :class="{ active: i === current }" @click="goTo(i)"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const props = defineProps({ banners: { type: Array, default: () => [] } })
defineEmits(['click-banner'])
const current = ref(0)
let timer = null
function goTo(i) { current.value = i }
function next() { if (props.banners.length) current.value = (current.value + 1) % props.banners.length }
onMounted(() => { timer = setInterval(next, 4000) })
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.banner-wrap { position: relative; overflow: hidden; }
.banner-track { display: flex; transition: transform .5s var(--ease); }
.banner-slide { min-width: 100%; position: relative; cursor: pointer; }
.banner-img { width: 100%; height: 320px; object-fit: cover; display: block; }
@media (min-width: 769px) { .banner-img { height: 420px; } }
.banner-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 20%, rgba(44,24,16,.7)); }
.banner-text { position: absolute; bottom: 48px; left: 24px; color: var(--cream); }
.banner-title-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.banner-line { width: 30px; height: 2px; background: var(--gold); border-radius: 1px; }
.banner-title { font-family: var(--font-serif); font-size: 1.6rem; font-weight: 700; letter-spacing: 3px; text-shadow: 0 2px 8px rgba(0,0,0,.3); }
.banner-desc { font-size: .88rem; opacity: .9; text-shadow: 0 1px 4px rgba(0,0,0,.2); }
.banner-dots { position: absolute; bottom: 16px; left: 0; right: 0; display: flex; justify-content: center; gap: 8px; }
.banner-dots span { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,248,231,.4); cursor: pointer; transition: all .3s; }
.banner-dots span.active { width: 28px; border-radius: 5px; background: var(--cream); }
</style>
