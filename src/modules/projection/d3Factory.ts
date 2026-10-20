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

/**
 * 世界视图下，部分投影无法展示整个球面（圆锥两极发散成无穷扇形、墨卡托极点映射到无穷远、
 * 横轴墨卡托在离中央经线 90° 处奇异）——退化为各自的"教学展示带"（spec/07 §2.3）。
 * 返回 null 表示可用完整球面。
 */
export interface WorldDisplay {
  extent: RegionExtent
  centralMeridian: number
  standardParallels?: [number, number]
}

export function worldDisplayConfig(info: ProjectionInfo): WorldDisplay | null {
  const midLat: RegionExtent = { minLon: 40, minLat: 5, maxLon: 150, maxLat: 65 }
  if (info.category === 'conic') {
    // 圆锥投影的教科书示意：中纬东西延展区域（欧亚），标称标准纬线
    return {
      extent: midLat,
      centralMeridian: 95,
      standardParallels: info.id === 'albers-equal-area-conic' ? [25, 47] : [30, 60],
    }
  }
  if (info.id === 'mercator') {
    return { extent: { minLon: -180, minLat: -85, maxLon: 180, maxLat: 85 }, centralMeridian: 0 }
  }
  if (info.id === 'transverse-mercator') {
    // 高斯-克吕格按单个 6° 带无法构图，展示带取中纬区域以呈现经线收敛
    return { extent: midLat, centralMeridian: 95 }
  }
  return null
}

/** 世界视图展示说明（卡片副标题用；null 表示标准世界全图） */
export function worldDisplayNote(info: ProjectionInfo): string | null {
  if (info.category === 'conic' || info.id === 'transverse-mercator') return '中纬带示意'
  if (info.id === 'mercator') return '世界全图（±85° 内）'
  return null
}

/** Sutherland–Hodgman：把环裁剪到经纬度矩形（平面坐标），用于展示带内的陆地轮廓 */
function clipRingToRect(ringPts: [number, number][], e: RegionExtent): [number, number][] {
  let pts = ringPts
  const cut = (
    input: [number, number][],
    inside: (p: [number, number]) => boolean,
    intersect: (a: [number, number], b: [number, number]) => [number, number],
  ) => {
    const out: [number, number][] = []
    for (let i = 0; i < input.length; i++) {
      const cur = input[i]
      const prev = input[(i + input.length - 1) % input.length]
      const curIn = inside(cur)
      const prevIn = inside(prev)
      if (curIn) {
        if (!prevIn) out.push(intersect(prev, cur))
        out.push(cur)
      } else if (prevIn) {
        out.push(intersect(prev, cur))
      }
    }
    return out
  }
  const ixLon = (a: [number, number], b: [number, number], lon: number): [number, number] => [
    lon,
    a[1] + ((b[1] - a[1]) * (lon - a[0])) / (b[0] - a[0]),
  ]
  const ixLat = (a: [number, number], b: [number, number], lat: number): [number, number] => [
    a[0] + ((b[0] - a[0]) * (lat - a[1])) / (b[1] - a[1]),
    lat,
  ]
  pts = cut(pts, (p) => p[0] >= e.minLon, (a, b) => ixLon(a, b, e.minLon))
  pts = cut(pts, (p) => p[0] <= e.maxLon, (a, b) => ixLon(a, b, e.maxLon))
  pts = cut(pts, (p) => p[1] >= e.minLat, (a, b) => ixLat(a, b, e.minLat))
  pts = cut(pts, (p) => p[1] <= e.maxLat, (a, b) => ixLat(a, b, e.maxLat))
  return pts
}

