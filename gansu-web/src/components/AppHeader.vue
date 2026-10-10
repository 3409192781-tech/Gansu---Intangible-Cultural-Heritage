<template>
  <header class="app-header" :class="{ 'header-scrolled': scrolled, 'menu-open': open }">
    <div class="header-inner">
      <router-link to="/" class="header-logo">
        <span class="header-logo-dot"></span>陇韵匠心
      </router-link>
      <nav class="header-nav">
        <router-link to="/">首页</router-link>
        <router-link to="/spots">景点</router-link>
        <router-link to="/cultures">非遗</router-link>
        <router-link to="/foods">美食</router-link>
        <router-link to="/products">文创</router-link>
        <router-link to="/guides">攻略</router-link>
      </nav>
      <button class="menu-btn" :class="{ open }" @click="open = !open" aria-label="菜单">
        <svg width="22" height="18" viewBox="0 0 22 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <line class="line-top" x1="2" y1="2" x2="20" y2="2"/>
          <line class="line-mid" x1="2" y1="9" x2="20" y2="9"/>
          <line class="line-bot" x1="2" y1="16" x2="20" y2="16"/>
        </svg>
      </button>
    </div>
  </header>
  <nav class="mobile-nav" v-show="open" @click="open = false">
    <router-link to="/">
      <svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>首页
    </router-link>
    <router-link to="/spots">
      <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-3-3.87M7 21v-2a4 4 0 013-3.87"/><circle cx="12" cy="7" r="4"/></svg>景点
    </router-link>
    <router-link to="/cultures">
      <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>非遗
    </router-link>
    <router-link to="/foods">
      <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>美食
    </router-link>
    <router-link to="/products">
      <svg viewBox="0 0 24 24" fill="none"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>文创
    </router-link>
    <router-link to="/guides">
      <svg viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2A2.5 2.5 0 014 4.5v15A2.5 2.5 0 016.5 17H20"/></svg>攻略
    </router-link>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const open = ref(false)
const scrolled = ref(false)

function onScroll() { scrolled.value = window.scrollY > 40 }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.app-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(255, 248, 231, .82);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(139, 69, 19, .06);
  transition: all .3s var(--ease-in-out);
}
.app-header.menu-open {
  background: #2C1810;
  border-bottom-color: transparent;
}
.app-header.menu-open .header-logo { color: var(--cream); }
.app-header.menu-open .menu-btn { color: var(--cream); }
.header-scrolled {
  background: rgba(255, 248, 231, .92);
  box-shadow: 0 1px 8px rgba(44,24,16,.06);
}
.header-inner {
  max-width: var(--max-width); margin: 0 auto; padding: 0 20px;
  display: flex; align-items: center; justify-content: space-between;
  height: 56px; transition: height .3s var(--ease-in-out);
}
.header-scrolled .header-inner { height: 48px; }
.header-logo {
  font-family: var(--font-serif); font-size: 1.15rem; font-weight: 700;
  color: var(--brown); letter-spacing: 1.5px;
  display: flex; align-items: center; gap: 8px; text-decoration: none;
}
.header-logo-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--gold);
  box-shadow: 0 0 8px rgba(212,168,106,.5);
}
.header-nav { display: flex; gap: 2px; }
.header-nav a {
  color: var(--grey); padding: 6px 14px; border-radius: var(--radius);
  font-size: .85rem; font-weight: 500; transition: all var(--fast) var(--ease-in-out); text-decoration: none;
  border-bottom: 2px solid transparent;
}
.header-nav a:hover { color: var(--brown); }
.header-nav a.router-link-exact-active { color: var(--brown); border-bottom-color: var(--gold); font-weight: 600; }
.menu-btn {
  display: none; background: none; border: none; color: var(--brown);
  cursor: pointer; padding: 4px; line-height: 0;
}
.menu-btn :deep(line) {
  transition: all .3s var(--ease-in-out); transform-origin: center;
}
.menu-btn.open :deep(.line-top) { transform: translateY(6px) rotate(45deg); }
.menu-btn.open :deep(.line-mid) { opacity: 0; }
.menu-btn.open :deep(.line-bot) { transform: translateY(-6px) rotate(-45deg); }
.mobile-nav {
  display: none; background: #2C1810; flex-direction: column;
  position: fixed; inset: 0; z-index: 99;
  padding: 72px var(--sp-5) var(--sp-3);
}
.mobile-nav a {
  color: rgba(255,248,231,.7); padding: 12px 4px; text-decoration: none;
  font-size: .95rem; border-bottom: 1px solid rgba(255,248,231,.05);
  display: flex; align-items: center; gap: 10px;
}
.mobile-nav a svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.8; opacity: .6; }
@media (max-width: 768px) {
  .header-nav { display: none; }
  .menu-btn { display: block; }
  .mobile-nav { display: flex; }
}
</style>
