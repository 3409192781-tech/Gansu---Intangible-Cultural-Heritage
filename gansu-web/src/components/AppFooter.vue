<template>
  <footer class="app-footer">
    <p class="footer-text">陇韵匠心 · 带你领略丝路文化</p>
    <p class="footer-copy">© 2026 陇韵匠心</p>
    <div class="filing-footer">
      <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">ICP备案号</a>
      <a href="https://beian.mps.gov.cn/#/query/webSearch?code=XXXXXXXXXXXXXX" rel="noreferrer" target="_blank" class="police-link">
        <img src="/police-icon.png" class="police-icon" />公安备案号
      </a>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: linear-gradient(180deg, var(--brown-dark), #1A0F0A);
  color: rgba(255,248,231,.4); text-align: center; padding: 40px 20px 32px; font-size: .82rem;
}
.footer-text { color: var(--gold); font-family: var(--font-serif); font-size: 1rem; margin-bottom: 6px; }
.footer-copy { margin-bottom: 12px; }
.filing-footer { display: flex; flex-direction: column; align-items: center; gap: 6px; margin-top: 8px; }
.filing-footer a { color: rgba(255,248,231,.4); text-decoration: none; font-size: .75rem; transition: color .15s; }
.filing-footer a:hover { color: var(--cream); text-decoration: underline; }
.police-link { display: inline-flex; align-items: center; gap: 4px; }
.police-icon { width: 16px; height: 16px; }
</style>
