/**
 * 位置搜索（地名检索）—— 对应 spec/10 §2。
 * 数据源：Natural Earth 110m 国家（含中文名）+ 阿里云 DataV 中国省份/城市边界，
 * 离线生成 bbox 后内置（src/assets/places.json），不依赖运行时网络请求。
 */
import placesData from '@/assets/places.json'

export interface Place {
  /** 中文名 */
  n: string
  /** 英文名（仅国家） */
  e?: string
  /** 类型：c=世界国家，p=中国省份，y=中国城市（直辖市辖区亦在此列） */
  t: 'c' | 'p' | 'y'
  /** 所属省（仅城市） */
  p?: string
  /** 四至 [minLon, minLat, maxLon, maxLat] */
  b: [number, number, number, number]
}

export const PLACES = placesData as unknown as Place[]

export const provincePlaces = PLACES.filter((p) => p.t === 'p')
export const cityPlaces = PLACES.filter((p) => p.t === 'y')
export const countryPlaces = PLACES.filter((p) => p.t === 'c')

/** 下拉选项的稳定键（城市重名多，带所属省） */
export function placeKey(p: Place): string {
  return p.t === 'p' ? `p/${p.n}` : p.t === 'y' ? `y/${p.p}/${p.n}` : `c/${p.e}`
}

export function placeLabel(p: Place): string {
  return p.t === 'y' ? `${p.p} · ${p.n}` : p.t === 'c' ? `${p.n}（${p.e}）` : p.n
}

const BY_KEY = new Map(PLACES.map((p) => [placeKey(p), p]))

export function findPlace(key: string): Place | undefined {
  return BY_KEY.get(key)
}
