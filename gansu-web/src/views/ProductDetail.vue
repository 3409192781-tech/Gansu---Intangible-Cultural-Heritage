<template>
  <div class="product-detail-page">
    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- Not found -->
    <div v-else-if="!detail.id" class="empty">
      <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
      <p class="empty-title">产品不存在</p>
    </div>

    <template v-else>
      <!-- Back Button -->
      <button class="back-btn" @click="$router.back()" aria-label="返回">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <span>返回</span>
      </button>

      <!-- Image Carousel (same as DetailPage) -->
      <div class="carousel" v-if="displayImages.length > 0">
        <div class="carousel-viewport">
          <div class="carousel-track" :style="{ transform: `translateX(-${currentImage * 100}%)` }">
            <div v-for="(img, i) in displayImages" :key="i" class="carousel-slide">
              <img :src="img" :alt="detail.name + ' - ' + (i + 1)" class="carousel-image" />
            </div>
          </div>
        </div>
        <button v-if="displayImages.length > 1" class="carousel-arrow carousel-prev" @click="prevImage" aria-label="上一张">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button v-if="displayImages.length > 1" class="carousel-arrow carousel-next" @click="nextImage" aria-label="下一张">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div v-if="displayImages.length > 1" class="carousel-dots">
          <button v-for="(_, i) in displayImages" :key="i" class="carousel-dot" :class="{ active: i === currentImage }" @click="currentImage = i" :aria-label="'第 ' + (i + 1) + ' 张'"></button>
        </div>
        <!-- Price badge floating over carousel -->
        <div class="price-badge">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ detail.price }}</span>
        </div>
      </div>

      <!-- Fallback -->
      <div v-else class="carousel carousel-fallback">
        <div class="fallback-img">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64">
            <rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L6 20"/>
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="detail-content container">
        <div class="product-header">
          <h1 class="product-name">{{ detail.name }}</h1>
          <span class="badge badge-brown" v-if="detail.isHot">热销</span>
        </div>

        <div class="product-action-row">
          <div class="product-price-row">
            <div class="current-price">¥{{ detail.price }}</div>
            <div class="original-price" v-if="detail.originalPrice">¥{{ detail.originalPrice }}</div>
            <span class="badge badge-gold" v-if="detail.originalPrice">省{{ Math.round((1 - detail.price / detail.originalPrice) * 100) }}%</span>
          </div>
          <button class="contact-btn" @click="showContact = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            联系购买
          </button>
        </div>

        <div class="product-meta">
          <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> {{ detail.location }}</span>
          <span><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> {{ detail.rating }}</span>
          <span>已售 {{ detail.sold || 0 }}</span>
        </div>

        <div class="tags" v-if="detail.tags && detail.tags.length">
          <span class="tag" v-for="(t, i) in detail.tags" :key="i">{{ t }}</span>
        </div>

        <section class="detail-section" v-if="detail.material || detail.specification">
          <h2 class="section-title">规格参数</h2>
          <div class="spec-grid">
            <div v-if="detail.material"><span class="spec-label">材质</span><span>{{ detail.material }}</span></div>
            <div v-if="detail.specification"><span class="spec-label">规格</span><span>{{ detail.specification }}</span></div>
            <div v-if="detail.stock !== undefined"><span class="spec-label">库存</span><span>{{ detail.stock }}</span></div>
          </div>
        </section>

        <section class="detail-section" v-if="detail.description">
          <h2 class="section-title">产品描述</h2>
          <p class="detail-text" v-html="formatText(detail.description)"></p>
        </section>

        <section class="detail-section" v-if="detail.culturalStory">
          <h2 class="section-title">文化故事</h2>
          <p class="detail-text story-text">{{ detail.culturalStory }}</p>
        </section>

        <section class="detail-section" v-if="detail.tips && detail.tips.length">
          <h2 class="section-title">使用贴士</h2>
          <ul class="tips-list">
            <li v-for="(tip, i) in detail.tips" :key="i">{{ tip }}</li>
          </ul>
        </section>
      </div>
    </template>

    <!-- Contact Modal -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="showContact" @click.self="showContact = false">
        <div class="modal-card">
          <button class="modal-close" @click="showContact = false" aria-label="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="modal-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h3 class="modal-title">联系购买</h3>
          <p class="modal-sub">如需购买此产品，请通过以下方式联系我们</p>
          <div class="contact-list">
            <div class="contact-item qrcode-item" @click="showQrcode = true">
              <div class="contact-icon-wrap qrcode">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zM24 14.656C24 11.561 21.013 9 17.25 9 13.486 9 10.5 11.562 10.5 14.656c0 3.095 2.986 5.657 6.75 5.657.397 0 .795-.023 1.193-.078a.596.596 0 01.497.136l1.328.764a.22.22 0 00.113.037.2.2 0 00.198-.202c0-.05-.02-.098-.033-.145l-.27-1.014a.408.408 0 01.148-.459C22.026 18.228 24 16.592 24 14.656zm-2.995-1.117c.44 0 .798.363.798.81a.804.804 0 01-.798.808.804.804 0 01-.798-.808c0-.448.358-.81.798-.81zm-3.994 0c.44 0 .798.363.798.81a.804.804 0 01-.798.808.804.804 0 01-.797-.808c0-.448.358-.81.797-.81z"/>
                </svg>
              </div>
              <div class="contact-info">
                <span class="contact-label">前往微信小程序购买（推荐）</span>
                <span class="contact-value">扫码查看完整商城</span>
              </div>
            </div>
            <div class="contact-item" @click="copyWechat">
              <div class="contact-icon-wrap wechat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zM24 14.656C24 11.561 21.013 9 17.25 9 13.486 9 10.5 11.562 10.5 14.656c0 3.095 2.986 5.657 6.75 5.657.397 0 .795-.023 1.193-.078a.596.596 0 01.497.136l1.328.764a.22.22 0 00.113.037.2.2 0 00.198-.202c0-.05-.02-.098-.033-.145l-.27-1.014a.408.408 0 01.148-.459C22.026 18.228 24 16.592 24 14.656zm-2.995-1.117c.44 0 .798.363.798.81a.804.804 0 01-.798.808.804.804 0 01-.798-.808c0-.448.358-.81.798-.81zm-3.994 0c.44 0 .798.363.798.81a.804.804 0 01-.798.808.804.804 0 01-.797-.808c0-.448.358-.81.797-.81z"/>
                </svg>
              </div>
              <div class="contact-info">
                <span class="contact-label">微信</span>
                <span class="contact-value">wx_******** <span class="copy-hint">{{ wechatCopied ? '已复制' : '点击复制' }}</span></span>
              </div>
            </div>
            <a class="contact-item" href="tel:13800000000">
              <div class="contact-icon-wrap phone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <div class="contact-info">
                <span class="contact-label">电话</span>
                <span class="contact-value">13800000000</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- QR Code Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div class="modal-overlay" v-if="showQrcode" @click.self="showQrcode = false">
          <div class="modal-card qrcode-modal">
            <button class="modal-close" @click="showQrcode = false" aria-label="关闭">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h3 class="modal-title">扫码进入小程序</h3>
            <p class="modal-sub">微信扫一扫，进入「陇韵匠心」小程序选购</p>
            <div class="qrcode-img-wrap">
              <img src="/qrcode.jpg" alt="小程序码" class="qrcode-img" />
            </div>
            <p class="qrcode-tip">长按识别或保存图片后微信扫码</p>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../utils/api'

