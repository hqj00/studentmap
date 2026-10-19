import { computed, readonly, ref } from 'vue'
import { cloudProvider, detectProvider, getCloudApp } from './client'

export interface CloudUser {
  uid: string
  username: string
}

const user = ref<CloudUser | null>(null)
const token = ref<string | null>(null)
const TOKEN_KEY = 'studentmap.classToken'
let initialized = false

/** 班级服务器 API（spec/06 §2.2） */
async function classRequest(path: string, body?: unknown) {
  const resp = await fetch(`/api${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error((data as { error?: string }).error ?? `请求失败（HTTP ${resp.status}）`)
  return data as Record<string, unknown>
}

/** CloudBase 登录态恢复；SDK 类型声明较散，认证句柄按窄接口使用 */
async function cloudbaseLoginState(): Promise<CloudUser | null> {
  const app = await getCloudApp()
  if (!app) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state = await (app.auth() as any).getLoginState()
  const u = state?.user
  return u?.uid ? { uid: u.uid, username: u.username ?? u.uid } : null
}

export function useAuth() {
  /** 应用启动时探测后端并恢复登录态（spec/06 §1/§3） */
  async function ensureInit() {
    if (initialized) return
    initialized = true
    const provider = await detectProvider()
    if (provider === 'class-server') {
      token.value = localStorage.getItem(TOKEN_KEY)
      if (!token.value) return
      try {
        const d = await classRequest('/auth/me')
        user.value = { uid: String(d.username), username: String(d.username) }
      } catch {
        token.value = null
        localStorage.removeItem(TOKEN_KEY)
      }
    } else if (provider === 'cloudbase') {
      try {
        user.value = await cloudbaseLoginState()
      } catch {
        // 云端不可达 → 保持本地模式
      }
    }
  }

  async function login(username: string, password: string) {
    if (cloudProvider.value === 'class-server') {
      const d = await classRequest('/auth/login', { username, password })
      token.value = String(d.token)
      localStorage.setItem(TOKEN_KEY, token.value)
      user.value = { uid: String(d.username), username: String(d.username) }
      return
    }
    const app = await getCloudApp()
    if (!app) throw new Error('云端未配置（本地模式）')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (app.auth() as any).signInWithUsernameAndPassword(username, password)
    const u = await cloudbaseLoginState()
    if (!u) throw new Error('登录失败：未获取到登录态')
    user.value = { ...u, username: u.username === u.uid ? username : u.username }
  }

  async function register(username: string, password: string) {
    if (cloudProvider.value === 'class-server') {
      await classRequest('/auth/register', { username, password })
    } else {
      const app = await getCloudApp()
      if (!app) throw new Error('云端未配置（本地模式）')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (app.auth() as any).signUp({ username, password })
    }
    await login(username, password) // 注册后直接登录
  }

  async function logout() {
    if (cloudProvider.value === 'cloudbase') {
      try {
        const app = await getCloudApp()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ((app?.auth() as any)?.signOut?.() ?? Promise.resolve())
      } catch {
        // 忽略云端登出失败
      }
    }
    token.value = null
    localStorage.removeItem(TOKEN_KEY)
    user.value = null
  }

  /** 页头/登录页据此显示账号区（探测完成前为 local，不闪烁展示登录入口） */
  const cloudEnabled = computed(() => cloudProvider.value !== 'local')
  return { user: readonly(user), cloudEnabled, ensureInit, login, register, logout }
}

/** 班级服务器会话凭据（sync 用） */
export function getClassToken(): string | null {
  return token.value
}
