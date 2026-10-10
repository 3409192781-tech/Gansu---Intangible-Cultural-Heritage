<template>
  <div class="home-page">
    <!-- ═══ HERO — Full viewport, scroll-driven parallax ═══ -->
    <section class="hero">
      <div class="hero-bg">
        <img
          :src="heroImage"
          alt="Hero"
          class="hero-img"
          :style="{ transform: `scale(${1 + scrollPx * 0.0003})` }"
        />
        <div class="hero-gradient"></div>
      </div>
      <div class="hero-content" :style="{ transform: `translateY(${scrollPx * -0.15}px)`, opacity: Math.max(0, 1 - scrollPx * 0.002) }">
        <p class="hero-eyebrow reveal-visible">{{ heroEyebrow }}</p>
        <h1 class="hero-headline reveal-visible">{{ heroTitle }}</h1>
        <p class="hero-sub reveal-visible">{{ heroSub }}</p>
        <div class="hero-search reveal-visible" @click="$router.push('/search')">
          <div class="hero-search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span>搜索景点、美食、非遗…</span>
          </div>
        </div>
      </div>
      <div class="hero-scroll" :style="{ opacity: Math.max(0, 1 - scrollPx * 0.004) }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
      </div>
    </section>

    <!-- ═══ QUICK ENTRY — Staggered card reveal ═══ -->
    <section class="quick-section container" data-reveal="fade-up">
      <div class="quick-grid">
        <div v-for="(e, i) in quickEntries" :key="i"
          class="quick-card reveal-child"
          :style="{ transitionDelay: i * 60 + 'ms' }"
          @click="handleQuickEntry(i)"
        >
          <div class="quick-card-icon" :style="{ background: entryColors[i % entryColors.length] }">
            <img :src="'/icons/' + entryIconFiles[i % entryIconFiles.length]" class="quick-card-svg" :alt="e.text" />
          </div>
          <span class="quick-card-text">{{ e.text }}</span>
        </div>
      </div>
    </section>

    <!-- ═══ HOT SPOTS — Staggered scale-in ═══ -->
    <section class="container section" data-reveal="scale-in">
      <h2 class="section-title reveal-child">热门景点</h2>
      <div class="grid grid-3">
        <div v-for="(s, si) in hotSpots" :key="s.id"
          class="spot-card reveal-child"
          :style="{ transitionDelay: si * 80 + 'ms' }"
          @click="$router.push('/spots/' + s.id)"
        >
          <div class="spot-card-img-wrap">
            <img :src="s.image" :alt="s.name" class="spot-card-img" />
            <div class="spot-card-shade"></div>
            <div class="spot-card-overlay">
              <p class="spot-card-loc">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ s.location }}
              </p>
              <span class="spot-card-link">探索
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </div>
          </div>
          <div class="spot-card-body">
            <div class="spot-card-top">
              <h3 class="spot-card-name">{{ s.name }}</h3>
              <span class="spot-card-rating">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {{ s.rating }}
              </span>
            </div>
            <div class="tags">
              <span class="tag" v-for="(t, ti) in (s.tags || []).slice(0, 3)" :key="ti">{{ t }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="section-more reveal-child" @click="$router.push('/spots')">
        查看全部景点 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
    </section>

    <!-- ═══ CULTURES — Slide-left reveal ═══ -->
    <section class="container section" data-reveal="slide-left">
      <h2 class="section-title reveal-child">非遗文化</h2>
      <div class="grid grid-3">
        <div v-for="(c, ci) in cultures" :key="c.id" class="spot-card reveal-child"
          :style="{ transitionDelay: ci * 70 + 'ms' }"
          @click="$router.push('/cultures/' + c.id)"
        >
          <div class="spot-card-img-wrap">
            <img :src="c.image" :alt="c.name" class="spot-card-img" />
            <div class="spot-card-shade"></div>
            <div class="spot-card-overlay">
              <span class="spot-card-link">探索
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </div>
          </div>
          <div class="spot-card-body">
            <h3 class="spot-card-name">{{ c.name }}</h3>
            <p style="font-size:.8rem;color:var(--grey)">{{ c.desc }}</p>
          </div>
        </div>
      </div>
      <div class="section-more reveal-child" @click="$router.push('/cultures')">
        查看全部非遗 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
    </section>

    <!-- ═══ FOODS — Slide-right reveal ═══ -->
    <section class="container section" data-reveal="slide-right">
      <h2 class="section-title reveal-child">美食推荐</h2>
      <div class="food-bento">
        <div v-for="(f, i) in foods" :key="f.id"
          class="food-bento-card reveal-child"
          :class="{ 'food-bento-hero': i === 0 }"
          :style="{ transitionDelay: i * 100 + 'ms' }"
          @click="$router.push('/foods/' + f.id)"
        >
          <img :src="f.image" :alt="f.name" class="food-bento-img" />
          <div class="food-bento-overlay"></div>
          <div class="food-bento-info">
            <div class="food-bento-top">
              <h3 class="food-bento-name">{{ f.name }}</h3>
              <span class="food-bento-rating" v-if="f.rating">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {{ f.rating }}
              </span>
            </div>
            <p class="food-bento-area">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ f.area || f.location }}
            </p>
            <div class="tags">
              <span class="tag" v-for="(t, ti) in (f.tags || []).slice(0, 3)" :key="ti">{{ t }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="section-more reveal-child" @click="$router.push('/foods')">
        查看全部美食 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
    </section>

    <!-- ═══ PRODUCT — Parallax split ═══ -->
    <section v-if="productRow.name" class="product-section full-bleed" data-reveal="fade-up">
      <div class="product-split">
        <div class="product-split-img reveal-child">
          <img :src="productRow.image" :alt="productRow.name" />
        </div>
        <div class="product-split-body reveal-child" style="transition-delay:120ms">
          <span class="badge badge-brown">文创推荐</span>
          <h2 class="product-split-name">{{ productRow.name }}</h2>
          <div class="tags">
            <span class="tag" v-for="(t, i) in (productRow.tags || []).slice(0, 4)" :key="i">{{ t }}</span>
          </div>
          <div class="product-split-price">
            <span class="price-now">¥{{ productRow.price }}</span>
            <span v-if="productRow.originalPrice" class="price-was">¥{{ productRow.originalPrice }}</span>
          </div>
          <p class="product-split-meta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ productRow.location }}
            <span style="margin-left:16px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {{ productRow.rating }}
            </span>
            <span style="margin-left:16px">已售 {{ productRow.sold || 0 }}</span>
          </p>
          <button class="btn btn-gold btn-lg" @click="$router.push('/products/301')">
            查看详情
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ═══ EVENTS — Fade-up reveal ═══ -->
    <section class="container section" data-reveal="fade-up">
      <h2 class="section-title reveal-child">近期活动</h2>
      <div class="event-timeline">
        <div v-for="(ev, i) in events" :key="i" class="event-timeline-item reveal-child" :style="{ transitionDelay: i * 80 + 'ms' }">
          <div class="event-date-block">
            <span class="ev-month">{{ ev.month }}</span>
            <span class="ev-day">{{ ev.day }}</span>
          </div>
          <div class="event-line"></div>
          <div class="event-body">
            <h4 class="ev-title">{{ ev.title }}</h4>
            <p class="ev-loc">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ ev.location }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'

