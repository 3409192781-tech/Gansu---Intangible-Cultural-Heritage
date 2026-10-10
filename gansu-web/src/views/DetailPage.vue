<template>
  <div class="detail-page">
    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="empty">
      <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div>
      <p class="empty-title">加载失败</p>
      <p>{{ error }}</p>
      <button class="btn btn-primary" style="margin-top:16px" @click="fetchDetail">重新加载</button>
    </div>

    <!-- Not found -->
    <div v-else-if="!detail" class="empty">
      <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
      <p class="empty-title">未找到相关内容</p>
    </div>

    <!-- Detail Content -->
    <template v-else>
      <!-- Back Button -->
      <button class="back-btn" @click="goBack" aria-label="返回">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <span>返回</span>
      </button>

      <!-- Image Carousel -->
      <div class="carousel" v-if="displayImages.length > 0">
        <div class="carousel-viewport">
          <div
            class="carousel-track"
            :style="{ transform: `translateX(-${currentImage * 100}%)` }"
          >
            <div
              v-for="(img, i) in displayImages"
              :key="i"
              class="carousel-slide"
            >
              <img :src="img" :alt="detailTitle + ' - ' + (i + 1)" class="carousel-image" />
            </div>
          </div>
        </div>

        <!-- Prev / Next arrows -->
        <button
          v-if="displayImages.length > 1"
          class="carousel-arrow carousel-prev"
          @click="prevImage"
          aria-label="上一张"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button
          v-if="displayImages.length > 1"
          class="carousel-arrow carousel-next"
          @click="nextImage"
          aria-label="下一张"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <!-- Dot indicators -->
        <div v-if="displayImages.length > 1" class="carousel-dots">
          <button
            v-for="(_, i) in displayImages"
            :key="i"
            class="carousel-dot"
            :class="{ active: i === currentImage }"
            @click="currentImage = i"
            :aria-label="'第 ' + (i + 1) + ' 张'"
          ></button>
        </div>
      </div>

      <!-- Fallback image -->
      <div v-else class="carousel carousel-fallback">
        <div class="fallback-img">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64">
            <rect x="2" y="2" width="20" height="20" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-5-5L6 20"/>
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="detail-content container">
        <!-- Title & Rating -->
        <div class="detail-header">
          <h1 class="detail-title">{{ detailTitle }}</h1>
          <div class="detail-rating" v-if="detail.rating !== undefined && detail.rating !== null">
            <span class="stars">
              <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= Math.round(detail.rating) }">
                {{ n <= Math.round(detail.rating) ? '★' : '☆' }}
              </span>
            </span>
            <span class="rating-num">{{ detail.rating }}</span>
          </div>
        </div>

        <!-- Tags -->
        <div class="tags" v-if="detail.tags && detail.tags.length > 0">
          <span v-for="tag in detail.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <!-- Guide metadata: category + author + views -->
        <div class="guide-meta" v-if="type === 'guides'">
          <span v-if="detail.category" class="guide-category">{{ categoryLabels[detail.category] || detail.category }}</span>
          <span class="guide-author">{{ detail.author || '陇韵匠心' }}</span>
          <span class="guide-views">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ detail.views || 0 }} 次浏览
          </span>
        </div>

        <!-- Location -->
        <div class="detail-location" v-if="detail.location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ detail.location }}</span>
        </div>

        <!-- Video -->
        <div class="detail-video" v-if="detail.videoUrl">
          <video
            :src="detail.videoUrl"
            controls
            class="video-player"
            preload="metadata"
          >
            您的浏览器不支持视频播放
          </video>
        </div>

        <!-- AI Plan button (spots / cultures / foods / guides) -->
        <div class="ai-plan-row">
          <button class="ai-plan-btn" @click="openPlanModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            驼小游 · AI 制定计划
          </button>
        </div>

        <!-- Description / Content -->
        <section class="detail-section" v-if="detailBody">
          <h2 class="section-title">{{ type === 'guides' ? '正文' : '介绍' }}</h2>
          <div class="detail-text" v-html="formatText(detailBody)"></div>
        </section>

        <!-- Open Time -->
        <section class="detail-section" v-if="detail.openTime">
          <h2 class="section-title">开放时间</h2>
          <p class="detail-text">{{ detail.openTime }}</p>
        </section>

        <!-- Ticket Info -->
        <section class="detail-section" v-if="detail.ticketInfo">
          <h2 class="section-title">门票</h2>
          <p class="detail-text">{{ detail.ticketInfo }}</p>
        </section>

        <!-- Transport -->
        <section class="detail-section" v-if="detail.transport">
          <h2 class="section-title">交通</h2>
          <p class="detail-text">{{ detail.transport }}</p>
        </section>

        <!-- Itinerary Days (guides only) -->
        <section class="detail-section" v-if="type === 'guides' && detail.days && detail.days.length > 0">
          <h2 class="section-title">行程安排</h2>
          <div class="itinerary">
            <div class="timeline-line"></div>
            <div class="day-card" v-for="(d, di) in detail.days" :key="di">
              <div class="day-marker">
                <span class="day-num">Day {{ d.day }}</span>
              </div>
              <div class="day-content">
                <h3 class="day-title">{{ d.title }}</h3>
                <div class="day-spots" v-if="d.spots && d.spots.length > 0">
                  <span class="day-spot" v-for="(s, si) in d.spots" :key="si">{{ s }}</span>
                </div>
                <p class="day-desc" v-if="d.description">{{ d.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Tips -->
        <section class="detail-section" v-if="detail.tips && detail.tips.length > 0">
          <h2 class="section-title">贴士</h2>
          <ul class="tips-list">
            <li v-for="(tip, i) in detail.tips" :key="i">{{ tip }}</li>
          </ul>
        </section>

        <!-- Linked Heritages (spots only) -->
        <section
          class="detail-section"
          v-if="type === 'spots' && detail.heritages && detail.heritages.length > 0"
        >
          <h2 class="section-title">关联非遗</h2>
          <div class="heritage-grid">
            <div
              v-for="h in detail.heritages"
              :key="h.id"
              class="heritage-card card"
              @click="router.push('/cultures/' + h.id)"
            >
              <img
                v-if="h.image"
                :src="h.image"
                :alt="h.name"
                class="card-img"
              />
              <div class="card-body">
                <div class="card-title">{{ h.name }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- AI Plan Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="planOpen" class="plan-overlay" @click.self="planOpen = false">
          <div class="plan-modal">
            <div class="plan-header">
              <div class="plan-header-left">
                <span class="plan-header-icon">&#x1F42A;</span>
                <div>
                  <div class="plan-header-title">AI 制定计划</div>
                  <div class="plan-header-sub">{{ detailTitle }}</div>
                </div>
              </div>
              <button class="plan-close" @click="planOpen = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="plan-body">
              <!-- Form -->
              <div class="plan-form" v-if="!planResult">
                <div class="plan-field">
                  <label class="plan-label">时长</label>
                  <div class="plan-chips">
                    <button
                      v-for="d in durations"
                      :key="d"
                      class="plan-chip"
                      :class="{ active: planForm.duration === d }"
                      @click="planForm.duration = d"
                    >{{ d }}</button>
                    <input
                      v-if="planForm.duration === '自定义'"
                      v-model="planForm.customDuration"
                      class="plan-custom-input"
                      placeholder="如：3小时"
                    />
                  </div>
                </div>

                <div class="plan-field" v-if="type !== 'guides'">
                  <label class="plan-label">人数</label>
                  <div class="plan-chips">
                    <button
                      v-for="p in peopleOptions"
                      :key="p"
                      class="plan-chip"
                      :class="{ active: planForm.people === p }"
                      @click="planForm.people = p"
                    >{{ p }}</button>
                    <input
                      v-if="planForm.people === '自定义'"
                      v-model="planForm.customPeople"
                      class="plan-custom-input"
                      placeholder="如：5人"
                    />
                  </div>
                </div>

                <div class="plan-field" v-if="type === 'food'">
                  <label class="plan-label">预算</label>
                  <div class="plan-chips">
                    <button
                      v-for="b in budgetOptions"
                      :key="b"
                      class="plan-chip"
                      :class="{ active: planForm.budget === b }"
                      @click="planForm.budget = b"
                    >{{ b }}</button>
                    <input
                      v-if="planForm.budget === '自定义'"
                      v-model="planForm.customBudget"
                      class="plan-custom-input"
                      placeholder="如：100元/人"
                    />
                  </div>
                </div>

                <div class="plan-field">
                  <label class="plan-label">偏好</label>
                  <div class="plan-chips">
                    <button
                      v-for="p in currentPrefs"
                      :key="p"
                      class="plan-chip"
                      :class="{ active: planForm.preferences.includes(p) }"
                      @click="togglePref(p)"
                    >{{ p }}</button>
                    <input
                      v-model="planForm.customPref"
                      class="plan-custom-input"
                      placeholder="自定义偏好"
                      @keydown.enter="addCustomPref"
                    />
                  </div>
                </div>

                <button class="plan-submit" @click="submitPlan" :disabled="planSubmitting">
                  <span v-if="!planSubmitting">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    生成计划
                  </span>
                  <span v-else>
                    <span class="plan-spinner"></span>
                    驼小游正在思考...
                  </span>
                </button>
              </div>

              <!-- Result -->
              <div class="plan-result" v-else>
                <div class="plan-result-header">
                  <span class="plan-result-badge">&#x1F42A; AI 推荐</span>
                  <button class="plan-retry" @click="planResult = null">重新生成</button>
                </div>
                <div class="plan-result-content" v-html="renderPlan(planResult)"></div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../utils/api'

const route = useRoute()
const router = useRouter()

const type = computed(() => route.meta.type)

const detail = ref(null)
const loading = ref(true)
const error = ref('')
const currentImage = ref(0)

// Auto-play timer
let autoPlayTimer = null
const AUTO_PLAY_INTERVAL = 4000

const displayImages = computed(() => {
  if (!detail.value) return []
  if (detail.value.images && detail.value.images.length > 0) return detail.value.images
  if (detail.value.image) return [detail.value.image]
  if (detail.value.coverImage) return [detail.value.coverImage]
  return []
})

// Guide model uses different field names — normalize them
const detailTitle = computed(() => detail.value?.name || detail.value?.title || '')
const detailBody = computed(() => detail.value?.description || detail.value?.content || '')

const categoryLabels = {
  family: '亲子游', self_drive: '自驾游', photo: '摄影游',
  deep: '深度游', food: '美食游', history: '文史游',
  weekend: '周末游', budget: '穷游'
}

function getApi() {
  return api[type.value]
}

async function fetchDetail() {
  loading.value = true
  error.value = ''
  detail.value = null
  currentImage.value = 0

  try {
    const id = route.params.id
    const apiModule = getApi()
    if (!apiModule) {
      throw new Error('未知的内容类型')
    }
    const data = await apiModule.detail(id)
    if (!data) {
      throw new Error('未找到相关内容')
    }
    detail.value = data
  } catch (err) {
    console.error('Failed to fetch detail:', err)
    error.value = err.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function prevImage() {
  if (displayImages.value.length === 0) return
  currentImage.value = (currentImage.value - 1 + displayImages.value.length) % displayImages.value.length
  resetAutoPlay()
}

function nextImage() {
  if (displayImages.value.length === 0) return
  currentImage.value = (currentImage.value + 1) % displayImages.value.length
  resetAutoPlay()
}

function startAutoPlay() {
  stopAutoPlay()
  if (displayImages.value.length > 1) {
    autoPlayTimer = setInterval(() => {
      nextImage()
    }, AUTO_PLAY_INTERVAL)
  }
}

function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

function resetAutoPlay() {
  stopAutoPlay()
  startAutoPlay()
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push(`/${type.value}`)
  }
}

function formatText(text) {
  if (!text) return ''
  // Replace newlines with <br>
  return text.replace(/\n/g, '<br>')
}

onMounted(() => {
  fetchDetail().then(() => {
    startAutoPlay()
  })
})

onBeforeUnmount(() => {
  stopAutoPlay()
})

// ═══ AI Plan ═══
const planOpen = ref(false)
const planSubmitting = ref(false)
const planResult = ref(null)

const planForm = ref({
  duration: '',
  customDuration: '',
  people: '',
  customPeople: '',
  budget: '',
  customBudget: '',
  preferences: [],
  customPref: ''
})

const durations = ['1小时', '2小时', '半天', '1天', '2天', '自定义']
const peopleOptions = ['1人', '2人', '3-5人', '6-10人', '10人以上', '自定义']
const budgetOptions = ['50元以内', '50-100元', '100-200元', '200-500元', '500元以上', '自定义']

const spotPrefs = ['文化深度', '拍照打卡', '亲子游乐', '休闲放松', '历史探索', '自然风光']
const culturePrefs = ['技艺体验', '历史背景', '民俗风情', '传承故事', '手工制作']
const foodPrefs = ['麻辣重口', '清淡鲜美', '地道小吃', '大餐硬菜', '甜食点心', '面食为主']
const guidePrefs = ['自驾', '公共交通', '徒步', '摄影', '美食探索']

const currentPrefs = computed(() => {
  const m = { spot: spotPrefs, culture: culturePrefs, food: foodPrefs, guide: guidePrefs }
  return m[type.value] || spotPrefs
})

function openPlanModal() {
  planResult.value = null
  planForm.value = {
    duration: '', customDuration: '',
    people: '', customPeople: '',
    budget: '', customBudget: '',
    preferences: [], customPref: ''
  }
  planOpen.value = true
}

function togglePref(p) {
  const idx = planForm.value.preferences.indexOf(p)
  if (idx >= 0) {
    planForm.value.preferences.splice(idx, 1)
  } else {
    planForm.value.preferences.push(p)
  }
}

function addCustomPref() {
  const v = planForm.value.customPref.trim()
  if (v && !planForm.value.preferences.includes(v)) {
    planForm.value.preferences.push(v)
  }
  planForm.value.customPref = ''
}

function getPlanValue(field, customField) {
  const val = planForm.value[field]
  if (val === '自定义') return planForm.value[customField] || '自定义'
  return val || ''
}

async function submitPlan() {
  planSubmitting.value = true
  try {
    const duration = getPlanValue('duration', 'customDuration')
    const people = getPlanValue('people', 'customPeople')
    const budget = getPlanValue('budget', 'customBudget')
    const data = await api.ai.tripPlan({
      type: type.value,
      name: detailTitle.value,
      description: detailBody.value || '',
      duration,
      people,
      budget,
      preferences: planForm.value.preferences
    })
    planResult.value = data.content
  } catch {
    planResult.value = '抱歉，AI 服务暂时不可用，请稍后重试。'
  } finally {
    planSubmitting.value = false
  }
}

function renderPlan(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/### (.+)/g, '<h4 class="plan-h4">$1</h4>')
    .replace(/## (.+)/g, '<h3 class="plan-h3">$1</h3>')
    .replace(/# (.+)/g, '<h2 class="plan-h2">$1</h2>')
    .replace(/- (.+)/g, '<li class="plan-li">$1</li>')
    .replace(/(\d+)\. (.+)/g, '<li class="plan-li">$1. $2</li>')
}
</script>

<style scoped>
.detail-page {
  min-height: 80vh;
  padding-bottom: 60px;
  background: #F0E8DB;
}

/* Back button */
.back-btn {
  position: fixed;
  top: 68px;
  left: 16px;
  z-index: 50;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(139, 69, 19, 0.1);
  border-radius: var(--radius-md);
  color: var(--brown);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s var(--ease);
  font-family: var(--font-sans);
}

.back-btn:hover {
  background: #fff;
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Carousel */
.carousel {
  position: relative;
  width: 100%;
  max-height: 500px;
  overflow: hidden;
  background: var(--brown-dark);
}

.carousel-viewport {
  width: 100%;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}

.carousel-slide {
  min-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

/* Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  color: var(--brown);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s var(--ease);
}

.carousel-arrow:hover {
  background: #fff;
  box-shadow: var(--shadow-md);
}

.carousel-prev {
  left: 16px;
}

.carousel-next {
  right: 16px;
}

/* Dots */
.carousel-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.25s var(--ease);
  padding: 0;
}

.carousel-dot.active {
  background: #fff;
  transform: scale(1.3);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.5);
}

/* Fallback image */
.carousel-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.fallback-img {
  color: rgba(255, 255, 255, 0.3);
}

/* Content */
.detail-content {
  padding-top: 28px;
}

.detail-header {
  margin-bottom: 12px;
}

.detail-title {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--dark);
  letter-spacing: 1px;
  line-height: 1.3;
}

.detail-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.1rem;
  color: #D4A86A;
}

.star:not(.filled) {
  color: rgba(212, 168, 106, 0.25);
}

.rating-num {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--grey);
}

.detail-location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 0.9rem;
  color: var(--grey);
}

/* Video */
.detail-video {
  margin-top: 24px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.video-player {
  width: 100%;
  display: block;
  background: #000;
}

/* Sections */
.detail-section {
  margin-top: 32px;
}

.section-title {
  font-family: var(--font-serif);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--gold), var(--brown));
}

.detail-text {
  font-size: 0.92rem;
  line-height: 1.8;
  color: var(--grey);
  white-space: pre-line;
}

/* Guide metadata */
.guide-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
  font-size: 0.85rem;
  color: var(--grey);
  flex-wrap: wrap;
}