const route = useRoute()

const detail = ref({})
const loading = ref(true)
const currentImage = ref(0)
const showContact = ref(false)
const showQrcode = ref(false)
const wechatCopied = ref(false)

let autoPlayTimer = null
const AUTO_PLAY_INTERVAL = 4000

const displayImages = computed(() => {
  if (!detail.value) return []
  if (detail.value.images && detail.value.images.length > 0) return detail.value.images
  if (detail.value.image) return [detail.value.image]
  return []
})

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
    autoPlayTimer = setInterval(nextImage, AUTO_PLAY_INTERVAL)
  }
}
function stopAutoPlay() {
  if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null }
}
function resetAutoPlay() { stopAutoPlay(); startAutoPlay() }

function formatText(text) {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

async function copyWechat() {
  try {
    await navigator.clipboard.writeText('wx_********')
    wechatCopied.value = true
    setTimeout(() => { wechatCopied.value = false }, 2000)
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea')
    ta.value = 'wx_********'
    ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    wechatCopied.value = true
    setTimeout(() => { wechatCopied.value = false }, 2000)
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const data = await api.products.detail(route.params.id)
    if (data) {
      detail.value = data
      if (!detail.value.images || !detail.value.images.length) {
        if (detail.value.image) detail.value.images = [detail.value.image]
      }
    }
  } catch (e) {
    console.error('Failed to load product:', e)
  } finally {
    loading.value = false
    setTimeout(startAutoPlay, 100)
  }
})

