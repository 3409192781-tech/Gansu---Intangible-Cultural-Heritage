<template>
  <div class="about-page">
    <div class="about-hero">
      <h1>🏔️ 关于陇韵匠心</h1>
      <p>带你领略丝路文化</p>
    </div>
    <div class="container">
      <div class="about-card">
        <h2>关于我们</h2>
        <p>陇韵匠心是一款专注甘肃省文旅资源的一站式数字服务平台，汇集敦煌莫高窟、嘉峪关关城、麦积山石窟等热门景点，涵盖非遗文化展示、特色美食推荐、文创产品选购、旅游攻略指南等功能模块。</p>
        <p>用户可在地图导览中规划行程，通过智能搜索快速定位目标内容，收藏心仪景点与美食。平台以丝路文化为视觉脉络，为游客提供沉浸式的甘肃文旅体验，让千年丝路触手可及。</p>
      </div>
      <div class="about-card">
        <h2>联系我们</h2>
        <p>邮箱：user@example.com</p>
        <p>微信：wx_********</p>
        <p>客服电话：13800000000</p>
        <p>地址：甘肃省兰州市</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page { min-height: 100vh; background: var(--bg); padding-bottom: 40px; }
.about-hero {
  background: linear-gradient(135deg, var(--brown-dark), var(--brown));
  color: var(--cream); text-align: center; padding: 48px 20px;
}
.about-hero h1 { font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 8px; }
.about-hero p { opacity: .7; }
.container { max-width: 800px; margin: 0 auto; padding: 0 16px; }
.about-card {
  background: #fff; border-radius: var(--radius-lg); padding: 28px;
  margin-top: 20px; box-shadow: var(--shadow-sm);
}
.about-card h2 { font-family: var(--font-serif); color: var(--brown); font-size: 1.2rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.about-card h2::before { content: ''; width: 4px; height: 20px; border-radius: 2px; background: var(--gold); }
.about-card p { color: var(--grey); line-height: 1.8; margin-bottom: 10px; }
</style>