/** 陆地轮廓裁剪到展示带（避免扇形/奇异区内容溢出画幅） */
function clipLandToExtent(land: GeoPermissibleObjects, e: RegionExtent): GeoPermissibleObjects {
  // topojson feature() 对本数据的 objects.land（GeometryCollection）返回 FeatureCollection
  type Geometry = { type: string; coordinates?: number[][][][] }
  const input = land as unknown as {
    type: string
    geometry?: Geometry
    coordinates?: number[][][][]
    features?: { geometry: Geometry }[]
  }
  const geometries: Geometry[] = []
  if (input.type === 'FeatureCollection') {
    for (const f of input.features ?? []) geometries.push(f.geometry)
  } else if (input.type === 'Feature') {
    if (input.geometry) geometries.push(input.geometry)
  } else {
    geometries.push(input as Geometry)
  }
  const out: number[][][][] = []
  for (const g of geometries) {
    const polys: number[][][][] =
      g.type === 'Polygon'
        ? [g.coordinates as unknown as number[][][]]
        : g.type === 'MultiPolygon'
          ? (g.coordinates as unknown as number[][][][])
          : []
    for (const polyRings of polys) {
      const rings = polyRings.map((r) => clipRingToRect(r as [number, number][], e)).filter((r) => r.length >= 4)
      if (rings.length) out.push(rings)
    }
  }
  return { type: 'MultiPolygon', coordinates: out } as unknown as GeoPermissibleObjects
}

/** 知识库 id → 配置好参数与画幅的 d3 投影实例（spec/02 §6） */
export function createProjection(
  info: ProjectionInfo,
  extent: RegionExtent,
  width: number,
  height: number,
): GeoProjection {
  const p = effectiveParams(info, extent)
  // 世界视图：不能展示全球的投影改用教学展示带与其标称参数
  const display = isWorldExtent(extent) ? worldDisplayConfig(info) : null
  const cm = display ? display.centralMeridian : p.centralMeridian
  const originLat = display ? 0 : p.originLat
  const parallels = display?.standardParallels ?? p.standardParallels
  let proj: GeoProjection
  switch (info.id) {
    case 'mercator':
      proj = geoMercator()
      break
    case 'transverse-mercator':
      proj = geoTransverseMercator()
      break
    case 'lambert-conformal-conic': {
      proj = geoConicConformal().parallels(parallels && parallels.length >= 2 ? [parallels[0], parallels[1]] : [30, 60])
      break
    }
    case 'albers-equal-area-conic': {
      proj = geoConicEqualArea().parallels(parallels && parallels.length >= 2 ? [parallels[0], parallels[1]] : [25, 47])
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
    proj.rotate([-cm, -originLat])
  } else {
    proj.rotate([-cm, 0]).center([0, originLat])
  }

  // 世界全图：能展示完整球面的用球面，不能的退化为教学展示带
  const target: GeoPermissibleObjects = display
    ? extentPolygon(display.extent)
    : isWorldExtent(extent)
      ? { type: 'Sphere' }
      : extentPolygon(extent)

  // 墨卡托自带默认 clipExtent（按默认 scale/translate 定义），不清除会把 fitExtent 的包围盒算错
  proj.clipExtent(null)
  proj.fitExtent(
    [
      [6, 6],
      [width - 6, height - 6],
    ],
    target,
  )
  // 展示带裁剪：扇形、奇异区一律裁到画幅内，避免路径溢出到卡片外
  if (display) {
    proj.clipExtent([
      [0, 0],
      [width, height],
    ])
  }
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

  // 世界视图的展示带投影：底图、陆地、经纬网都裁到展示带内（完整球面的扇形/无穷区不出画）
  const display = isWorldExtent(extent) ? worldDisplayConfig(info) : null
  const sphere = path(display ? extentPolygon(display.extent) : { type: 'Sphere' }) ?? ''
  const land = path(display ? clipLandToExtent(LAND, display.extent) : LAND) ?? ''
  const grat =
    path(
      display
        ? geoGraticule().extent([
            [display.extent.minLon, display.extent.minLat],
            [display.extent.maxLon, display.extent.maxLat],
          ])()
        : geoGraticule()(),
    ) ?? ''
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
