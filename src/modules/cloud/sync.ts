import type { SymbolRecord } from '../symbol/types'
import { cloudProvider, getCloudApp } from './client'
import { getClassToken } from './auth'

const COLLECTION = 'symbol_libraries'

/** 拉取云端符号库；未配置/无数据/失败返回 null（调用方保持本地模式） */
export async function pullLibrary(uid: string): Promise<SymbolRecord[] | null> {
  if (cloudProvider.value === 'class-server') {
    try {
      const resp = await fetch('/api/library', {
        headers: { Authorization: `Bearer ${getClassToken()}` },
      })
      if (!resp.ok) return null
      const d = (await resp.json()) as { symbols?: SymbolRecord[] }
      return Array.isArray(d.symbols) ? d.symbols : []
    } catch {
      return null
    }
  }
  if (cloudProvider.value === 'cloudbase') {
    const app = await getCloudApp()
    if (!app) return null
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (app.database() as any).collection(COLLECTION).doc(uid).get()
      const doc = (res?.data as Array<{ symbols?: SymbolRecord[] }> | undefined)?.[0]
      return Array.isArray(doc?.symbols) ? doc.symbols : []
    } catch {
      return null
    }
  }
  return null
}

/** 推送整个符号库到当前后端（spec/06 §3 防抖调用方负责） */
export async function pushLibrary(uid: string, records: SymbolRecord[]): Promise<void> {
  if (cloudProvider.value === 'class-server') {
    await fetch('/api/library', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getClassToken()}`,
      },
      body: JSON.stringify({ symbols: records }),
    })
    return
  }
  if (cloudProvider.value === 'cloudbase') {
    const app = await getCloudApp()
    if (!app) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (app.database() as any)
      .collection(COLLECTION)
      .doc(uid)
      .set({ owner: uid, symbols: records, updatedAt: Date.now() })
  }
}

/** 合并本地与云端：按 id 取并集（云端优先，本地独有补充）——spec/06 §3 */
export function mergeLibraries(local: SymbolRecord[], remote: SymbolRecord[]): SymbolRecord[] {
  const remoteIds = new Set(remote.map((r) => r.id))
  return [...remote, ...local.filter((l) => !remoteIds.has(l.id))]
}
