import { ref, watch } from 'vue'
import type { SymbolRecord } from './types'

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
 * 本期 localStorage 持久化；后端同步接口预留（见 spec/04 §8 演进路线）。
 */
export function useSymbolLibrary() {
  const symbols = ref<SymbolRecord[]>(load())

  watch(
    symbols,
    (list) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      } catch {
        // localStorage 写满等异常：界面层提示导出备份后清理（spec/03 §6）
        alert('符号库本地存储失败：可能空间不足，请导出 JSON 备份后清理')
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

  return { symbols, add, remove, exportJson }
}