const router = useRouter()

const hotSpots = ref([])
const cultures = ref([])
const foods = ref([])
const events = ref([])
const productRow = ref({})
const loading = ref(true)
const scrollPx = ref(0)

// Hero config — from site settings, with defaults
const heroImage = ref('https://img.gansu-culture.xyz/spots/spot101-1.jpg')
const heroTitle = ref('云游甘肃')
const heroSub = ref('世界文化遗产、非遗技艺、丝路美食 — 一站探索陇原大地的瑰宝')
const heroEyebrow = ref('探访千年丝路')

const quickEntries = [
  { text: '地图导览' }, { text: '景点推荐' }, { text: '非遗文化' },
  { text: '文创产品' }, { text: '特色美食' }, { text: '旅游攻略' },
  { text: '联系我们' },
]
const entryColors = [
  '#8B4513', '#D4A86A', '#4A8F6D', '#CC8800', '#C46210', '#3B7DD8', '#6B7B8B',
]
const entryIconFiles = [
  'map.svg', 'spot.svg', 'culture.svg', 'creation.svg', 'food.svg', 'guide.svg', 'phone.svg',
]

function handleQuickEntry(i) {
  const routes = ['/map', '/spots', '/cultures', '/products', '/foods', '/guides', '/about']
  router.push(routes[i] || '/')
}

