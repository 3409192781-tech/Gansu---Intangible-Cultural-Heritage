<template>
  <div class="cities-page">
    <div class="cities-hero">
      <h1>🏙️ 城市非遗</h1>
      <p>甘肃省 14 个市州的非物质文化遗产</p>
    </div>

    <div class="container">
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <template v-else>
        <div class="city-grid">
          <div class="city-card" v-for="city in cities" :key="city.name" @click="$router.push('/cities/' + encodeURIComponent(city.name))">
            <img v-if="city.banner" :src="city.banner" class="city-banner" />
            <div v-else class="city-banner-placeholder">🏙️</div>
            <div class="city-info">
              <h3>{{ city.name }}</h3>
              <p>{{ city.desc }}</p>
              <div class="city-meta">
                <span class="badge badge-brown" v-if="city.level">{{ city.level }}</span>
                <span>{{ city.heritages?.length || 0 }} 项非遗</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../utils/api'

const cities = ref([])
const loading = ref(true)

onMounted(async () => {
  try { cities.value = await api.cities.list() }
  catch (e) { }
  finally { loading.value = false }
})
</script>

<style scoped>
.cities-page { min-height: 100vh; background: var(--bg); padding-bottom: 40px; }
.cities-hero {
  background: linear-gradient(135deg, #2C1810, var(--brown));
  color: var(--cream); text-align: center; padding: 48px 20px;
}
.cities-hero h1 { font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 8px; }
.cities-hero p { opacity: .7; }
.city-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 24px 0; }
.city-card {
  background: #fff; border-radius: var(--radius-lg); overflow: hidden;
  box-shadow: var(--shadow-sm); cursor: pointer; transition: all .2s var(--ease);
}
.city-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.city-banner { width: 100%; height: 160px; object-fit: cover; }
.city-banner-placeholder {
  width: 100%; height: 160px; background: linear-gradient(135deg, var(--brown), #C46210);
  display: flex; align-items: center; justify-content: center; font-size: 3rem;
}
.city-info { padding: 16px; }
.city-info h3 { font-family: var(--font-serif); font-size: 1.15rem; color: var(--dark); margin-bottom: 4px; }
.city-info p { color: var(--grey); font-size: .88rem; margin-bottom: 8px; }
.city-meta { display: flex; gap: 8px; font-size: .82rem; color: var(--grey-light); flex-wrap: wrap; }
</style>
