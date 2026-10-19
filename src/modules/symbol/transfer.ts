import type { SymbolCategory, SymbolRecord, SymbolSource } from './types'
import { checkAndNormalizeSvg } from './standardize'

/** 导入结果（spec/03 §7 用例6） */
export interface ImportResult {
  ok: boolean
  error?: string
  added: number
  skipped: number
  /** 合并后的完整列表（ok 时才应写回库） */
  records: SymbolRecord[]
}

const CATEGORIES: SymbolCategory[] = ['point', 'line', 'area']
const SOURCES: SymbolSource[] = ['iconfont-ai', 'iconify', 'illustrator', 'other']

function isValidRecord(item: unknown): item is SymbolRecord {
  if (!item || typeof item !== 'object') return false
  const r = item as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    typeof r.svg === 'string' &&
    CATEGORIES.includes(r.category as SymbolCategory) &&
    SOURCES.includes(r.source as SymbolSource)
  )
}

/**
 * 解析他人导出的符号库 JSON 并与现有库合并：
 * 非法 JSON / 非数组 → 失败；字段不完整或 SVG 未通过规范化校验（spec/01 FR-2.5，防 v-html XSS）的记录跳过；
 * id 重复的跳过。
 */
export function mergeLibraryJson(text: string, existing: SymbolRecord[]): ImportResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: '文件不是合法 JSON', added: 0, skipped: 0, records: existing }
  }
  if (!Array.isArray(data)) {
    return { ok: false, error: 'JSON 内容不是符号数组（请使用本应用导出的符号库文件）', added: 0, skipped: 0, records: existing }
  }

  let invalid = 0
  const valid: SymbolRecord[] = []
  for (const item of data) {
    if (!isValidRecord(item)) {
      invalid++
      continue
    }
    const chk = checkAndNormalizeSvg(item.svg)
    if (!chk.ok || !chk.normalized) {
      invalid++
      continue
    }
    valid.push({
      id: item.id,
      name: item.name,
      category: item.category,
      tags: Array.isArray(item.tags) ? item.tags.filter((t): t is string => typeof t === 'string') : [],
      svg: chk.normalized,
      source: item.source,
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
    })
  }

  const existingIds = new Set(existing.map((s) => s.id))
  const fresh = valid.filter((v) => !existingIds.has(v.id))
  return {
    ok: true,
    added: fresh.length,
    skipped: valid.length - fresh.length + invalid,
    records: [...existing, ...fresh],
  }
}
