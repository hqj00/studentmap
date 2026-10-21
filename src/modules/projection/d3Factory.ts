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
// 中国国界矢量（spec/09 §2.5）：阿里云 DataV GeoAtlas 标准国界数据，含台湾、港澳、
// 南海诸岛与十段线；体量小，直接内置以保证离线可用（仅作教学示意）
import chinaBoundaryData from '@/assets/china-boundary.json'
import type { ProjectionInfo, RegionExtent } from './types'
import { effectiveParams } from './params'

/** 世界陆地轮廓（world-atlas land-110m，内置分发、离线可用；spec/07 §2.5） */
const LAND = feature(
  landTopo as unknown as Topology,
  (landTopo as unknown as Topology).objects.land as GeometryObject,
) as unknown as GeoPermissibleObjects

/** 中国国界轮廓（面；含全部岛礁） */
const CHINA_BOUNDARY = {
  type: 'FeatureCollection',
  features: [(chinaBoundaryData as { features: unknown[] }).features[0]],
} as unknown as GeoPermissibleObjects

/** 南海诸岛十段线（细长面要素，按填充呈现为线段） */
const CHINA_TEN_DASH = {
  type: 'FeatureCollection',
  features: [(chinaBoundaryData as { features: unknown[] }).features[1]],
} as unknown as GeoPermissibleObjects

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
  /** 中国国界轮廓（spec/09 §2.5；仅 opts.chinaBoundary 时生成，否则为空串） */
  chinaBoundary: string
  /** 南海诸岛十段线（spec/09 §2.5；仅 opts.chinaBoundary 时生成，否则为空串） */
  chinaTenDash: string
}

export interface PreviewOptions {
  /** 区域成图（spec/09 §2.2）：球面/陆地/经纬网裁剪到 extent，不再画范围绿框 */
  clipToExtent?: boolean
  /** 叠加完整中国国界图层（含台湾、南海诸岛与十段线；spec/09 §2.5） */
  chinaBoundary?: boolean
}

export function buildPreviewLayers(
  info: ProjectionInfo,
  extent: RegionExtent,
  width: number,
  height: number,
  marker?: [number, number],
  opts?: PreviewOptions,
): PreviewLayers {
  const proj = createProjection(info, extent, width, height)

  // 世界视图的展示带投影：底图、陆地、经纬网都裁到展示带内（完整球面的扇形/无穷区不出画）
  const display = isWorldExtent(extent) ? worldDisplayConfig(info) : null
  // 区域成图：整幅即制图区域（spec/09 中国组缩略图）
  const clip = !display && opts?.clipToExtent ? extent : null
  if (display || clip) {
    proj.clipExtent([
      [0, 0],
      [width, height],
    ])
  }
  const path = geoPath(proj)

  const region = display?.extent ?? clip
  const sphere = path(region ? extentPolygon(region) : { type: 'Sphere' }) ?? ''
  const land = path(region ? clipLandToExtent(LAND, region) : LAND) ?? ''
  // 中国国界图层（spec/09 §2.5）：与陆地同一投影，clipExtent 下自动裁到画幅
  const chinaBoundary = opts?.chinaBoundary ? (path(CHINA_BOUNDARY) ?? '') : ''
  const chinaTenDash = opts?.chinaBoundary ? (path(CHINA_TEN_DASH) ?? '') : ''
  // 经纬网间隔（spec/09 §3.1）：区域图 10° 细网（中国全图惯例）；世界全图 30°（挂图惯例，缩略图下清晰）；
  // 方位类全球图 15°（极区/半球图的经纬圈更密，30° 只剩两三圈）；墨卡托等跨 360° 的展示带同样取 30°。
  // 判断依据是成图范围本身（isWorldExtent），而非是否裁剪——推荐方案预览不裁剪，中国范围也应是 10° 网
  const worldView = isWorldExtent(extent)
  const wideWorld = worldView && (!display || display.extent.maxLon - display.extent.minLon >= 300)
  const gratStepDeg: [number, number] = wideWorld
    ? info.category === 'azimuthal'
      ? [15, 15]
      : [30, 30]
    : [10, 10]
  const gratGeo = geoGraticule().step(gratStepDeg)
  if (region) {
    gratGeo.extent([
      [region.minLon, region.minLat],
      [region.maxLon, region.maxLat],
    ])
  }
  const grat = path(gratGeo()) ?? ''
  const extentD = isWorldExtent(extent) || clip ? '' : (path(extentPolygon(extent)) ?? '')
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
  return { sphere, land, grat, extentD, tissot, markerPt, chinaBoundary, chinaTenDash }
}

