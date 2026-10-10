<template>
  <div class="search-page">
    <div class="search-bar">
      <div class="search-input-wrap">
        <span class="search-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>
        <input v-model="keyword" placeholder="搜索景点、美食、非遗…" @keyup.enter="doSearch" />
        <button v-if="keyword" class="clear-btn" @click="keyword='';results=null">✕</button>
      </div>
      <button class="btn btn-primary" @click="doSearch">搜索</button>
    </div>

    <div class="search-results container" v-if="results">
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <template v-else-if="hasAnyResults">
        <div class="result-section" v-if="results.spots?.length">
          <h2 class="section-title">景点</h2>
          <div class="grid grid-3">
            <div class="card" v-for="item in results.spots" :key="item.id" @click="$router.push('/spots/' + item.id)">
              <img :src="item.image" class="card-img" />
              <div class="card-body">
                <div class="card-title">{{ item.name }}</div>
                <div class="tags"><span class="tag" v-for="(t,i) in item.tags" :key="i">{{ t }}</span></div>
                <span style="color:var(--grey);font-size:.82rem;display:flex;align-items:center;gap:8px"><span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>{{ item.location }}</span><span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>{{ item.rating }}</span></span>
              </div>
            </div>
          </div>
        </div>
        <div class="result-section" v-if="results.cultures?.length">
          <h2 class="section-title">非遗</h2>
          <div class="grid grid-3">
            <div class="card" v-for="item in results.cultures" :key="item.id" @click="$router.push('/cultures/' + item.id)">
              <img :src="item.image" class="card-img" />
              <div class="card-body">
                <div class="card-title">{{ item.name }}</div>
                <div class="tags"><span class="tag" v-for="(t,i) in item.tags" :key="i">{{ t }}</span></div>
                <span style="color:var(--grey);font-size:.82rem;display:flex;align-items:center;gap:8px"><span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>{{ item.location }}</span><span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>{{ item.rating }}</span></span>
              </div>
            </div>
          </div>
        </div>
        <div class="result-section" v-if="results.foods?.length">
          <h2 class="section-title">美食</h2>
          <div class="grid grid-3">
            <div class="card" v-for="item in results.foods" :key="item.id" @click="$router.push('/foods/' + item.id)">
              <img :src="item.image" class="card-img" />
              <div class="card-body">
                <div class="card-title">{{ item.name }}</div>
                <div class="tags"><span class="tag" v-for="(t,i) in item.tags" :key="i">{{ t }}</span></div>
                <span style="color:var(--grey);font-size:.82rem;display:flex;align-items:center;gap:8px"><span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>{{ item.location }}</span><span style="display:inline-flex;align-items:center;gap:3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>{{ item.rating }}</span></span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="empty">
        <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
        <div class="empty-title">未找到"{{ keyword }}"相关结果</div>
      </div>
    </div>

    <div v-else class="search-hint">
      <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="width:64px;height:64px"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
      <div class="empty-title">输入关键词搜索甘肃文旅内容</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from '../utils/api'

const keyword = ref('')
const results = ref(null)
const loading = ref(false)
const hasAnyResults = computed(() => {
  if (!results.value) return false
  return (results.value.spots?.length || 0) + (results.value.cultures?.length || 0) + (results.value.foods?.length || 0) > 0
})

async function doSearch() {
  if (!keyword.value.trim()) return
  loading.value = true
  try { results.value = await api.search.do(keyword.value.trim()) }
  catch { results.value = { spots: [], cultures: [], foods: [] } }
  finally { loading.value = false }
}
</script>

<style scoped>
.search-page { min-height: 100vh; background: var(--bg); padding-bottom: 40px; }
.search-bar {
  display: flex; gap: 12px; align-items: center; padding: 16px 20px;
  background: linear-gradient(180deg, var(--brown), #C46210);
}
.search-input-wrap {
  flex: 1; display: flex; align-items: center; gap: 8px;
  background: rgba(255,248,231,.95); border-radius: 24px; padding: 0 16px; height: 44px;
}
.search-input-wrap input {
  flex: 1; border: none; outline: none; background: transparent; font-size: .9rem;
}
.search-icon { opacity: .4; }
.clear-btn { background: none; border: none; cursor: pointer; color: var(--grey); font-size: 1rem; }
.search-results { padding-top: 20px; }
.result-section { padding: 24px 0; }
.search-hint { text-align: center; padding: 100px 20px; color: var(--grey); }
</style>