onUnmounted(() => { stopAutoPlay() })
</script>

<style scoped>
.product-detail-page { min-height: 80vh; padding-bottom: 60px; background: #F0E8DB; }

/* Back button */
.back-btn {
  position: fixed; top: 68px; left: 16px; z-index: 50;
  display: inline-flex; align-items: center; gap: 4px;
  padding: 8px 16px;
  background: rgba(255,255,255,.92); backdrop-filter: blur(8px);
  border: 1px solid rgba(139,69,19,.1); border-radius: var(--radius);
  color: var(--brown); font-size: .85rem; font-weight: 500; cursor: pointer;
  box-shadow: var(--shadow-sm); font-family: var(--font-sans);
  transition: all var(--fast) var(--ease-in-out);
}
.back-btn:hover { background: #fff; box-shadow: var(--shadow-md); transform: translateY(-1px); }

/* Carousel — identical to DetailPage */
.carousel { position: relative; width: 100%; max-height: 500px; overflow: hidden; background: var(--brown-dark); }
.carousel-viewport { width: 100%; overflow: hidden; }
.carousel-track { display: flex; transition: transform .45s cubic-bezier(.25,.46,.45,.94); will-change: transform; }
.carousel-slide { min-width: 100%; display: flex; align-items: center; justify-content: center; }
.carousel-image { width: 100%; height: 400px; object-fit: cover; display: block; }
.carousel-arrow {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
  width: 42px; height: 42px; border: none; border-radius: 50%;
  background: rgba(255,255,255,.85); backdrop-filter: blur(4px);
  color: var(--brown); cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-sm); transition: all var(--fast) var(--ease-in-out);
}
.carousel-arrow:hover { background: #fff; box-shadow: var(--shadow-md); }
.carousel-prev { left: 16px; }
.carousel-next { right: 16px; }
.carousel-dots { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 10; }
.carousel-dot {
  width: 10px; height: 10px; border-radius: 50%; border: none;
  background: rgba(255,255,255,.5); cursor: pointer; padding: 0;
  transition: all .25s var(--ease-in-out);
}
.carousel-dot.active { background: #fff; transform: scale(1.3); box-shadow: 0 0 6px rgba(255,255,255,.5); }
.carousel-fallback { display: flex; align-items: center; justify-content: center; height: 300px; }
.fallback-img { color: rgba(255,255,255,.3); }

/* Price badge — floating over carousel */
.price-badge {
  position: absolute; bottom: 44px; right: 20px; z-index: 10;
  background: linear-gradient(135deg, rgba(196,98,16,.95), rgba(164,82,0,.95));
  color: #fff; padding: 8px 18px; border-radius: 20px; display: flex; align-items: baseline; gap: 2px;
  box-shadow: 0 4px 16px rgba(0,0,0,.25);
}
.price-symbol { font-size: .85rem; }
.price-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-serif); }

/* Content */
.detail-content { padding-top: 28px; }
.product-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.product-name { font-family: var(--font-serif); font-size: 1.8rem; font-weight: 700; color: var(--dark); letter-spacing: 1px; }
.product-action-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
.product-price-row { display: flex; align-items: baseline; gap: 12px; }
.current-price { font-size: 2rem; font-weight: 700; color: var(--orange); font-family: var(--font-serif); }
.original-price { font-size: 1.05rem; color: var(--grey-light); text-decoration: line-through; }
.product-meta { display: flex; gap: 20px; color: var(--grey); font-size: .9rem; margin-bottom: 12px; flex-wrap: wrap; }
.product-meta span { display: flex; align-items: center; gap: 4px; }
.product-meta svg { color: var(--brown-light); }

/* Sections — match DetailPage */
.detail-section { margin-top: 32px; }
.section-title {
  font-family: var(--font-serif); font-size: 1.2rem; font-weight: 700;
  color: var(--dark); margin-bottom: 12px;
  display: flex; align-items: center; gap: 10px;
}
.section-title::before {
  content: ''; width: 4px; height: 20px; border-radius: 2px;
  background: linear-gradient(180deg, var(--gold), var(--brown));
}
.detail-text { font-size: .92rem; line-height: 1.8; color: var(--grey); }
.story-text { font-style: italic; color: var(--brown); }
.spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: .9rem; }
.spec-label { color: var(--grey-light); margin-right: 8px; }
.tips-list {
  list-style: none; padding: 0;
}
.tips-list li {
  position: relative; padding: 8px 0 8px 22px; font-size: .9rem; color: var(--grey); line-height: 1.7;
  border-bottom: 1px solid rgba(139,69,19,.06);
}
.tips-list li:last-child { border-bottom: none; }
.tips-list li::before {
  content: ''; position: absolute; left: 0; top: 14px;
  width: 6px; height: 6px; border-radius: 50%; background: var(--gold);
}