/** 预览图层样式（spec/07 §2.5 陆地填充教学风格；spec/09 §3.1 经纬网加深标清）：组件内联绑定使用，导出的独立 SVG 因此样式自包含 */
export const PREVIEW_STYLE = {
  sphere: { fill: '#fbfcfa', stroke: '#c9d9c9', 'stroke-width': 1 },
  land: { fill: '#e9f2e3', stroke: '#b9cfb2', 'stroke-width': 0.6 },
  grat: { fill: 'none', stroke: '#8bab98', 'stroke-width': 0.7, 'stroke-dasharray': '2.5 2.5' },
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

/* ------------------------------------------------------------------ */
/* spec/09 §3 图面整饰：经纬网标注 + 比例尺换算                            */
/* ------------------------------------------------------------------ */

/** 经纬网标注（投影后像素坐标；随图面缩放，属地图内容） */
export interface GratLabel {
  x: number
  y: number
  text: string
  anchor: 'middle' | 'start'
}

export interface PreviewDecorations {
  gratLabels: GratLabel[]
  /** 投影中心处地面米 / 像素（缩放级别 1 时）；比例尺据此换算（spec/09 §3.3） */
  metersPerPixel: number
}

/** 标注间隔：跨度内标 ≤7 条，步长取整十/整十五等教学惯用值 */
function gratStep(span: number): number {
  for (const s of [2, 5, 10, 15, 20, 30, 45, 60, 90]) if (span / s <= 7) return s
  return 90
}

const fmtLonLabel = (v: number) => (v === 0 ? '0°' : `${Math.abs(v)}°${v > 0 ? 'E' : 'W'}`)
const fmtLatLabel = (v: number) => (v === 0 ? '0°' : `${Math.abs(v)}°${v > 0 ? 'N' : 'S'}`)

/**
 * 图面整饰数据（spec/09 §3）：与 buildPreviewLayers 同一投影配置。
 * 区域图（展示带 / clipToExtent）沿下边缘标经度、左边缘标纬度；
 * 世界全图沿赤道标经度、沿中央经线标纬度（0° 纬线即赤道，不重复标注）。
 * 落在画幅外或被指北针/比例尺/图例遮挡的标注自动省略。
 */
export function buildPreviewDecorations(
  info: ProjectionInfo,
  extent: RegionExtent,
  width: number,
  height: number,
  opts?: PreviewOptions,
): PreviewDecorations {
  const proj = createProjection(info, extent, width, height)
  const display = isWorldExtent(extent) ? worldDisplayConfig(info) : null
  const clip = !display && opts?.clipToExtent ? extent : null
  // 跨 360° 的展示带（墨卡托 ±85°）仍按世界全图标注（沿赤道/中央经线）；
  // 中纬展示带（圆锥、高斯）与中国组才按区域图标注
  const wideBand = display && display.extent.maxLon - display.extent.minLon >= 300
  const region = display && !wideBand ? display.extent : (clip ?? null)

  const gratLabels: GratLabel[] = []
  // 与四角整饰（指北针/比例尺/图例）的避让区
  const blocked = (x: number, y: number) =>
    (x < 26 && y < 26) || // 左上：指北针
    (x < 104 && y > height - 22) || // 左下：比例尺
    (x > width - 74 && y > height - 44) // 右下：图例

  if (region) {
    // 区域图：经度标注沿下边缘，纬度标注沿左边缘（间隔随跨度自适应，缩略图尺寸下保证不挤）
    const lonSpan = region.maxLon - region.minLon
    const lonStep = gratStep(lonSpan)
    let lastLonX = Number.NEGATIVE_INFINITY
    for (let lon = Math.ceil(region.minLon / lonStep) * lonStep; lon <= region.maxLon; lon += lonStep) {
      const pt = proj([lon, region.minLat])
      if (!pt) continue
      const x = pt[0]
      if (x - lastLonX < 16) continue
      const y = Math.min(pt[1] - 2, height - 3)
      if (x < 11 || x > width - 11 || y < 9 || blocked(x, y)) continue
      lastLonX = x
      gratLabels.push({ x, y, text: fmtLonLabel(lon), anchor: 'middle' })
    }
    const latStep = gratStep(region.maxLat - region.minLat)
    for (let lat = Math.ceil(region.minLat / latStep) * latStep; lat <= region.maxLat; lat += latStep) {
      const pt = proj([region.minLon, lat])
      if (!pt) continue
      const x = pt[0] + 2.5
      const y = pt[1] + 1.8
      if (y < 26 || y > height - 6 || x > width - 20 || blocked(x, y)) continue
      gratLabels.push({ x, y, text: fmtLatLabel(lat), anchor: 'start' })
    }
  } else {
    // 世界全图：经度标注沿赤道（每 60°，缩略图上比 30° 更清爽），纬度标注沿中央经线
    const cm = effectiveParams(info, extent).centralMeridian
    let lastLonX = Number.NEGATIVE_INFINITY
    for (let lon = -120; lon <= 120; lon += 60) {
      const pt = proj([lon, 0])
      if (!pt) continue
      const x = pt[0]
      if (x - lastLonX < 16) continue
      const y = pt[1] + 7
      if (x < 12 || x > width - 12 || y > height - 4 || blocked(x, y)) continue
      lastLonX = x
      gratLabels.push({ x, y, text: fmtLonLabel(lon), anchor: 'middle' })
    }
    // 方位类全球图的 30°N/30°S 紧贴投影中心，缩略图上与中心标注叠成一团，只留 ±60°
    const latStepDeg = info.category === 'azimuthal' ? 60 : 30
    for (let lat = -60; lat <= 60; lat += latStepDeg) {
      if (lat === 0) continue // 赤道即 0°，经度标注已压在该线上
      const pt = proj([cm, lat])
      if (!pt) continue
      const x = pt[0] + 3
      const y = pt[1] + 1.8
      if (y < 8 || y > height - 6 || x > width - 20 || blocked(x, y)) continue
      gratLabels.push({ x, y, text: fmtLatLabel(lat), anchor: 'start' })
    }
  }

  // d3 投影 scale ≈ 投影中心处像素/弧度 → 米/像素 = 地球半径 / scale（教学示意比例尺，局部近似）
  return { gratLabels, metersPerPixel: 6371000 / proj.scale() }
}
