/**
 * Iconify 公共 API 封装 — 对应 spec/05。
 * 免密钥、CORS 开放，纯静态托管可用；iconfont 无公开搜索 API（实测见 spec/05 §2），
 * 后续若其开放正式 API，在本文件同位置替换数据源即可，页面无需改动。
 */

const API = 'https://api.iconify.design'

/** 常见地物 → 英文检索词（Iconify 搜索对英文效果最好）；可按课程需要扩充 */
export const ZH_KEYWORDS: Record<string, string> = {
  加油站: 'gas station',
  医院: 'hospital',
  学校: 'school',
  银行: 'bank',
  车站: 'bus station',
  火车站: 'train station',
  机场: 'airport',
  公园: 'park',
  商场: 'shopping mall',
  超市: 'supermarket',
  酒店: 'hotel',
  餐厅: 'restaurant',
  咖啡: 'cafe',
  邮局: 'post office',
  书店: 'bookstore',
  图书馆: 'library',
  博物馆: 'museum',
  体育馆: 'stadium',
  药店: 'pharmacy',
  警局: 'police',
  消防: 'fire station',
  停车场: 'parking',
  厕所: 'restroom toilet',
  景区: 'tourism scenic',
  桥: 'bridge',
  隧道: 'tunnel',
  水库: 'reservoir water',
  工厂: 'factory',
  教堂: 'church',
  寺庙: 'temple',
  气象台: 'weather station',
  地铁: 'subway metro',
  灯塔: 'lighthouse',
  港口: 'harbor port',
  长城: 'great wall landmark',
}

/** 描述 → 检索词：命中词库返回英文；否则原样返回（调用方负责提示） */
export function toQuery(description: string): { query: string; translated: boolean } {
  const desc = description.trim()
  for (const [zh, en] of Object.entries(ZH_KEYWORDS)) {
    if (desc.includes(zh)) return { query: en, translated: true }
  }
  return { query: desc, translated: false }
}

export interface IconCandidate {
  /** 形如 "tabler:gas-station" 的全名 */
  name: string
}

export async function searchIcons(query: string, limit = 48): Promise<string[]> {
  const resp = await fetch(`${API}/search?query=${encodeURIComponent(query)}&limit=${limit}`)
  if (!resp.ok) throw new Error(`Iconify 搜索失败：HTTP ${resp.status}`)
  const data = (await resp.json()) as { icons?: string[] }
  return data.icons ?? []
}

/** 图标 SVG 直链（网格展示用 <img> 直引） */
export function iconSvgUrl(name: string): string {
  return `${API}/${name.replace(':', '/')}.svg`
}

/** 入库前拉取 SVG 文本（供规范化校验） */
export async function fetchIconSvg(name: string): Promise<string> {
  const resp = await fetch(iconSvgUrl(name))
  if (!resp.ok) throw new Error(`下载图标失败：HTTP ${resp.status}`)
  return resp.text()
}

/** iconfont 搜索页直达链接（新标签打开） */
export function iconfontSearchUrl(keyword: string): string {
  return `https://www.iconfont.cn/search/index?q=${encodeURIComponent(keyword)}`
}