let rafId = null
function onScroll() {
  if (!rafId) {
    rafId = requestAnimationFrame(() => {
      scrollPx.value = window.scrollY
      rafId = null
    })
  }
}

function observeReveals() {
  const sections = document.querySelectorAll('[data-reveal]')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target
        const kind = el.dataset.reveal || 'fade-up'
        el.classList.add('reveal-visible', 'reveal-' + kind)
        observer.unobserve(el)
      }
    })
  }, { threshold: 0.12 })

  sections.forEach(el => observer.observe(el))
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })

  // 加载站点设置（Hero 图片/标题等）
  try {
    const settings = await api.settings.get()
    if (settings) {
      if (settings.heroImage) heroImage.value = settings.heroImage
      if (settings.heroTitle) heroTitle.value = settings.heroTitle
      if (settings.heroSub) heroSub.value = settings.heroSub
      if (settings.heroEyebrow) heroEyebrow.value = settings.heroEyebrow
    }
  } catch {}

  loading.value = true
  try {
    const data = await api.home.get()
    if (data) {
      hotSpots.value = data.hotSpots || []
      cultures.value = data.hotCultures || []
      foods.value = data.hotFoods || []
      events.value = data.events || []
    }
    const product = await api.products.detail('301')
    if (product) productRow.value = product
  } catch {
    hotSpots.value = [
      { id: 101, name: '莫高窟', image: 'https://img.gansu-culture.xyz/spots/spot101-1.jpg', tags: ['世界文化遗产','AAAAA级景区'], location: '敦煌市', rating: '4.9' },
      { id: 103, name: '麦积山石窟', image: 'https://img.gansu-culture.xyz/spots/spot103-1.jpg', tags: ['世界文化遗产','AAAAA级景区'], location: '天水市', rating: '4.9' },
      { id: 104, name: '嘉峪关关城', image: 'https://img.gansu-culture.xyz/spots/spot104-1.jpg', tags: ['AAAAA级景区','万里长城'], location: '嘉峪关市', rating: '4.8' },
      { id: 105, name: '张掖丹霞', image: 'https://img.gansu-culture.xyz/spots/spot105-1.jpg', tags: ['AAAAA级景区','世界地质公园'], location: '张掖市临泽县', rating: '4.8' },
      { id: 102, name: '八坊十三巷', image: 'https://img.gansu-culture.xyz/spots/spot102-1.jpg', tags: ['AAAA级景区','民族风情'], location: '临夏市', rating: '4.8' },
      { id: 106, name: '鸣沙山月牙泉', image: 'https://img.gansu-culture.xyz/spots/spot106-1.jpg', tags: ['AAAAA级景区','沙漠奇观'], location: '敦煌市', rating: '4.7' },
      { id: 107, name: '玉门关遗址', image: 'https://img.gansu-culture.xyz/spots/spot107-1.jpg', tags: ['世界文化遗产','丝路遗址'], location: '敦煌市', rating: '4.6' },
      { id: 108, name: '拉卜楞寺', image: 'https://img.gansu-culture.xyz/spots/spot108-1.jpg', tags: ['AAAA级景区','藏传佛教'], location: '甘南州夏河县', rating: '4.7' },
      { id: 110, name: '马蹄寺石窟群', image: 'https://img.gansu-culture.xyz/spots/spot110-1.jpg', tags: ['AAAA级景区','石窟艺术'], location: '张掖市肃南县', rating: '4.5' },
    ]
    cultures.value = [
      { id: 1, name: '敦煌彩塑', desc: '千年艺术瑰宝', image: 'https://img.gansu-culture.xyz/details/detail1-1.jpg' },
      { id: 21, name: '花儿', desc: '世界级非遗', image: 'https://img.gansu-culture.xyz/details/detail21-1.jpg' },
      { id: 6, name: '庆阳香包绣制', desc: '传统手工艺', image: 'https://img.gansu-culture.xyz/details/detail6-1.jpg' },
      { id: 2, name: '临夏砖雕', desc: '传统美术', image: 'https://img.gansu-culture.xyz/details/detail2-1.jpg' },
      { id: 10, name: '敦煌曲子戏', desc: '西北戏曲之魂', image: 'https://img.gansu-culture.xyz/details/detail10-1.jpg' },
      { id: 3, name: '天水雕漆技艺', desc: '传统工艺美术', image: 'https://img.gansu-culture.xyz/details/detail3-1.jpg' },
      { id: 4, name: '甘南藏族唐卡', desc: '藏族绘画艺术', image: 'https://img.gansu-culture.xyz/details/detail4-1.jpg' },
      { id: 22, name: '皮影戏', desc: '灯影里的千年戏剧', image: 'https://img.gansu-culture.xyz/details/detail22-1.jpg' },
      { id: 8, name: '酒泉夜光杯雕', desc: '丝路瑰宝', image: 'https://img.gansu-culture.xyz/details/detail8-1.jpg' },
      { id: 14, name: '秦安小曲', desc: '陇上清音', image: 'https://img.gansu-culture.xyz/details/detail14-1.jpg' },
    ]
    foods.value = [
      { id: 7, name: '兰州牛肉面', area: '兰州', image: 'https://img.gansu-culture.xyz/details/detail7-1.jpg', rating: '4.9', tags: ['面食','中华名吃','非遗美食'] },
      { id: 54, name: '陇西腊肉', area: '定西', image: 'https://img.gansu-culture.xyz/details/detail54-1.jpg', rating: '4.6', tags: ['肉食','非遗美食','百年老字号'] },
      { id: 23, name: '静宁烧鸡', area: '平凉', image: 'https://img.gansu-culture.xyz/details/detail23-1.jpg', rating: '4.7', tags: ['肉食','非遗美食','平凉特色'] },
      { id: 15, name: '天水呱呱', area: '天水', image: 'https://img.gansu-culture.xyz/details/detail15-1.jpg', rating: '4.7', tags: ['小吃','非遗美食','天水特色'] },
      { id: 205, name: '手抓羊肉', area: '临夏', image: 'https://img.gansu-culture.xyz/details/detail205-1.jpg', rating: '4.8', tags: ['肉食','清真美食','临夏风味'] },
    ]
    events.value = [
      { month: '8月', day: '3日', title: '甘南香巴拉旅游艺术节', location: '甘南州合作市' },
      { month: '9月', day: '20日', title: '第九届敦煌文博会', location: '敦煌市' },
      { month: '10月', day: '1日', title: '国庆文化旅游黄金周', location: '全省各地' },
      { month: '11月', day: '5日', title: '天水伏羲文化节', location: '天水市' },
      { month: '12月', day: '18日', title: '张掖冰雪旅游节', location: '张掖市' },
    ]
    productRow.value = { name: '平凉剪纸', price: 68, originalPrice: 98, sold: '1.5k', location: '平凉市', rating: '4.7', tags: ['省级非遗','传统美术','手工艺术品'], image: 'https://img.gansu-culture.xyz/details/detail1-1.jpg' }
  } finally {
    loading.value = false
    setTimeout(observeReveals, 100)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.home-page { background: #F0E8DB; }

/* ═══ HERO — Scroll-driven parallax zoom ═══ */
.hero {
  position: relative; min-height: 100dvh;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.hero-bg { position: absolute; inset: -10%; }
.hero-img {
  width: 100%; height: 100%; object-fit: cover;
  will-change: transform;
}
.hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(44,24,16,.45) 0%, rgba(44,24,16,.25) 40%, rgba(44,24,16,.65) 100%);
}
.hero-content {
  position: relative; z-index: 1; text-align: center;
  max-width: 720px; padding: 0 var(--sp-5);
  will-change: transform, opacity;
}
.hero-eyebrow {
  font-size: .8rem; font-weight: 500; letter-spacing: .2em;
  color: var(--gold-light); text-transform: uppercase;
  margin-bottom: var(--sp-4);
}
.hero-headline {
  font-family: var(--font-serif); font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 900; color: var(--cream);
  letter-spacing: 4px; line-height: 1.15;
  margin-bottom: var(--sp-4);
  text-shadow: 0 2px 12px rgba(0,0,0,.3);
}
.hero-sub {
  font-size: 1.05rem; color: rgba(255,248,231,.85);
  line-height: 1.6; max-width: 520px; margin: 0 auto var(--sp-8);
  text-shadow: 0 1px 4px rgba(0,0,0,.2);
}
.hero-search { cursor: pointer; }
.hero-search-box {
  display: inline-flex; align-items: center; gap: var(--sp-3);
  background: rgba(255,248,231,.92); backdrop-filter: blur(12px);
  border: 1px solid rgba(212,168,106,.25);
  color: var(--grey); padding: 14px 28px; border-radius: 999px;
  font-size: .95rem;
  transition: all var(--normal) var(--ease-out);
  box-shadow: 0 4px 24px rgba(0,0,0,.12);
}
.hero-search-box:hover {
  background: var(--cream);
  border-color: var(--gold);
  box-shadow: 0 6px 32px rgba(0,0,0,.18);
  transform: translateY(-1px);
}
.hero-scroll {
  position: absolute; bottom: var(--sp-6); left: 50%; transform: translateX(-50%);
  z-index: 1; color: rgba(255,248,231,.5); animation: float 3s ease-in-out infinite;
  pointer-events: none; will-change: opacity;
}

/* ═══ REVEAL SYSTEM ═══ */
[data-reveal] {
  opacity: 0;
  transition: opacity .7s var(--ease-out), transform .7s var(--ease-out);
}
[data-reveal].reveal-visible { opacity: 1; }

/* Default: fade-up */
[data-reveal="fade-up"] { transform: translateY(32px); }
[data-reveal="fade-up"].reveal-visible { transform: translateY(0); }

/* Scale-in */
[data-reveal="scale-in"] { transform: scale(0.94); }
[data-reveal="scale-in"].reveal-visible { transform: scale(1); }

/* Slide-left */
[data-reveal="slide-left"] { transform: translateX(-40px); }
[data-reveal="slide-left"].reveal-visible { transform: translateX(0); }

/* Slide-right */
[data-reveal="slide-right"] { transform: translateX(40px); }
[data-reveal="slide-right"].reveal-visible { transform: translateX(0); }

/* Reveal children: staggered entrance */
.reveal-child {
  opacity: 0; transform: translateY(20px);
  transition: opacity .6s var(--ease-out), transform .6s var(--ease-out);
}
.reveal-visible .reveal-child,
.reveal-fade-up .reveal-child {
  opacity: 1; transform: translateY(0);
}
.reveal-scale-in .reveal-child {
  opacity: 1; transform: scale(1);
}
.reveal-slide-left .reveal-child {
  opacity: 1; transform: translateX(0);
}
.reveal-slide-right .reveal-child {
  opacity: 1; transform: translateX(0);
}

/* Keep hero content always visible initially */
.reveal-visible { opacity: 1; }
.hero-eyebrow.reveal-visible, .hero-headline.reveal-visible,
.hero-sub.reveal-visible, .hero-search.reveal-visible {
  transform: translateY(0); opacity: 1;
}

/* ═══ QUICK ENTRY ═══ */
.quick-section { margin-top: -36px; position: relative; z-index: 2; }
.quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-4); }
.quick-card {
  background: #fff; border-radius: var(--radius-lg); padding: var(--sp-6) var(--sp-4);
  text-align: center; cursor: pointer;
  border: 1px solid rgba(212,168,106,.08);
  transition: all var(--normal) var(--ease-out);
  box-shadow: var(--shadow-card);
}
.quick-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
.quick-card:active { transform: scale(0.97); }
.quick-card-icon {
  width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center;
  margin: 0 auto var(--sp-3);
}
.quick-card-svg { width: 32px; height: 32px; }
.quick-card-text { font-size: .85rem; color: var(--dark); font-weight: 500; }
@media (max-width: 768px) {
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .quick-section { margin-top: -24px; }
}

