/** CloudBase 客户端 — 未配置 VITE_TCB_ENV 时云端功能整体禁用（本地模式，spec/06 §3）。
 * SDK 体积大，用动态 import 拆成独立 chunk，只在真正启用云端时才加载。 */
// import.meta.env 仅在 Vite 环境存在，Node 测试环境防御性取值
const env = import.meta.env?.VITE_TCB_ENV?.trim?.() as string | undefined
export const cloudEnabled = !!env

/** 只用到的最小接口；SDK 自身类型声明较散，调用处再收窄 */
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
