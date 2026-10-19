import { ref, watch } from 'vue'
import type { SymbolRecord } from './types'
import { mergeLibraryJson, type ImportResult } from './transfer'
import { useAuth } from '../cloud/auth'
import { mergeLibraries, pullLibrary, pushLibrary } from '../cloud/sync'

const STORAGE_KEY = 'studentmap.symbols.v1'

function load(): SymbolRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SymbolRecord[]) : []
  } catch {
    return []
  }
}

/**
 * 符号库 store — 对应 spec/03 §3 步骤⑤ / §4。
 * 本地 localStorage 持久化；登录云账号后与云端按 uid 绑定同步（spec/06 §3）。
 */
export function useSymbolLibrary() {
  const { user } = useAuth()
  const symbols = ref<SymbolRecord[]>(load())

  // 登录成功：拉取云端库，与本地按 id 合并后回推（spec/06 §3）
  watch(user, async (u, prev) => {
    if (u && !prev) {
      const remote = await pullLibrary(u.uid)
      if (remote) {
        symbols.value = mergeLibraries(symbols.value, remote)
        pushLibrary(u.uid, symbols.value).catch(() => {})
      }
    }
  })

  let syncTimer: ReturnType<typeof setTimeout> | undefined
  watch(
    symbols,
    (list) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      } catch {
        // localStorage 写满等异常：界面层提示导出备份后清理（spec/03 §6）
        alert('符号库本地存储失败：可能空间不足，请导出 JSON 备份后清理')
      }
      // 已登录：变更防抖 800ms 自动同步云端（失败不打扰本地使用）
      if (user.value) {
        clearTimeout(syncTimer)
        const uid = user.value.uid
        syncTimer = setTimeout(() => pushLibrary(uid, list).catch(() => {}), 800)
      }
    },
    { deep: true },
  )

  function add(record: Omit<SymbolRecord, 'id' | 'createdAt'>): SymbolRecord {
    const full: SymbolRecord = {
      ...record,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    }
    symbols.value.push(full)
    return full
  }

  function remove(id: string) {
    symbols.value = symbols.value.filter((s) => s.id !== id)
  }

  function exportJson(): string {
    return JSON.stringify(symbols.value, null, 2)
  }

  /** 导入他人导出的 JSON 并合并入库（spec/03 §7 用例6） */
  function importJson(text: string): ImportResult {
    const result = mergeLibraryJson(text, symbols.value)
    if (result.ok) symbols.value = result.records
    return result
  }

  return { symbols, add, remove, exportJson, importJson }
}
