import type {
  MapPurpose,
  RecommendRequest,
  Recommendation,
  RegionExtent,
} from './types'
import { findProjection, resolveExtent } from './presets'

interface ExtentFeature {
  centerLat: number
  latSpan: number
  lonSpan: number
  /** 形状比：等距圆柱意义下的东西/南北比，<0.6 视为南北狭长 */
  shapeRatio: number
  isWorld: boolean
  isChina: boolean
}

function extractFeature(extent: RegionExtent): ExtentFeature {
  const centerLat = (extent.minLat + extent.maxLat) / 2
  const latSpan = extent.maxLat - extent.minLat
  const lonSpan = extent.maxLon - extent.minLon
  const eastWestKm = lonSpan * Math.cos((centerLat * Math.PI) / 180)
  return {
    centerLat,
    latSpan,
    lonSpan,
    shapeRatio: latSpan === 0 ? Infinity : eastWestKm / latSpan,
    isWorld: lonSpan >= 330 && latSpan >= 100, // 防止环极的北极/南极地区被误判为世界全图（spec/02 §4.2）
    isChina:
      extent.minLon <= 75 && extent.maxLon >= 133 && extent.minLat <= 20 && extent.maxLat >= 52,
  }
}

interface RuleHit {
  id: string
  reason: string
  confidence: number
}

/** 第一优先级：用途硬规则（spec/02 §4.2） */
function purposeRules(purpose: MapPurpose, f: ExtentFeature): RuleHit[] {
  const polar = Math.abs(f.centerLat) > 60
  switch (purpose) {
    case 'navigation':
      return polar
        ? [{ id: 'polar-stereographic', reason: '极地航海航空导航需等角投影，极地立体投影保持角度与局部形状', confidence: 0.9 }]
        : [{ id: 'mercator', reason: '航海导航要求等角投影：等角航线（恒向线）在墨卡托图上为直线，便于量算航向', confidence: 0.9 }]
    case 'topographic':
      return [
        {
          id: 'transverse-mercator',
          reason: '大比例尺地形图采用横轴等角投影（高斯-克吕格 / 横轴墨卡托），按 6° 或 3° 分带控制变形',
          confidence: 0.9,
        },
      ]
    case 'meteorology':
      return [
        {
          id: 'lambert-conformal-conic',
          reason: '中纬度气象图需保持锋面与等压线形态，兰伯特等角圆锥投影为中纬度标准选择',
          confidence: 0.9,
        },
      ]
    case 'polar':
      return [
        { id: 'polar-stereographic', reason: '极地制图常用极地立体投影（等角），极点附近变形最小', confidence: 0.9 },
        { id: 'azimuthal-equidistant', reason: '方位等距投影可自极点向外正确量算距离与方位', confidence: 0.8 },
      ]
    default:
      return []
  }
}

/** 第二优先级：纬度带 × 变形性质（spec/02 §4.2） */
function latitudeBandRules(purpose: MapPurpose, f: ExtentFeature): RuleHit[] {
  const absLat = Math.abs(f.centerLat)
  const wantEqualArea = purpose === 'statistic'
  if (absLat > 60) {
    return wantEqualArea
      ? [{ id: 'lambert-azimuthal-equal-area', reason: `区域中心纬度 ${f.centerLat.toFixed(1)}° 属高纬/极地带，且统计制图要求等积，宜用方位等积投影`, confidence: 0.75 }]
      : [{ id: 'polar-stereographic', reason: `区域中心纬度 ${f.centerLat.toFixed(1)}° 属高纬/极地带，方位类投影以极点为中心变形最小`, confidence: 0.75 }]
  }
  if (absLat >= 25) {
    return wantEqualArea
      ? [{ id: 'albers-equal-area-conic', reason: `区域中心纬度 ${f.centerLat.toFixed(1)}° 位于中纬度带，统计专题图要求面积正确，阿尔伯斯等积圆锥为首选`, confidence: 0.75 }]
      : [{ id: 'lambert-conformal-conic', reason: `区域中心纬度 ${f.centerLat.toFixed(1)}° 位于中纬度东西延展带，圆锥投影沿标准纬线变形最小`, confidence: 0.75 }]
  }
  return wantEqualArea
    ? [{ id: 'gall-peters', reason: `区域中心纬度 ${f.centerLat.toFixed(1)}° 位于低纬/赤道带，圆柱等积投影兼顾面积与简单经纬网`, confidence: 0.75 }]
    : [
        { id: 'mercator', reason: `区域中心纬度 ${f.centerLat.toFixed(1)}° 位于低纬/赤道带，切赤道圆柱投影变形最小`, confidence: 0.75 },
        { id: 'equidistant-cylindrical', reason: '等距圆柱经纬网为规则方格，低纬教学演示直观', confidence: 0.65 },
      ]
}

/** 第三优先级：形状与特殊场景（spec/02 §4.2） */
function specialRules(purpose: MapPurpose, f: ExtentFeature): RuleHit[] {
  const hits: RuleHit[] = []
  if (f.isChina && (purpose === 'statistic' || purpose === 'general')) {
    hits.push({
      id: 'albers-equal-area-conic',
      reason:
        '命中中国全图惯例：阿尔伯斯等积圆锥，双标准纬线 25°N / 47°N、中央经线 105°E（《中国全图》常用方案）',
      confidence: 0.9,
    })
  }
  if (f.isWorld) {
    if (purpose === 'education' || purpose === 'general') {
      hits.push(
        { id: 'robinson', reason: '世界挂图宜选用折中投影：罗宾逊投影各类变形均衡、视觉效果好', confidence: 0.85 },
        { id: 'winkel-tripel', reason: '温克尔三重投影同为世界全图常用折中方案（《国家地理》曾采用）', confidence: 0.8 },
      )
    } else if (purpose === 'statistic') {
      hits.push({ id: 'mollweide', reason: '世界范围统计分布图要求全球面积可比，摩尔魏特为等积伪圆柱投影', confidence: 0.85 })
    }
  }
  if (f.shapeRatio < 0.6 && purpose !== 'statistic') {
    hits.push({
      id: 'transverse-mercator',
      reason: `区域形状比 ${f.shapeRatio.toFixed(2)}（南北狭长），横轴墨卡托沿南北中央经线变形最小`,
      confidence: 0.8,
    })
  }
  return hits
}

/**
 * 规则引擎入口：输出按置信度排序的推荐列表（至多 4 条）。
 * 离线必可用 —— 对应 spec/02 §4.1 双通道中的规则通道。
 */
export function recommendByRule(req: RecommendRequest): Recommendation[] {
  const extent = req.region.kind === 'extent' ? req.region.extent : resolveExtent(req.region.presetId)
  if (!extent) return []
  const f = extractFeature(extent)

  const hits = [...specialRules(req.purpose, f), ...purposeRules(req.purpose, f), ...latitudeBandRules(req.purpose, f)]

  // 同一投影取最高置信度，理由取首条（越靠前的规则优先级越高）
  const byId = new Map<string, RuleHit>()
  for (const hit of hits) {
    const prev = byId.get(hit.id)
    if (!prev || hit.confidence > prev.confidence) byId.set(hit.id, hit)
  }

  return [...byId.values()]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 4)
    .flatMap((hit) => {
      const projection = findProjection(hit.id)
      return projection ? [{ projection, reason: hit.reason, source: 'rule' as const, confidence: hit.confidence }] : []
    })
}
