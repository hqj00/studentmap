import {
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoCircle,
  geoConicConformal,
  geoConicEqualArea,
  geoEqualEarth,
  geoEquirectangular,
  geoGnomonic,
  geoGraticule,
  geoMercator,
  geoNaturalEarth1,
  geoOrthographic,
  geoPath,
  geoStereographic,
  geoTransverseMercator,
  type GeoPermissibleObjects,
  type GeoProjection,
} from 'd3-geo'
import { geoCylindricalEqualArea, geoMollweide, geoPolyconic, geoRobinson, geoSinusoidal, geoWinkel3 } from 'd3-geo-projection'
import { feature } from 'topojson-client'
import type { GeometryObject, Topology } from 'topojson-specification'
import landTopo from '@/assets/land-110m.json'
import type { ProjectionInfo, RegionExtent } from './types'
import { effectiveParams } from './params'

/** 世界陆地轮廓（world-atlas land-110m，内置分发、离线可用；spec/07 §2.5） */
const LAND = feature(
  landTopo as unknown as Topology,
  (landTopo as unknown as Topology).objects.land as GeometryObject,
) as unknown as GeoPermissibleObjects

/** 制图范围的 GeoJSON 外框（预览绿框 / fitExtent 目标）。环必须顺时针（d3 球面多边形约定），否则会被当作补集 */
export function extentPolygon(e: RegionExtent): GeoPermissibleObjects {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [e.minLon, e.minLat],
          [e.minLon, e.maxLat],
          [e.maxLon, e.maxLat],
          [e.maxLon, e.minLat],
          [e.minLon, e.minLat],
        ],
      ],
    },
  }
}

export function isWorldExtent(e: RegionExtent): boolean {
  return e.maxLon - e.minLon >= 330 && e.maxLat - e.minLat >= 100
}

/** 知识库 id → 配置好参数与画幅的 d3 投影实例（spec/02 §6） */
export function createProjection(
  info: ProjectionInfo,
  extent: RegionExtent,
  width: number,
  height: number,
): GeoProjection {
  const p = effectiveParams(info, extent)
  let proj: GeoProjection
  switch (info.id) {
    case 'mercator':
      proj = geoMercator()
      break
    case 'transverse-mercator':
      proj = geoTransverseMercator()
      break
    case 'lambert-conformal-conic': {
      const sp = p.standardParallels
      proj = geoConicConformal().parallels(sp && sp.length >= 2 ? [sp[0], sp[1]] : [30, 60])
      break
    }
    case 'albers-equal-area-conic': {
      const sp = p.standardParallels
      proj = geoConicEqualArea().parallels(sp && sp.length >= 2 ? [sp[0], sp[1]] : [25, 47])
      break
    }
    case 'azimuthal-equidistant':
      proj = geoAzimuthalEquidistant()
      break
    case 'polar-stereographic':
      proj = geoStereographic()
      break
    case 'lambert-azimuthal-equal-area':
      proj = geoAzimuthalEqualArea()
      break
    case 'gall-peters':
      proj = geoCylindricalEqualArea().parallel(45)
      break
    case 'robinson':
      proj = geoRobinson()
      break
    case 'winkel-tripel':
      proj = geoWinkel3()
      break
    case 'mollweide':
      proj = geoMollweide()
      break
    // spec/07 §2.1 扩充条目
    case 'sinusoidal':
      proj = geoSinusoidal()
      break
    case 'polyconic':
      proj = geoPolyconic()
      break
    case 'orthographic':
      proj = geoOrthographic()
      break
    case 'gnomonic':
      proj = geoGnomonic()
      break
    case 'natural-earth':
      proj = geoNaturalEarth1()
      break
    case 'equal-earth':
      proj = geoEqualEarth()
      break
    case 'equidistant-cylindrical':
    default:
      proj = geoEquirectangular()
      break
  }

  // 定向：方位投影视点对准区域中心（极地 ±90°）；其余旋转到中央经线、平移到原点纬度。
  // 横轴墨卡托必须走 rotate（沿中央经线定向），用 center 平移会把奇异区拉进画幅
  if (info.category === 'azimuthal') {
    proj.rotate([-p.centralMeridian, -p.originLat])
  } else {
    proj.rotate([-p.centralMeridian, 0]).center([0, p.originLat])
  }

  // 圆锥投影无法展示全球（极点发散到无穷），世界全图退化为中低纬展示带
  const target: GeoPermissibleObjects = isWorldExtent(extent)
    ? info.category === 'conic'
      ? extentPolygon({ minLon: -180, minLat: -60, maxLon: 180, maxLat: 80 })
    : { type: 'Sphere' }
    : extentPolygon(extent)
  proj.fitExtent(
    [
      [6, 6],
      [width - 6, height - 6],
    ],
    target,
  )
  return proj
}