/* ═══ SECTION MORE ═══ */
.section-more {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-top: var(--sp-6); font-size: .88rem; color: var(--brown); font-weight: 500;
  cursor: pointer; transition: color var(--fast);
}
.section-more:hover { color: var(--brown-dark); }
.section-more svg { transition: transform var(--fast); }
.section-more:hover svg { transform: translateX(3px); }

/* ═══ SPOT CARD (web-native, hover-reveal) ═══ */
.spot-card {
  border-radius: var(--radius-lg); overflow: hidden;
  background: #fff; border: 1px solid rgba(212,168,106,.08);
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: all var(--normal) var(--ease-out);
}
.spot-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
.spot-card:active { transform: scale(0.98); }
.spot-card-img-wrap { position: relative; height: 220px; overflow: hidden; }
.spot-card-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform .5s var(--ease-out);
}
.spot-card:hover .spot-card-img { transform: scale(1.06); }
.spot-card-shade {
  position: absolute; inset: 0;
  background: linear-gradient(transparent 50%, rgba(44,24,16,.45));
}
.spot-card-overlay {
  position: absolute; bottom: 0; left: 0; right: 0; padding: var(--sp-4);
  display: flex; justify-content: space-between; align-items: flex-end;
  opacity: 0; transform: translateY(8px);
  transition: all var(--normal) var(--ease-out);
}
.spot-card:hover .spot-card-overlay { opacity: 1; transform: translateY(0); }
.spot-card-loc {
  color: rgba(255,248,231,.9); font-size: .8rem;
  display: flex; align-items: center; gap: 4px;
}
.spot-card-link {
  color: var(--gold-light); font-size: .78rem; font-weight: 600;
  display: flex; align-items: center; gap: 4px;
}
.spot-card-body { padding: var(--sp-4); }
.spot-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-2); }
.spot-card-name { font-family: var(--font-serif); font-size: 1rem; font-weight: 700; color: var(--dark); }
.spot-card-rating {
  display: flex; align-items: center; gap: 3px; font-size: .82rem; font-weight: 600;
  color: var(--gold-dark);
}
.spot-card-rating svg { color: var(--gold); }

