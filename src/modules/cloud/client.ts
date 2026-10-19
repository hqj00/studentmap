import { ref } from 'vue'

/** 云端接入（spec/06 §1）：启动时探测——班级服务器(/api/ping) → CloudBase(VITE_TCB_ENV) → 本地模式 */
// import.meta.env 仅在 Vite 环境存在，Node 测试环境防御性取值
const env = import.meta.env?.VITE_TCB_ENV?.trim?.() as string | undefined

export type CloudProvider = 'class-server' | 'cloudbase' | 'local'
export const cloudProvider = ref<CloudProvider>('local')

export async function detectProvider(): Promise<CloudProvider> {
  try {
    const resp = await fetch('/api/ping', { signal: AbortSignal.timeout(2000) })
    const data = resp.ok ? await resp.json() : null
    if (data?.ok) {
      cloudProvider.value = 'class-server'
      return cloudProvider.value
    }
  } catch {
    // 无班级服务器，继续向下探测
  }
  cloudProvider.value = env ? 'cloudbase' : 'local'
  return cloudProvider.value
}

/** CloudBase SDK 体积大，动态 import 拆 chunk，只在真正用 CloudBase 时才加载 */
export interface CloudBaseApp {
  auth(): unknown
  database(): unknown
}

let appPromise: Promise<CloudBaseApp> | null = null

export async function getCloudApp(): Promise<CloudBaseApp | null> {
  if (cloudProvider.value !== 'cloudbase') return null
  if (!appPromise) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appPromise = import('@cloudbase/js-sdk').then((m) => (m as any).default.init({ env: env! }) as CloudBaseApp)
  }
  return appPromise
}
