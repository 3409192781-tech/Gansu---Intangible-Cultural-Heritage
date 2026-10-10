<template>
  <div class="ai-chat-root">
    <!-- Floating button + hint bubble -->
    <div v-if="!open" class="fab-wrapper">
      <transition name="bubble">
        <div v-if="showBubble" class="chat-bubble-hint" @click="openChat">
          <span class="bubble-text">我是你的专属AI导游，快来试试吧！</span>
          <button class="bubble-close" @click.stop="dismissBubble" aria-label="关闭提示">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </transition>
      <button
        class="chat-fab"
        @click="openChat"
        aria-label="AI 助手驼小游"
      >
        <span class="fab-icon">&#x1F42A;</span>
      </button>
    </div>

    <!-- Chat panel -->
    <Teleport to="body">
      <transition name="panel">
        <div v-if="open" class="chat-panel">
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-header-left">
              <span class="chat-avatar">&#x1F42A;</span>
              <div>
                <div class="chat-name">驼小游</div>
                <div class="chat-desc">AI 文旅助手</div>
              </div>
            </div>
            <button class="chat-close" @click="open = false" aria-label="关闭">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Messages -->
          <div class="chat-messages" ref="msgRef">
            <div v-for="(m, i) in messages" :key="i" :class="'msg-row ' + (m.role === 'user' ? 'msg-user' : 'msg-ai')">
              <div class="msg-bubble" v-html="renderMsg(m.content)"></div>
            </div>
            <div v-if="waiting" class="msg-row msg-ai">
              <div class="msg-bubble msg-typing">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
              </div>
            </div>
          </div>

          <!-- Quick prompts -->
          <div class="chat-quick" v-if="messages.length === 0">
            <button
              v-for="q in quickQuestions"
              :key="q"
              class="quick-btn"
              @click="sendQuick(q)"
            >{{ q }}</button>
          </div>

          <!-- Input -->
          <div class="chat-input-row">
            <input
              v-model="input"
              class="chat-input"
              placeholder="问驼小游任何甘肃文旅问题..."
              @keydown.enter="send"
              :disabled="waiting"
            />
            <button
              class="chat-send"
              :disabled="!input.trim() || waiting"
              @click="send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { api } from '../utils/api'

const open = ref(false)
const showBubble = ref(true)
const input = ref('')
const waiting = ref(false)
const messages = ref([])
const msgRef = ref(null)

const quickQuestions = [
  '莫高窟有什么必看洞窟？',
  '兰州牛肉面哪家最正宗？',
  '推荐一条甘肃三日游路线',
  '甘肃有哪些非遗项目值得体验？',
  '鸣沙山月牙泉最佳游玩时间？'
]

function openChat() {
  open.value = true
  showBubble.value = false
  nextTick(() => scrollBottom())
}

function dismissBubble() {
  showBubble.value = false
}

function renderMsg(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
}

async function send() {
  const text = input.value.trim()
  if (!text || waiting.value) return
  input.value = ''
  messages.value.push({ role: 'user', content: text })
  await nextTick(); scrollBottom()

  waiting.value = true
  try {
    const data = await api.ai.chat(messages.value.map(m => ({ role: m.role, content: m.content })))
    messages.value.push({ role: 'assistant', content: data.content })
  } catch {
    messages.value.push({ role: 'assistant', content: '抱歉，驼小游暂时走开了，请稍后再试~' })
  } finally {
    waiting.value = false
    await nextTick(); scrollBottom()
  }
}

function sendQuick(q) {
  input.value = q
  send()
}

function scrollBottom() {
  if (msgRef.value) {
    msgRef.value.scrollTop = msgRef.value.scrollHeight
  }
}
</script>