/* ═══ FOODS — Bento grid ═══ */
.food-bento { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--sp-4); }
.food-bento-card {
  position: relative; border-radius: var(--radius-lg); overflow: hidden;
  cursor: pointer; min-height: 220px;
  box-shadow: var(--shadow-card); border: 1px solid rgba(212,168,106,.08);
  transition: all var(--normal) var(--ease-out);
}
.food-bento-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
.food-bento-hero { grid-column: span 2; grid-row: span 2; min-height: 400px; }
.food-bento-img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; transition: transform .5s var(--ease-out); }
.food-bento-card:hover .food-bento-img { transform: scale(1.04); }
.food-bento-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(transparent 35%, rgba(44,24,16,.7));
}
.food-bento-info {
  position: absolute; bottom: 0; left: 0; right: 0; padding: var(--sp-5);
  color: var(--cream);
}
.food-bento-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.food-bento-name { font-family: var(--font-serif); font-size: 1.2rem; font-weight: 700; }
.food-bento-hero .food-bento-name { font-size: 1.6rem; }
.food-bento-rating { display: flex; align-items: center; gap: 3px; font-size: .82rem; color: var(--gold-light); font-weight: 600; }
.food-bento-rating svg { color: var(--gold); }
.food-bento-area { font-size: .8rem; display: flex; align-items: center; gap: 4px; margin-bottom: 6px; opacity: .85; }
.food-bento-info :deep(.tag) {
  background: rgba(255, 248, 231, .18);
  color: rgba(255, 248, 231, .9);
  border-color: rgba(255, 248, 231, .2);
}
@media (max-width: 768px) {
  .food-bento { grid-template-columns: 1fr; }
  .food-bento-hero { grid-column: span 1; grid-row: span 1; }
}
@media (max-width: 480px) {
  .food-bento-card { min-height: 180px; }
  .food-bento-hero { min-height: 280px; }
}