.guide-category {
  background: rgba(212, 168, 106, 0.15);
  color: var(--brown);
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.8rem;
}

.guide-author {
  font-weight: 500;
}

.guide-views {
  display: flex;
  align-items: center;
  gap: 4px;
}

.guide-views svg {
  flex-shrink: 0;
  color: var(--brown-light);
}

/* Itinerary timeline */
.itinerary {
  position: relative;
  padding-left: 0;
}

.timeline-line {
  position: absolute;
  left: 18px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: linear-gradient(180deg, var(--gold), var(--brown));
  opacity: 0.3;
  border-radius: 1px;
}

.day-card {
  position: relative;
  padding-left: 52px;
  margin-bottom: 24px;
}

.day-card:last-child {
  margin-bottom: 0;
}

.day-marker {
  position: absolute;
  left: 0;
  top: 4px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brown), #6B3410);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.day-num {
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.day-content {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  border: 1px solid rgba(212, 168, 106, 0.12);
}

.day-title {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 10px;
}

.day-spots {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.day-spot {
  font-size: 0.78rem;
  background: rgba(139, 69, 19, 0.08);
  color: var(--brown);
  padding: 3px 10px;
  border-radius: 8px;
}

.day-desc {
  font-size: 0.88rem;
  line-height: 1.7;
  color: var(--grey);
  margin: 0;
}

/* Tips list */
.tips-list {
  list-style: none;
  padding: 0;
}

.tips-list li {
  position: relative;
  padding: 8px 0 8px 22px;
  font-size: 0.9rem;
  color: var(--grey);
  line-height: 1.7;
  border-bottom: 1px solid rgba(139, 69, 19, 0.06);
}

.tips-list li:last-child {
  border-bottom: none;
}

.tips-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
}

