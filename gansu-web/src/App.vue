<template>
  <div id="app-root">
    <AppHeader />
    <main class="main-content">
      <Suspense>
        <router-view :key="route.fullPath" />
      </Suspense>
    </main>
    <AppFooter />
    <AiChatBubble />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import AiChatBubble from './components/AiChatBubble.vue'

const route = useRoute()
</script>

<style scoped>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  padding-top: 56px;
}
</style>