/* Contact button */
.contact-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--brown), #6B3410);
  color: #fff; border: none; border-radius: var(--radius);
  font-size: 1rem; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 16px rgba(139,69,19,.3);
  transition: all var(--fast) var(--ease-in-out);
  font-family: var(--font-sans);
}
.contact-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(139,69,19,.4); }
.contact-btn:active { transform: scale(.97); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(28,14,8,.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal-card {
  position: relative; background: #fff; border-radius: var(--radius-lg);
  padding: 36px 28px 28px; max-width: 400px; width: 100%;
  box-shadow: 0 16px 48px rgba(0,0,0,.25);
  animation: modal-in .3s var(--ease-out);
}
@keyframes modal-in {
  from { opacity: 0; transform: translateY(20px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.modal-close {
  position: absolute; top: 12px; right: 12px;
  width: 36px; height: 36px; border: none; border-radius: 50%;
  background: rgba(139,69,19,.06); color: var(--brown);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all var(--fast) var(--ease-in-out);
}
.modal-close:hover { background: rgba(139,69,19,.15); }
.modal-icon {
  width: 60px; height: 60px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(212,168,106,.2), rgba(139,69,19,.1));
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: var(--brown);
}
.modal-title {
  text-align: center; font-family: var(--font-serif); font-size: 1.25rem;
  font-weight: 700; color: var(--dark); margin-bottom: 4px;
}
.modal-sub {
  text-align: center; font-size: .85rem; color: var(--grey); margin-bottom: 24px;
}
.contact-list { display: flex; flex-direction: column; gap: 10px; }
.contact-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; border-radius: var(--radius);
  background: rgba(245,230,211,.4); border: 1px solid rgba(212,168,106,.12);
  text-decoration: none; cursor: pointer;
  transition: all var(--fast) var(--ease-in-out);
}
a.contact-item { color: inherit; }
.contact-item:hover { background: rgba(245,230,211,.8); border-color: rgba(212,168,106,.3); }
.contact-icon-wrap {
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  background: rgba(139,69,19,.1); color: var(--brown);
  display: flex; align-items: center; justify-content: center;
}
.contact-icon-wrap.qrcode { background: rgba(7,193,96,.12); color: #07C160; }
.contact-item.qrcode-item { border-color: rgba(7,193,96,.3); }
.contact-item.qrcode-item:hover { background: rgba(7,193,96,.06); border-color: rgba(7,193,96,.5); }
.contact-icon-wrap.phone { background: rgba(212,168,106,.15); color: var(--brown); }
.contact-info { display: flex; flex-direction: column; gap: 2px; }
.contact-label { font-size: .75rem; color: var(--grey-light); }
.contact-value { font-size: .92rem; color: var(--dark); font-weight: 500; word-break: break-all; }
.copy-hint { font-size: .7rem; color: var(--gold); font-weight: 400; margin-left: 6px; }

/* QR Code Modal */
.qrcode-modal { text-align: center; max-width: 380px; }
.qrcode-img-wrap {
  width: 260px; height: 260px;
  margin: 20px auto;
  padding: 16px;
  background: #fff;
  border-radius: var(--radius-lg, 16px);
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
}
.qrcode-img { width: 100%; height: 100%; object-fit: contain; }
.qrcode-tip { font-size: .78rem; color: var(--grey-light); margin: 0; }

@media (max-width: 768px) {
  .carousel-image { height: 280px; }
  .carousel-fallback { height: 220px; }
  .product-name { font-size: 1.35rem; }
  .back-btn { top: 64px; left: 8px; padding: 6px 12px; font-size: .8rem; }
  .price-badge { bottom: 36px; right: 12px; padding: 6px 14px; }
  .price-value { font-size: 1.2rem; }
  .spec-grid { grid-template-columns: 1fr; }
  .contact-btn { padding: 10px 20px; font-size: .9rem; }
  .current-price { font-size: 1.6rem; }
}
@media (max-width: 480px) {
  .carousel-image { height: 220px; }
  .carousel-fallback { height: 180px; }
  .carousel-arrow { width: 34px; height: 34px; }
}
</style>