/* ═══ PRODUCT — Split section ═══ */
.product-section { margin: var(--sp-12) 0; }
.product-split { display: flex; max-width: var(--max-width); margin: 0 auto; }
.product-split-img { flex: 1; }
.product-split-img img { width: 100%; height: 420px; object-fit: cover; }
.product-split-body {
  flex: 1; padding: var(--sp-10); display: flex; flex-direction: column; justify-content: center;
  background: #fff;
}
.product-split-name {
  font-family: var(--font-serif); font-size: 1.8rem; font-weight: 700;
  color: var(--dark); margin: var(--sp-3) 0;
}
.product-split-price { margin: var(--sp-4) 0 var(--sp-3); display: flex; align-items: baseline; gap: var(--sp-3); }
.price-now { font-size: 2rem; font-weight: 700; color: var(--orange); font-family: var(--font-serif); }
.price-was { font-size: 1rem; color: var(--grey-light); text-decoration: line-through; }
.product-split-meta { font-size: .88rem; color: var(--grey); margin-bottom: var(--sp-5); display: flex; align-items: center; gap: 4px; }
.product-split-meta svg { color: var(--brown-light); }
@media (max-width: 768px) {
  .product-split { flex-direction: column; }
  .product-split-img img { height: 280px; }
  .product-split-body { padding: var(--sp-6); }
}