<style scoped>
/* ===== FAB + Bubble Wrapper ===== */
.fab-wrapper {
  position: fixed;
  bottom: 28px;
  right: 24px;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ===== Hint Bubble ===== */
.chat-bubble-hint {
  position: relative;
  background: #fff;
  color: var(--dark, #2C1810);
  padding: 10px 30px 10px 14px;
  border-radius: 16px 16px 4px 16px;
  font-size: 0.85rem;
  font-weight: 500;
  font-family: var(--font-sans, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif);
  box-shadow: 0 4px 20px rgba(44,24,16,0.15);
  cursor: pointer;
  white-space: nowrap;
  transition: box-shadow 0.2s;
}
.chat-bubble-hint:hover { box-shadow: 0 6px 28px rgba(44,24,16,0.22); }
.bubble-text { pointer-events: none; }
.bubble-close {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.06);
  color: var(--grey-light, #A09888);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s;
}
.bubble-close:hover { background: rgba(0,0,0,0.12); color: var(--dark, #2C1810); }

/* Bubble transition */
.bubble-enter-active { transition: all 0.35s cubic-bezier(0.16,1,0.3,1); }
.bubble-leave-active { transition: all 0.2s ease-in; }
.bubble-enter-from { opacity: 0; transform: translateX(12px) scale(0.9); }
.bubble-leave-to { opacity: 0; transform: translateX(8px) scale(0.95); }

/* ===== FAB ===== */
.chat-fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #D4A86A, #8B4513);
  box-shadow: 0 4px 16px rgba(139, 69, 19, 0.35);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s var(--ease-out, cubic-bezier(0.16,1,0.3,1)), box-shadow 0.25s;
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
}
.chat-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(139, 69, 19, 0.45);
}
.fab-icon { pointer-events: none; }

/* ===== Panel ===== */
.chat-panel {
  position: fixed;
  bottom: 96px;
  right: 24px;
  z-index: 91;
  width: 380px;
  max-width: calc(100vw - 32px);
  height: 520px;
  max-height: calc(100vh - 140px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(44, 24, 16, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--font-sans, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif);
}

/* Transition */
.panel-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.panel-leave-active { transition: all 0.2s ease-in; }
.panel-enter-from, .panel-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #5C2D0E, #8B4513);
  color: #fff;
  flex-shrink: 0;
}
.chat-header-left { display: flex; align-items: center; gap: 10px; }
.chat-avatar { font-size: 28px; line-height: 1; }
.chat-name { font-weight: 700; font-size: 0.95rem; }
.chat-desc { font-size: 0.72rem; opacity: 0.75; }
.chat-close {
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  width: 30px; height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.chat-close:hover { background: rgba(255,255,255,0.25); }

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #F5E6D3;
}
.msg-row { display: flex; }
.msg-user { justify-content: flex-end; }
.msg-ai { justify-content: flex-start; }

.msg-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.85rem;
  line-height: 1.6;
  word-break: break-word;
}
.msg-user .msg-bubble {
  background: #8B4513;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.msg-ai .msg-bubble {
  background: #fff;
  color: #2C1810;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* Typing dots */
.msg-typing { display: flex; gap: 5px; align-items: center; padding: 14px 18px; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #A09888; animation: bounce 1.4s ease-in-out infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }

/* Quick prompts */
.chat-quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 14px 14px; background: #F5E6D3; }
.quick-btn {
  font-size: 0.72rem;
  padding: 6px 12px;
  border-radius: 14px;
  border: 1px solid rgba(139,69,19,0.18);
  background: #fff;
  color: var(--brown, #8B4513);
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-sans);
}
.quick-btn:hover { background: var(--brown, #8B4513); color: #fff; border-color: var(--brown, #8B4513); }

/* Input */
.chat-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid rgba(139,69,19,0.08);
  background: #fff;
  flex-shrink: 0;
}
.chat-input {
  flex: 1;
  border: 1px solid rgba(139,69,19,0.15);
  border-radius: 20px;
  padding: 9px 15px;
  font-size: 0.85rem;
  outline: none;
  font-family: var(--font-sans);
  background: #FFF8E7;
  color: var(--dark, #2C1810);
  transition: border-color 0.2s;
}
.chat-input:focus { border-color: var(--gold, #D4A86A); }
.chat-input::placeholder { color: #A09888; }
.chat-send {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #D4A86A, #8B4513);
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.2s;
}
.chat-send:disabled { opacity: 0.4; cursor: default; }

@media (max-width: 480px) {
  .chat-panel { width: calc(100vw - 24px); right: 12px; bottom: 88px; height: 460px; }
  .fab-wrapper { bottom: 20px; right: 16px; gap: 8px; }
  .chat-fab { width: 48px; height: 48px; font-size: 24px; }
  .chat-bubble-hint { font-size: 0.78rem; padding: 8px 26px 8px 12px; }
}
</style>
