import { ref } from 'vue'

/** 云端接入（spec/06）：统一走 CloudBase；未配置 VITE_TCB_ENV 时为纯本地模式 */
// import.meta.env 仅在 Vite 环境存在，Node 测试环境防御性取值
const env = import.meta.env?.VITE_TCB_ENV?.trim?.() as string | undefined

export const cloudEnabled = !!env
export const cloudProvider = ref<'cloudbase' | 'local'>(cloudEnabled ? 'cloudbase' : 'local')

/** CloudBase SDK 体积大，动态 import 拆 chunk，只在启用云端时才加载 */
export interface CloudBaseApp {
  auth(): unknown
  database(): unknown
}

let appPromise: Promise<CloudBaseApp> | null = null

export async function getCloudApp(): Promise<CloudBaseApp | null> {
  if (!cloudEnabled) return null
  if (!appPromise) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appPromise = import('@cloudbase/js-sdk').then((m) => (m as any).default.init({ env: env! }) as CloudBaseApp)
  }
  return appPromise
}
