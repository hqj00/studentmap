import type { ProjectionInfo, RegionExtent } from './types'

/** 预设区域 — 对应 spec/02 §3.1 FR-1.1（v0.2：按组组织，范围取标准四至） */
export interface RegionPreset {
  id: string
  label: string
  group: '全球' | '中国' | '大洲与典型区域' | '极地'
  extent: RegionExtent
}

export const REGION_PRESETS: RegionPreset[] = [
  { id: 'world', label: '世界全图', group: '全球', extent: { minLon: -180, minLat: -90, maxLon: 180, maxLat: 90 } },
  // 中国全图四至：帕米尔高原—黑乌汇合处、曾母暗沙—漠河（含南海诸岛）
  { id: 'china', label: '中国全图（含南海诸岛）', group: '中国', extent: { minLon: 73.5, minLat: 3.8, maxLon: 135.1, maxLat: 53.6 } },
  { id: 'beijing', label: '北京市', group: '中国', extent: { minLon: 115.4, minLat: 39.5, maxLon: 117.5, maxLat: 41.1 } },
  { id: 'qinghai-tibet', label: '青藏高原', group: '中国', extent: { minLon: 73.3, minLat: 26.0, maxLon: 104.8, maxLat: 39.8 } },
  { id: 'europe', label: '欧洲', group: '大洲与典型区域', extent: { minLon: -9.5, minLat: 36.0, maxLon: 66.0, maxLat: 71.0 } },
  { id: 'chile', label: '智利', group: '大洲与典型区域', extent: { minLon: -75.6, minLat: -56.0, maxLon: -66.0, maxLat: -17.5 } },
  { id: 'arctic', label: '北极地区', group: '极地', extent: { minLon: -180, minLat: 66.5, maxLon: 180, maxLat: 90 } },
  { id: 'antarctic', label: '南极地区', group: '极地', extent: { minLon: -180, minLat: -90, maxLon: 180, maxLat: -66.5 } },
]

export function resolveExtent(presetId: string): RegionExtent | undefined {
  return REGION_PRESETS.find((p) => p.id === presetId)?.extent
}

/** 供下拉项展示的「73.5°E~135.1°E · 3.8°N~53.6°N」格式范围文本 */
export function extentText(e: RegionExtent): string {
  const lon = (v: number) => `${Math.abs(v)}°${v >= 0 ? 'E' : 'W'}`
  const lat = (v: number) => `${Math.abs(v)}°${v >= 0 ? 'N' : 'S'}`
  return `${lon(e.minLon)}~${lon(e.maxLon)} · ${lat(e.minLat)}~${lat(e.maxLat)}`
}

