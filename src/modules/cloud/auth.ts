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

/** CloudBase 认证句柄（SDK 类型声明较散，按窄接口使用） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthHandle = any

async function cbAuth(): Promise<AuthHandle> {
  const app = await getCloudApp()
  if (!app) throw new Error('云端未配置（本地模式）')
  return app.auth()
}

/** v3 SDK 的错误形态不统一：有的抛错、有的返回 {error}，统一转成 throw（带服务端原始说明） */
function unwrap(res: unknown, fallback: string): unknown {
  const r = res as { error?: { error_description?: string; message?: string } } | null
  if (r?.error) throw new Error(r.error.error_description ?? r.error.message ?? fallback)
  return res
}
async function callAuth<T>(p: Promise<T>, fallback: string): Promise<T> {
  try {
    return unwrap(await p, fallback) as T
  } catch (e) {
    const err = e as { error_description?: string; message?: string }
    throw new Error(err.error_description ?? err.message ?? fallback)
  }
}

/** CloudBase 登录态读取 */
async function cloudbaseLoginState(): Promise<CloudUser | null> {
  const app = await getCloudApp()
  if (!app) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state = await (app.auth() as any).getLoginState()
  const u = state?.user
  return u?.uid ? { uid: u.uid, username: u.username ?? u.email ?? u.uid } : null
}

/** 邮箱验证码的 verification_id 在一次注册流程内暂存 */
let pendingVerificationId = ''

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

  /** 发送邮箱验证码（仅 CloudBase；注册流程第一步，spec/06 §3） */
  async function sendEmailCode(email: string) {
    const auth = await cbAuth()
    const res = (await callAuth(auth.getVerification({ email }), '发送验证码失败')) as {
      verification_id?: string
      data?: { verification_id?: string }
    }
    pendingVerificationId = res.verification_id ?? res.data?.verification_id ?? ''
    if (!pendingVerificationId) throw new Error('未获取到 verification_id')
  }

  /** 登录：班级服务器=用户名+密码；CloudBase=邮箱/用户名+密码（auth.signIn） */
  async function login(account: string, password: string) {
    if (cloudProvider.value === 'class-server') {
      const d = await classRequest('/auth/login', { username: account, password })
      token.value = String(d.token)
      localStorage.setItem(TOKEN_KEY, token.value)
      user.value = { uid: String(d.username), username: String(d.username) }
      return
    }
    const auth = await cbAuth()
    await callAuth(auth.signIn({ username: account, password }), '登录失败')
    const u = await cloudbaseLoginState()
    if (!u) throw new Error('登录失败：未获取到登录态')
    user.value = u
  }

  /** 注册：班级服务器=用户名+密码直注册；CloudBase=邮箱验证码三步（getVerification→verify→signUp，自动登录） */
  async function register(account: string, password: string, emailCode?: string) {
    if (cloudProvider.value === 'class-server') {
      await classRequest('/auth/register', { username: account, password })
      await login(account, password)
      return
    }
    // CloudBase：account 为邮箱（官方不允许用户名+密码直接注册，spec/06 §3）
    if (!emailCode) throw new Error('请输入邮箱验证码')
    const auth = await cbAuth()
    const v = (await callAuth(
      auth.verify({ verification_id: pendingVerificationId, verification_code: emailCode }),
      '验证码校验失败',
    )) as { verification_token?: string; data?: { verification_token?: string } }
    const vToken = v.verification_token ?? v.data?.verification_token
    if (!vToken) throw new Error('验证码校验失败：未获取到 verification_token')
    await callAuth(
      auth.signUp({
        email: account,
        verification_code: emailCode,
        verification_token: vToken,
        password,
        name: account.split('@')[0],
      }),
      '注册失败',
    )
    // signUp 成功自动登录
    const u = await cloudbaseLoginState()
    if (!u) throw new Error('注册成功但登录态获取失败，请直接登录')
    user.value = u
  }

  async function logout() {
    if (cloudProvider.value === 'cloudbase') {
      try {
        const auth = await cbAuth()
        await auth.signOut()
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
  return { user: readonly(user), cloudEnabled, ensureInit, login, register, logout, sendEmailCode }
}

/** 班级服务器会话凭据（sync 用） */
export function getClassToken(): string | null {
  return token.value
}
