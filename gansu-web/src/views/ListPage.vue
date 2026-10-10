<template>
  <div class="list-page">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">{{ labelMap[type] || '列表' }}</h1>
        <p class="page-subtitle">{{ subtitleMap[type] || '探索甘肃，发现美好' }}</p>
      </div>

      <!-- Search Bar -->
      <div class="search-bar">
        <div class="search-input-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="keyword"
            type="text"
            :placeholder="'搜索' + (labelMap[type] || '')"
            class="search-input"
            @keyup.enter="onSearch"
          />
        </div>
        <button class="btn btn-primary search-btn" @click="onSearch">搜索</button>
      </div>

      <!-- Loading: initial only -->
      <div v-if="loading && items.length === 0" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && items.length === 0" class="empty">
        <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
        <p class="empty-title">暂无内容</p>
        <p v-if="keyword">未找到与"{{ keyword }}"相关的内容，换个关键词试试吧</p>
        <p v-else>该分类下暂无内容</p>
      </div>

      <!-- Card Grid -->
      <div v-else class="card-grid">
        <div
          v-for="item in items"
          :key="item.id"
          class="card-wrapper"
          @click="goDetail(item.id)"
        >
          <component :is="cardComponent" v-bind="cardProps(item)" />
        </div>
      </div>

      <!-- Load More -->
      <div v-if="hasMore && items.length > 0" class="load-more-wrap">
        <button
          class="btn btn-outline load-more-btn"
          :disabled="loading"
          @click="loadMore"
        >
          <span v-if="loading" class="spinner spinner-sm"></span>
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>

      <!-- End of list -->
      <div v-if="!hasMore && items.length > 0 && !loading" class="end-of-list">
        <span class="end-divider"></span><span>已经到底了</span><span class="end-divider"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../utils/api'
import SpotCard from '../components/SpotCard.vue'
import CultureCard from '../components/CultureCard.vue'
import FoodCard from '../components/FoodCard.vue'
import ProductCard from '../components/ProductCard.vue'
import GuideCard from '../components/GuideCard.vue'

const route = useRoute()
const router = useRouter()

const type = computed(() => route.meta.type)

const labelMap = {
  spots: '热门景点',
  cultures: '非遗文化',
  foods: '美食推荐',
  products: '文创产品',
  guides: '旅游攻略',
}

const subtitleMap = {
  spots: '千年丝路，探访甘肃最动人的自然与人文景观',
  cultures: '触摸指尖上的非遗，感受陇原大地的文化脉搏',
  foods: '一碗面一座城，品味舌尖上的甘肃风情',
  products: '把甘肃故事带回家，发现匠心好物',
  guides: '精选行程与实用贴士，让你的甘肃之旅不留遗憾',
}

const cardComponentMap = {
  spots: SpotCard,
  cultures: SpotCard,
  foods: FoodCard,
  products: ProductCard,
  guides: GuideCard,
}

const cardComponent = computed(() => cardComponentMap[type.value] || 'div')

function cardProps(item) {
  const t = type.value
  if (t === 'spots' || t === 'cultures') return { spot: item }
  if (t === 'foods') return { food: item }
  if (t === 'products') return { product: item }
  if (t === 'guides') return { guide: item }
  return { spot: item }
}

const items = ref([])
const page = ref(1)
const loading = ref(false)
const totalPages = ref(0)
const keyword = ref('')

const hasMore = computed(() => page.value < totalPages.value)

function getApi() {
  return api[type.value]
}

async function fetchPage(p, append = false) {
  const apiModule = getApi()
  if (!apiModule) return

  try {
    let res
    // products and guides support filters (keyword)
    if (type.value === 'products' || type.value === 'guides') {
      const filters = {}
      if (keyword.value) filters.keyword = keyword.value
      res = await apiModule.list(p, 10, filters)
    } else {
      res = await apiModule.list(p, 10)
    }

    let list = res.list || []
    totalPages.value = res.totalPages || 0

    // Client-side keyword filter for types that don't support server-side search
    if (type.value !== 'products' && type.value !== 'guides' && keyword.value) {
      const kw = keyword.value.toLowerCase()
      list = list.filter(item => {
        const name = (item.name || item.title || '').toLowerCase()
        return name.includes(kw)
      })
    }

    if (append) {
      items.value = [...items.value, ...list]
    } else {
      items.value = list
    }
  } catch (err) {
    console.error('Failed to fetch list:', err)
    if (!append) items.value = []
  }
}

async function loadData() {
  loading.value = true
  page.value = 1
  await fetchPage(1, false)
  loading.value = false
}

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  page.value++
  await fetchPage(page.value, true)
  loading.value = false
}

function onSearch() {
  page.value = 1
  items.value = []
  loading.value = true
  fetchPage(1, false).finally(() => {
    loading.value = false
  })
}

function goDetail(id) {
  router.push(`/${type.value}/${id}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.list-page {
  min-height: 80vh;
  padding-bottom: 60px;
}

.page-header {
  text-align: center;
  padding: 36px 0 8px;
}

.page-title {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--dark);
  letter-spacing: 2px;
}

.page-subtitle {
  margin-top: 6px;
  font-size: 0.88rem;
  color: var(--grey);
}

/* Search */
.search-bar {
  display: flex;
  gap: 10px;
  max-width: 520px;
  margin: 24px auto 32px;
  padding: 0 16px;
}

.search-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: var(--grey-light);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 40px;
  border: 1.5px solid rgba(139, 69, 19, 0.15);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-family: var(--font-sans);
  color: var(--dark);
  background: #fff;
  outline: none;
  transition: border-color 0.2s var(--ease);
}

.search-input:focus {
  border-color: var(--gold);
}

.search-input::placeholder {
  color: var(--grey-light);
}

.search-btn {
  padding: 10px 24px;
  font-size: 0.9rem;
}

/* Card Grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.card-wrapper {
  cursor: pointer;
  transition: transform 0.2s var(--ease);
}

.card-wrapper:hover {
  transform: translateY(-3px);
}

/* Load More */
.load-more-wrap {
  text-align: center;
  margin-top: 36px;
}

.load-more-btn {
  padding: 10px 36px;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(139, 69, 19, 0.1);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* End of list */
.end-of-list {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  margin-top: 36px; color: var(--grey-light); font-size: 0.82rem;
}
.end-divider { width: 48px; height: 1px; background: rgba(139,69,19,.08); }

/* Responsive */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .search-bar {
    margin: 16px auto 24px;
  }
}

@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    padding-top: 24px;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .search-bar {
    flex-direction: column;
    gap: 8px;
  }

  .search-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
