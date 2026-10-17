/** 符号模块类型定义 — 对应 spec/03 §4 */

export type SymbolCategory = 'point' | 'line' | 'area'
export type SymbolSource = 'iconfont-ai' | 'illustrator' | 'other'

export interface SymbolRecord {
  id: string
  name: string
  category: SymbolCategory
  tags: string[]
  /** 规范化后的 SVG 文本（已通过 standardize 校验） */
  svg: string
  source: SymbolSource
  createdAt: number
}

export const CATEGORY_LABELS: Record<SymbolCategory, string> = {
  point: '点状符号',
  line: '线状符号',
  area: '面状符号',
}

export const SOURCE_LABELS: Record<SymbolSource, string> = {
  'iconfont-ai': 'iconfont AI 素材',
  illustrator: 'Illustrator 原创',
  other: '其他',
}
