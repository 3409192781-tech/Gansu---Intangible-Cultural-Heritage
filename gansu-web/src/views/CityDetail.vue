<template>
  <div class="city-detail-page">
    <button class="back-btn" @click="$router.back()">← 返回</button>

    <div v-if="loading" class="loading"><div class="spinner"></div></div>

    <template v-else-if="city.name">
      <div class="city-hero">
        <img v-if="city.banner" :src="city.banner" class="hero-bg" />
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1>{{ city.name }}</h1>
          <p>{{ city.desc }}</p>
          <div class="hero-badges">
            <span class="badge badge-gold" v-if="city.level">{{ city.level }}</span>
            <span v-if="city.years">{{ city.years }}</span>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="section" v-if="city.intro">
          <h2 class="section-title">城市简介</h2>
          <p class="intro-text">{{ city.intro }}</p>
        </div>

        <div class="section" v-if="city.heritages?.length">
          <h2 class="section-title">非物质文化遗产 ({{ city.heritages.length }})</h2>
          <div class="grid grid-3">
            <div class="card" v-for="h in city.heritages" :key="h.id || h.name" @click="$router.push('/cultures/' + (h.id || ''))">
              <img :src="h.image" class="card-img" />
              <div class="card-body">
                <div class="card-title">{{ h.name }}</div>
                <div class="tags"><span class="tag" v-for="(t,i) in (h.tags||[])" :key="i">{{ t }}</span></div>
                <p style="color:var(--grey);font-size:.85rem">{{ h.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="section" v-if="city.spots?.length">
          <h2 class="section-title">热门景点 ({{ city.spots.length }})</h2>
          <div class="grid grid-3">
            <div class="card" v-for="s in city.spots" :key="s.id" @click="$router.push('/spots/' + s.id)">
              <img :src="s.image" class="card-img" />
              <div class="card-body">
                <div class="card-title">{{ s.name }}</div>
                <div class="tags"><span class="tag" v-for="(t,i) in (s.tags||[])" :key="i">{{ t }}</span></div>
                <span style="color:var(--grey);font-size:.85rem;display:flex;align-items:center;gap:8px"><span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>{{ s.location }}</span><span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>{{ s.rating }}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="empty"><div class="empty-icon">🏙️</div><div class="empty-title">城市不存在</div></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../utils/api'

const route = useRoute()
const city = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    const name = decodeURIComponent(route.params.name)
    city.value = await api.cities.detail(name)
  } catch (e) { }
  finally { loading.value = false }
})
</script>

<style scoped>
.city-detail-page { min-height: 100vh; background: var(--bg); padding-bottom: 40px; }
.back-btn { position: fixed; top: 16px; left: 16px; z-index: 50; background: rgba(0,0,0,.35); color: #fff; border: none; padding: 8px 16px; border-radius: 20px; font-size: .88rem; cursor: pointer; }
.city-hero { position: relative; height: 320px; overflow: hidden; display: flex; align-items: flex-end; }
.hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 30%, rgba(0,0,0,.7)); }
.hero-content { position: relative; z-index: 1; padding: 40px 24px 24px; color: #fff; }
.hero-content h1 { font-family: var(--font-serif); font-size: 2rem; }
.hero-content p { opacity: .85; margin: 8px 0; }
.hero-badges { display: flex; gap: 8px; }
.container { max-width: var(--max-width); margin: 0 auto; padding: 0 16px; }
.section { padding: 32px 0; }
.intro-text { color: var(--grey); line-height: 1.9; font-size: .95rem; }
</style>
