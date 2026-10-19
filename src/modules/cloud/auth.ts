import { readonly, ref } from 'vue'
import { cloudEnabled, getCloudApp } from './client'

export interface CloudUser {
  uid: string
  username: string
}

const user = ref<CloudUser | null>(null)
let initialized = false

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
  const state = await (app.auth() as AuthHandle).getLoginState()
  const u = state?.user
  return u?.uid ? { uid: u.uid, username: u.username ?? u.email ?? u.uid } : null
}

/** 邮箱验证码的 verification_id 在一次注册流程内暂存 */
let pendingVerificationId = ''

export function useAuth() {
  /** 应用启动时恢复登录态（SDK 凭据存 localStorage，长期免登） */
  async function ensureInit() {
    if (!cloudEnabled || initialized) return
    initialized = true
    try {
      user.value = await cloudbaseLoginState()
    } catch {
      // 云端不可达 → 保持本地模式
    }
  }

  /** 发送邮箱验证码（注册第一步，spec/06 §3） */
  async function sendEmailCode(email: string) {
    const auth = await cbAuth()
    const res = (await callAuth(auth.getVerification({ email }), '发送验证码失败')) as {
      verification_id?: string
      data?: { verification_id?: string }
    }
    pendingVerificationId = res.verification_id ?? res.data?.verification_id ?? ''
    if (!pendingVerificationId) throw new Error('未获取到 verification_id')
  }

  /** 登录：邮箱/用户名 + 密码（auth.signIn，spec/06 §3） */
  async function login(account: string, password: string) {
    const auth = await cbAuth()
    await callAuth(auth.signIn({ username: account, password }), '登录失败')
    const u = await cloudbaseLoginState()
    if (!u) throw new Error('登录失败：未获取到登录态')
    user.value = u
  }

  /** 注册：邮箱验证码三步（getVerification→verify→signUp，自动登录）。
   * 新版 CloudBase 不允许用户名+密码直接注册（spec/06 §3 实测约束） */
  async function register(email: string, password: string, emailCode?: string) {
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
        email,
        verification_code: emailCode,
        verification_token: vToken,
        password,
        name: email.split('@')[0],
      }),
      '注册失败',
    )
    // signUp 成功自动登录
    const u = await cloudbaseLoginState()
    if (!u) throw new Error('注册成功但登录态获取失败，请直接登录')
    user.value = u
  }

  async function logout() {
    try {
      const auth = await cbAuth()
      await auth.signOut()
    } catch {
      // 忽略云端登出失败
    }
    user.value = null
  }

  return { user: readonly(user), cloudEnabled, ensureInit, login, register, logout, sendEmailCode }
}