/** 预览图层路径（spec/02 §6 + spec/07 §2.5）：组件与离线验收脚本共用 */
export interface PreviewLayers {
  sphere: string
  /** 陆地轮廓（world-atlas land-110m） */
  land: string
  grat: string
  extentD: string
  tissot: string[]
  /** 坐标标记点（投影后像素坐标；落在裁剪区外时为 null，不绘制） */
  markerPt: [number, number] | null
}

export function buildPreviewLayers(
  info: ProjectionInfo,
  extent: RegionExtent,
  width: number,
  height: number,
  marker?: [number, number],
): PreviewLayers {
  const proj = createProjection(info, extent, width, height)
  const path = geoPath(proj)

  const sphere = path({ type: 'Sphere' }) ?? ''
  const land = path(LAND) ?? ''
  const grat = path(geoGraticule()()) ?? ''
  const extentD = isWorldExtent(extent) ? '' : (path(extentPolygon(extent)) ?? '')
  const markerPt = marker ? (proj(marker) ?? null) : null

  // Tissot：区域内 4×3 布点的等半径小圆，投影后的形变直观反映面积/角度变形
  const lonSpan = extent.maxLon - extent.minLon
  const latSpan = extent.maxLat - extent.minLat
  const radius = Math.min(6, Math.max(1.5, Math.min(lonSpan, latSpan) / 10))
  const circle = geoCircle().radius(radius)
  const tissot: string[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      const lon = extent.minLon + lonSpan * 0.15 + (lonSpan * 0.7 * (i + 0.5)) / 4
      const lat = extent.minLat + latSpan * 0.15 + (latSpan * 0.7 * (j + 0.5)) / 3
      const d = path(circle.center([lon, lat])())
      if (d) tissot.push(d)
    }
  }
  return { sphere, land, grat, extentD, tissot, markerPt }
}

/** 预览图层样式（spec/07 §2.5 陆地填充教学风格）：组件内联绑定使用，导出的独立 SVG 因此样式自包含 */
export const PREVIEW_STYLE = {
  sphere: { fill: '#fbfcfa', stroke: '#c9d9c9', 'stroke-width': 1 },
  land: { fill: '#e9f2e3', stroke: '#b9cfb2', 'stroke-width': 0.6 },
  grat: { fill: 'none', stroke: '#c3d8c4', 'stroke-width': 0.5, 'stroke-dasharray': '2 3' },
  extent: { fill: 'rgba(59, 162, 114, 0.12)', stroke: '#2e825b', 'stroke-width': 1.2 },
  tissot: { fill: 'rgba(230, 126, 34, 0.28)', stroke: '#e67e22', 'stroke-width': 0.8 },
} as const

/** 把渲染中的 SVG 内容包装成可独立打开的 SVG 文件（2 倍尺寸写出，供高清使用） */
export function buildStandaloneSvg(inner: string, width: number, height: number): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width * 2}" height="${height * 2}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="${width}" height="${height}" fill="#fbfcfa"/>` +
    inner +
    `</svg>`
  )
}
