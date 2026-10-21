/** 投影模块类型定义 — 对应 spec/02 §3 */

/** 经纬度包围盒（单位：度） */
export interface RegionExtent {
  minLon: number
  minLat: number
  maxLon: number
  maxLat: number
}

export type RegionInput =
  | { kind: 'extent'; extent: RegionExtent }
  | { kind: 'preset'; presetId: string }

export type MapPurpose =
  | 'general'
  | 'navigation'
  | 'statistic'
  | 'education'
  | 'topographic'
  | 'meteorology'
  | 'polar'

export type ProjectionCategory =
  | 'cylindrical'
  | 'conic'
  | 'azimuthal'
  | 'pseudocylindrical'
  | 'compromise'

export type DistortionProperty = 'conformal' | 'equal-area' | 'equidistant' | 'compromise'

export interface ProjectionParams {
  centralMeridian?: number
  standardParallels?: number[]
  originLat?: number
}

export interface ProjectionInfo {
  id: string
  name: string
  zhName: string
  category: ProjectionCategory
  property: DistortionProperty
  typicalParams?: ProjectionParams
  suitableFor: string
  /** 优点（供双方案对比展示） */
  pros: string[]
  /** 缺点/局限 */
  cons: string[]
  /** EPSG 对应提示；无直接对应时省略，由 exporters 统一兜底文案 */
  epsgHint?: string
  /** 参考影像图（Wikimedia Commons 自由许可，spec/02 §10）；无合适影像时省略 */
  refImage?: { url: string; credit: string }
}

export interface Recommendation {
  projection: ProjectionInfo
  reason: string
  source: 'rule' | 'ai'
  confidence?: number
}

export interface RecommendRequest {
  region: RegionInput
  purpose: MapPurpose
}

export const PURPOSE_LABELS: Record<MapPurpose, string> = {
  general: '普通参考图 / 挂图',
  navigation: '航海 / 航空导航',
  statistic: '统计专题制图（面积敏感）',
  education: '教学演示',
  topographic: '大比例尺地形图',
  meteorology: '气象图',
  polar: '极地地区制图',
}

export const PROPERTY_LABELS: Record<DistortionProperty, string> = {
  conformal: '等角（正形）',
  'equal-area': '等积',
  equidistant: '等距',
  compromise: '折中（任意）',
}

export const CATEGORY_LABELS: Record<ProjectionCategory, string> = {
  cylindrical: '圆柱投影',
  conic: '圆锥投影',
  azimuthal: '方位投影',
  pseudocylindrical: '伪圆柱投影',
  compromise: '折中投影',
}
