<template>
  <div class="product-card" @click="$emit('click')">
    <div class="prod-img-wrap">
      <img :src="product.image" class="prod-img" />
      <div class="img-overlay"></div>
      <div class="price-badge">
        <span class="price-sym">¥</span>
        <span class="price-val">{{ product.price }}</span>
      </div>
    </div>
    <div class="prod-body">
      <div class="prod-top">
        <span class="prod-name">{{ product.name }}</span>
        <span class="badge badge-brown" v-if="product.isHot">热销</span>
      </div>
      <div class="tags"><span class="tag" v-for="(t, i) in (product.tags || []).slice(0, 3)" :key="i">{{ t }}</span></div>
      <div class="prod-meta">
        <span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {{ product.location }}
        </span>
        <span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          {{ product.rating }}
        </span>
      </div>
      <div class="prod-bottom">
        <span class="orig" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
        <span class="sold">已售 {{ product.sold || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ product: Object })
defineEmits(['click'])
</script>

<style scoped>
.product-card { background: #fff; border-radius: var(--radius); overflow: hidden; border: 1px solid rgba(212,168,106,.12); cursor: pointer; transition: all var(--normal) var(--ease); }
.product-card:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
.product-card:active { transform: scale(0.985); }
.prod-img-wrap { position: relative; height: 260px; }
.prod-img { width: 100%; height: 100%; object-fit: cover; }
.img-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 50%, rgba(44,24,16,.35)); }
.price-badge { position: absolute; bottom: 14px; right: 14px; background: var(--orange); color: #fff; padding: 6px 16px; border-radius: 14px; display: flex; align-items: baseline; gap: 2px; }
.price-sym { font-size: .75rem; }
.price-val { font-size: 1.3rem; font-weight: 700; font-family: var(--font-serif); }
.prod-body { padding: 16px; }
.prod-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.prod-name { font-family: var(--font-serif); font-size: 1.05rem; font-weight: 700; color: var(--dark); flex: 1; }
.prod-meta { display: flex; gap: 16px; font-size: .8rem; color: var(--grey); margin: 6px 0 8px; }
.prod-meta span { display: flex; align-items: center; gap: 3px; }
.prod-meta svg { color: var(--brown-light); flex-shrink: 0; }
.prod-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid rgba(212,168,106,.15); }
.orig { font-size: .8rem; color: var(--grey-light); text-decoration: line-through; }
.sold { font-size: .78rem; color: var(--brown); background: rgba(212,168,106,.1); padding: 2px 10px; border-radius: 6px; }
</style>
