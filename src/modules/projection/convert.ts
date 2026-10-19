import proj4 from 'proj4'
import type { ProjectionInfo, RegionExtent } from './types'
import { buildProj4 } from './exporters'

/**
 * 坐标试算（spec/02 §10 / FR-1.12）
 * 投影定义与参数导出共用同一份 PROJ4 字符串，保证页面结果与 GIS 软件一致。
 * proj4js 不支持的投影（如温克尔三重）返回 null，由界面提示。
 */

type Converter = {
  forward: (coord: [number, number]) => [number, number]
  inverse: (coord: [number, number]) => [number, number]
}

function makeConverter(info: ProjectionInfo, extent: RegionExtent): Converter | null {
  try {
    return proj4(buildProj4(info, extent)) as unknown as Converter
  } catch {
    return null
  }
}

const finite = (v: [number, number]) => Number.isFinite(v[0]) && Number.isFinite(v[1])

/** 正算：经纬度（度）→ 平面坐标（米） */
export function forwardProject(
  info: ProjectionInfo,
  extent: RegionExtent,
  lon: number,
  lat: number,
): [number, number] | null {
  const c = makeConverter(info, extent)
  if (!c) return null
  try {
    const out = c.forward([lon, lat])
    return finite(out) ? out : null
  } catch {
    return null
  }
}

/** 反算：平面坐标（米）→ 经纬度（度） */
export function inverseProject(
  info: ProjectionInfo,
  extent: RegionExtent,
  x: number,
  y: number,
): [number, number] | null {
  const c = makeConverter(info, extent)
  if (!c) return null
  try {
    const out = c.inverse([x, y])
    return finite(out) ? out : null
  } catch {
    return null
  }
}
