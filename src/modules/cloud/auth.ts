import { readonly, ref } from 'vue'
import { cloudEnabled, getCloudApp } from './client'

export interface CloudUser {
  uid: string
  username: string
}

const user = ref<CloudUser | null>(null)
let initialized = false

/** 登录态（spec/06 §3）；SDK 类型声明较散，认证句柄按窄接口使用 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthHandle = any

async function auth(): Promise<AuthHandle> {
  const app = await getCloudApp()
  if (!app) throw new Error('云端未配置（VITE_TCB_ENV 为空）')
  return app.auth()
}

async function readLoginState(): Promise<CloudUser | null> {
  const state = await (await auth()).getLoginState()
  const u = state?.user
  return u?.uid ? { uid: u.uid, username: u.username ?? u.uid } : null
}

export function useAuth() {
  /** 应用启动时恢复登录态（SDK 凭据存 localStorage，长期免登） */
  async function ensureInit() {
    if (!cloudEnabled || initialized) return
    initialized = true
    try {
      user.value = await readLoginState()
    } catch {
      // 云端不可达 → 保持本地模式
    }
  }

  async function login(username: string, password: string) {
    await (await auth()).signInWithUsernameAndPassword(username, password)
    const u = await readLoginState()
    if (!u) throw new Error('登录失败：未获取到登录态')
    user.value = { ...u, username: u.username === u.uid ? username : u.username }
  }

  async function register(username: string, password: string) {
    await (await auth()).signUp({ username, password })
    await login(username, password) // 注册后直接登录
  }

  async function logout() {
    try {
      await (await auth()).signOut()
    } finally {
      user.value = null
    }
  }

  return { user: readonly(user), cloudEnabled, ensureInit, login, register, logout }
}
