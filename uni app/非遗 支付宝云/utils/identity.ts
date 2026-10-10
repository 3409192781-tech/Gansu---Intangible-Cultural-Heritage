// ═══════════════════════════════════════════════════════════════
// 用户身份工具 — deviceId + token 统一管理
// ═══════════════════════════════════════════════════════════════

// 获取或生成设备 ID（未登录用户凭此标识）
export const getDeviceId = (): string => {
  let id = uni.getStorageSync('deviceId') as string
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10)
    uni.setStorageSync('deviceId', id)
  }
  return id
}

// ── Token ──
export const getToken = (): string => (uni.getStorageSync('token') as string) || ''
export const setToken = (t: string) => uni.setStorageSync('token', t)

// ── 登录状态 ──
export const isLoggedIn = (): boolean => !!uni.getStorageSync('token')

// ── 用户信息 ──
export const getUserInfo = (): any => uni.getStorageSync('userInfo') || null
export const setUserInfo = (u: any) => uni.setStorageSync('userInfo', u)

// ── 按需登录 ──
// 需要登录的功能前调用，未登录自动跳登录页
export const requireLogin = (): boolean => {
  if (isLoggedIn()) return true
  uni.navigateTo({ url: '/pages/login/login' })
  return false
}
