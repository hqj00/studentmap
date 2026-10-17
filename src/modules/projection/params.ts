import type { ProjectionInfo, RegionExtent } from './types'

/** 有效参数 — 预览/展示/导出三处共用（spec/02 §6.1） */
export interface EffectiveParams {
  centralMeridian: number
  standardParallels?: number[]
  originLat: number
}

const r1 = (v: number) => Math.round(v * 10) / 10

/** 中国范围判定（与 ruleEngine 的 isChina 保持一致口径） */
export function isChinaExtent(e: RegionExtent): boolean {
  return e.minLon <= 75 && e.maxLon >= 133 && e.minLat <= 20 && e.maxLat >= 52
}

/** 6° 分带中央经线：⌊λ/6⌋+1 号带，中央经线 = 带号×6−3 */
export function gaussKrugerCentral(lon: number): number {
  return (Math.floor(lon / 6) + 1) * 6 - 3
}

export function effectiveParams(info: ProjectionInfo, extent: RegionExtent): EffectiveParams {
  const centerLon = r1((extent.minLon + extent.maxLon) / 2)
  const centerLat = r1((extent.minLat + extent.maxLat) / 2)
  const latSpan = extent.maxLat - extent.minLat
  // 标准纬线取区域向内 1/6 处（教学惯例）
  const innerParallels: [number, number] = [r1(extent.minLat + latSpan / 6), r1(extent.maxLat - latSpan / 6)]

  switch (info.id) {
    case 'albers-equal-area-conic':
      // 中国全图惯例：25°N/47°N/105°E（spec/02 §4.2）
      return isChinaExtent(extent)
        ? { centralMeridian: 105, standardParallels: [25, 47], originLat: 0 }
        : { centralMeridian: centerLon, standardParallels: innerParallels, originLat: centerLat }
    case 'lambert-conformal-conic':
      return { centralMeridian: centerLon, standardParallels: innerParallels, originLat: centerLat }
    case 'transverse-mercator':
      return { centralMeridian: gaussKrugerCentral(centerLon), originLat: 0 }
    case 'polar-stereographic':
      return { centralMeridian: centerLon, originLat: centerLat >= 0 ? 90 : -90 }
    case 'equidistant-cylindrical':
      return { centralMeridian: centerLon, standardParallels: [centerLat], originLat: 0 }
    case 'gall-peters':
      return { centralMeridian: centerLon, standardParallels: [45], originLat: 0 }
    default:
      return { centralMeridian: centerLon, originLat: centerLat }
  }
}