/** 投影知识库 — 对应 spec/02 §5/§9；pros/cons/epsgHint 供对比与导出使用 */
export const PROJECTION_KB: ProjectionInfo[] = [
  {
    id: 'mercator',
    name: 'Mercator',
    zhName: '墨卡托投影',
    category: 'cylindrical',
    property: 'conformal',
    typicalParams: { standardParallels: [0] },
    suitableFor: '航海图、低纬度地区导航图；等角航线（恒向线）在图上为直线',
    pros: ['等角，局部形状与方向保真，恒向线为直线，海图标准投影'],
    cons: ['高纬面积严重夸大（格陵兰失真），不适合全球面积对比'],
    epsgHint: 'EPSG:3395（World Mercator）；Web 墨卡托另有 EPSG:3857',
  },
  {
    id: 'transverse-mercator',
    name: 'Transverse Mercator / Gauss-Krüger',
    zhName: '横轴墨卡托 / 高斯-克吕格投影',
    category: 'cylindrical',
    property: 'conformal',
    suitableFor: '大比例尺地形图（我国 1:1万~1:50万 采用，按 6°/3° 分带）、南北狭长区域',
    pros: ['分带内变形极小，等角保形，是我国大比例尺地形图的国家标准投影'],
    cons: ['不适合大范围成图（需分带），东西跨度大时带边缘变形迅速增大'],
    epsgHint: '按分带注册：CGCS2000 高斯-克吕格 6°带 EPSG:4491–4501、3°带 EPSG:4513–4533（以 EPSG 注册表为准）',
  },
  {
    id: 'lambert-conformal-conic',
    name: 'Lambert Conformal Conic',
    zhName: '兰伯特等角圆锥投影',
    category: 'conic',
    property: 'conformal',
    suitableFor: '中纬度东西延展区域的气象图、航空图，保持角度与局部形状',
    pros: ['等角保形态，中纬度东西向区域变形小，气象/航空图标准'],
    cons: ['面积变形明显，不适合面积敏感的统计专题图'],
  },
  {
    id: 'albers-equal-area-conic',
    name: 'Albers Equal-Area Conic',
    zhName: '阿尔伯斯等积圆锥投影',
    category: 'conic',
    property: 'equal-area',
    typicalParams: { centralMeridian: 105, standardParallels: [25, 47] },
    suitableFor: '中纬度统计专题图；中国全图惯例参数：双标准纬线 25°N/47°N，中央经线 105°E',
    pros: ['面积严格相等，统计专题图首选；中纬东西向区域整体变形小'],
    cons: ['角度与形状有变形，远离标准纬线处形状失真'],
  },
  {
    id: 'azimuthal-equidistant',
    name: 'Azimuthal Equidistant',
    zhName: '方位等距投影',
    category: 'azimuthal',
    property: 'equidistant',
    suitableFor: '极地地区、自中心点向外的距离与方位量算',
    pros: ['自投影中心的距离与方位严格正确，极地与航线规划直观'],
    cons: ['仅中心点性质可靠，越靠边缘形状与面积变形越大'],
  },
  {
    id: 'polar-stereographic',
    name: 'Polar Stereographic',
    zhName: '极地立体投影',
    category: 'azimuthal',
    property: 'conformal',
    suitableFor: '极地航海、航空与科考用图（等角）',
    pros: ['极区等角保形，是极地科考与导航的标准投影'],
    cons: ['只适合极区，中低纬度无法使用'],
  },
  {
    id: 'lambert-azimuthal-equal-area',
    name: 'Lambert Azimuthal Equal-Area',
    zhName: '兰伯特方位等积投影',
    category: 'azimuthal',
    property: 'equal-area',
    suitableFor: '大洲尺度、极地地区的等积专题制图',
    pros: ['大洲/极区面积保真，兼顾一定的形状保持'],
    cons: ['角度变形随远离投影中心而增大'],
  },
  {
    id: 'equidistant-cylindrical',
    name: 'Equidistant Cylindrical',
    zhName: '等距圆柱投影',
    category: 'cylindrical',
    property: 'equidistant',
    suitableFor: '低纬度简易制图与教学演示（经纬网为方格，直观易懂）',
    pros: ['经纬网为规则方格，计算与绘制最简单，教学演示友好'],
    cons: ['等角、等积性质都不具备，各类变形全面存在'],
  },
  {
    id: 'gall-peters',
    name: 'Gall-Peters',
    zhName: '高尔-彼得斯投影',
    category: 'cylindrical',
    property: 'equal-area',
    suitableFor: '低纬度及世界的面积对比专题图',
    pros: ['面积严格相等，全球面积对比公平（标准纬线 45°）'],
    cons: ['低纬形状拉伸明显，观感差，不适合挂图'],
  },
  {
    id: 'robinson',
    name: 'Robinson',
    zhName: '罗宾逊投影',
    category: 'compromise',
    property: 'compromise',
    suitableFor: '世界挂图、教学演示：各类变形均衡，视觉效果好',
    pros: ['各类变形折中均衡，视觉舒适，世界挂图常用'],
    cons: ['等角等积都不严格，不可用于精确量算'],
  },
  {
    id: 'winkel-tripel',
    name: 'Winkel Tripel',
    zhName: '温克尔三重投影',
    category: 'compromise',
    property: 'compromise',
    suitableFor: '世界全图（《国家地理》曾采用），折中变形',
    pros: ['折中方案中观感自然，经线弯曲平滑，世界全图常用'],
    cons: ['无严格几何性质，面积与角度均不可直接量算'],
  },
  {
    id: 'mollweide',
    name: 'Mollweide',
    zhName: '摩尔魏特投影',
    category: 'pseudocylindrical',
    property: 'equal-area',
    suitableFor: '世界范围的统计分布图（如人口、气候带分布）',
    pros: ['全球等积，分布类专题图面积可比'],
    cons: ['边缘（尤其高纬两侧）角度变形大，形状失真明显'],
  },
]

export function findProjection(id: string): ProjectionInfo | undefined {
  return PROJECTION_KB.find((p) => p.id === id)
}