/* ═══ EVENTS — Timeline ═══ */
.event-timeline { position: relative; padding-left: var(--sp-10); }
.event-timeline::before {
  content: ''; position: absolute; left: 36px; top: 8px; bottom: 8px;
  width: 1px; background: rgba(139,69,19,.1);
}
.event-timeline-item { display: flex; align-items: flex-start; gap: var(--sp-5); margin-bottom: var(--sp-6); position: relative; }
.event-date-block {
  width: 72px; height: 72px; flex-shrink: 0; border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--brown), var(--brown-dark));
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(139,69,19,.2); z-index: 1;
}
.ev-month { font-size: .72rem; color: var(--gold); font-weight: 500; }
.ev-day { font-size: 1.3rem; font-weight: 700; color: var(--cream); font-family: var(--font-serif); }
.event-body { flex: 1; padding-top: var(--sp-2); }
.ev-title { font-family: var(--font-serif); font-size: 1rem; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.ev-loc { font-size: .82rem; color: var(--grey); display: flex; align-items: center; gap: 4px; }
@media (max-width: 480px) {
  .event-timeline { padding-left: 0; }
  .event-timeline::before { display: none; }
}

/* ═══ REDUCED MOTION ═══ */
@media (prefers-reduced-motion: reduce) {
  .hero-img { transform: none !important; }
  .hero-content { transform: none !important; opacity: 1 !important; }
  .hero-scroll { animation: none; opacity: 1 !important; }
  [data-reveal], .reveal-child { opacity: 1 !important; transform: none !important; transition: none !important; }
}
</style>