/* Heritage grid */
.heritage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.heritage-card {
  cursor: pointer;
  transition: all 0.2s var(--ease);
}

.heritage-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.heritage-card .card-img {
  height: 150px;
}

/* Responsive */
@media (max-width: 768px) {
  .carousel-image {
    height: 280px;
  }

  .carousel-fallback {
    height: 220px;
  }

  .detail-title {
    font-size: 1.45rem;
  }

  .heritage-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .back-btn {
    top: 64px;
    left: 8px;
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .carousel-image {
    height: 220px;
  }

  .carousel-fallback {
    height: 180px;
  }

  .carousel-arrow {
    width: 34px;
    height: 34px;
  }

  .carousel-arrow svg {
    width: 18px;
    height: 18px;
  }

  .detail-title {
    font-size: 1.3rem;
  }

  .heritage-grid {
    grid-template-columns: 1fr;
  }

  .detail-content {
    padding-top: 20px;
  }

  .plan-modal {
    width: calc(100vw - 24px);
    max-height: 85vh;
  }
  .plan-chips { gap: 6px; }
  .plan-chip { padding: 6px 14px; font-size: 0.8rem; }
}

/* ===== AI Plan Button ===== */
.ai-plan-row {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.ai-plan-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: none;
  border-radius: 28px;
  background: linear-gradient(135deg, #D4A86A, #8B4513);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: var(--font-serif);
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(139,69,19,0.25);
  transition: all 0.3s var(--ease-out);
  letter-spacing: 0.5px;
}
.ai-plan-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(139,69,19,0.35);
}

/* ===== Plan Modal ===== */
.plan-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(44,24,16,0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-enter-active { transition: all 0.35s cubic-bezier(0.16,1,0.3,1); }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .plan-modal { transform: translateY(30px) scale(0.95); }
.modal-leave-to { opacity: 0; }
.modal-leave-to .plan-modal { transform: translateY(20px) scale(0.97); }

.plan-modal {
  width: 540px;
  max-width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 16px 64px rgba(44,24,16,0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
  font-family: var(--font-sans);
}

/* Header */
.plan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  background: linear-gradient(135deg, #5C2D0E, #8B4513);
  color: #fff;
  flex-shrink: 0;
}
.plan-header-left { display: flex; align-items: center; gap: 12px; }
.plan-header-icon { font-size: 30px; line-height: 1; }
.plan-header-title { font-weight: 700; font-size: 1.05rem; font-family: var(--font-serif); }
.plan-header-sub { font-size: 0.78rem; opacity: 0.7; margin-top: 2px; }
.plan-close {
  background: rgba(255,255,255,0.15);
  border: none; color: #fff;
  width: 32px; height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.plan-close:hover { background: rgba(255,255,255,0.25); }

/* Body */
.plan-body {
  flex: 1;
  overflow-y: auto;
  padding: 22px;
}

/* Form */
.plan-form { display: flex; flex-direction: column; gap: 20px; }
.plan-field { }
.plan-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 10px;
  font-family: var(--font-serif);
}
.plan-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.plan-chip {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(139,69,19,0.15);
  background: #FFF8E7;
  color: var(--brown);
  font-size: 0.85rem;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.2s;
}
.plan-chip:hover { background: rgba(212,168,106,0.2); }
.plan-chip.active {
  background: linear-gradient(135deg, #D4A86A, #8B4513);
  color: #fff;
  border-color: transparent;
}
.plan-custom-input {
  padding: 7px 14px;
  border: 1px solid rgba(139,69,19,0.15);
  border-radius: 20px;
  font-size: 0.85rem;
  outline: none;
  background: #FFF8E7;
  color: var(--dark);
  font-family: var(--font-sans);
  width: 120px;
}
.plan-custom-input:focus { border-color: var(--gold); }

/* Submit */
.plan-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #D4A86A, #8B4513);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: var(--font-serif);
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(139,69,19,0.2);
  letter-spacing: 0.5px;
}
.plan-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,69,19,0.3); }
.plan-submit:disabled { opacity: 0.7; cursor: default; }

.plan-spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Result */
.plan-result { }
.plan-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.plan-result-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--brown);
  font-family: var(--font-serif);
}
.plan-retry {
  padding: 6px 16px;
  border: 1px solid rgba(139,69,19,0.15);
  border-radius: 18px;
  background: #FFF8E7;
  color: var(--brown);
  font-size: 0.82rem;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.2s;
}
.plan-retry:hover { background: var(--brown); color: #fff; }

.plan-result-content {
  font-size: 0.88rem;
  line-height: 1.8;
  color: var(--grey);
  white-space: pre-line;
}
.plan-result-content :deep(.plan-h2) { font-size: 1.1rem; font-weight: 700; color: var(--dark); margin: 16px 0 8px; font-family: var(--font-serif); }
.plan-result-content :deep(.plan-h3) { font-size: 1rem; font-weight: 700; color: var(--dark); margin: 14px 0 6px; font-family: var(--font-serif); }
.plan-result-content :deep(.plan-h4) { font-size: 0.92rem; font-weight: 600; color: var(--dark); margin: 10px 0 4px; }
.plan-result-content :deep(.plan-li) { position: relative; padding-left: 14px; margin: 4px 0; color: var(--grey); }
.plan-result-content :deep(.plan-li)::before { content: ''; position: absolute; left: 0; top: 10px; width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }
.plan-result-content :deep(b) { color: var(--dark); }
</style>
