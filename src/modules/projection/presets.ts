import type { ChinaFit, ProjectionInfo, RegionExtent } from './types'

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
    refImage: {
      url: './ref-images/mercator.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons',
    },
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
    refImage: {
      url: './ref-images/transverse-mercator.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons（横轴墨卡托世界全图）',
    },
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
    refImage: {
      url: './ref-images/lambert-conformal-conic.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons',
    },
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
    refImage: {
      url: './ref-images/albers-equal-area-conic.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons',
    },
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
    refImage: {
      url: './ref-images/azimuthal-equidistant.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons',
    },
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
    refImage: {
      url: './ref-images/polar-stereographic.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons',
    },
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
    refImage: {
      url: './ref-images/lambert-azimuthal-equal-area.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons',
    },
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
    refImage: {
      url: './ref-images/equidistant-cylindrical.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons',
    },
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
    refImage: {
      url: './ref-images/gall-peters.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons',
    },
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
    refImage: {
      url: './ref-images/robinson.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons',
    },
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
    refImage: {
      // Commons 文件名用英式拼写 "Winkel triple projection SW.jpg"
      url: './ref-images/winkel-tripel.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons',
    },
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
    refImage: {
      url: './ref-images/mollweide.jpg',
      credit: 'Strebe, CC BY-SA 3.0, Wikimedia Commons',
    },
  },
  // —— 以下为 spec/07 §2.1 扩充条目：服务 18 幅总览与 AI 候选，规则引擎不新增规则 ——
  {
    id: 'sinusoidal',
    name: 'Sinusoidal (Sanson-Flamsteed)',
    zhName: '正弦曲线投影（桑逊）',
    category: 'pseudocylindrical',
    property: 'equal-area',
    suitableFor: '低纬度及世界范围的等积分布图；经线为正弦曲线的典型教学案例',
    pros: ['全球等积，赤道与中央经线上无变形，低纬地区形状保持较好'],
    cons: ['高纬与图幅边缘剪切变形明显，经线交角失真大'],
    epsgHint: 'ESRI:54008（World Sinusoidal）；PROJ：+proj=sinu',
  },
  {
    id: 'polyconic',
    name: 'Polyconic',
    zhName: '多圆锥投影',
    category: 'conic',
    property: 'compromise',
    suitableFor: '沿中央经线南北延展的中纬度区域图；曾用于国际 1:100 万分幅地图（旧方案）',
    pros: ['各纬线均与圆锥相切，中央经线附近变形小，历史上用于地形图分幅'],
    cons: ['既不等角也不等积，离中央经线越远变形越大，已被兰伯特等角圆锥等取代'],
    epsgHint: 'EPSG 方法 9818（American Polyconic）；PROJ：+proj=poly',
  },
  {
    id: 'orthographic',
    name: 'Orthographic',
    zhName: '正射方位投影',
    category: 'azimuthal',
    property: 'compromise',
    suitableFor: '半球图与「从太空看地球」的球体外貌教学演示',
    pros: ['透视感强，直观呈现球体外貌，适合导入地球圆球概念'],
    cons: ['只能显示一个半球，边缘压缩严重，既不等角也不等积'],
    epsgHint: '无常用 EPSG 编号；PROJ：+proj=ortho',
  },
  {
    id: 'gnomonic',
    name: 'Gnomonic',
    zhName: '球心投影（日晷投影）',
    category: 'azimuthal',
    property: 'compromise',
    suitableFor: '大圆航线规划：大圆（最短航线）在图上恒为直线，配合墨卡托图转绘航点',
    pros: ['大圆弧投影为直线，是求最短航线唯一方便的投影'],
    cons: ['只能显示小于半球的范围，远离中心变形急剧增大，无等角等积性质'],
    epsgHint: '无常用 EPSG 编号；PROJ：+proj=gnom',
  },
  {
    id: 'natural-earth',
    name: 'Natural Earth',
    zhName: '自然地球投影',
    category: 'pseudocylindrical',
    property: 'compromise',
    suitableFor: '世界小比例尺参考图与挂图（Natural Earth 数据集配套投影）',
    pros: ['折中变形且外形圆润自然，专为小比例尺世界地图设计'],
    cons: ['无严格几何性质，面积与角度均不可直接量算'],
    epsgHint: '无常用 EPSG 编号；PROJ：+proj=natearth',
  },
  {
    id: 'equal-earth',
    name: 'Equal Earth',
    zhName: '等地球投影',
    category: 'pseudocylindrical',
    property: 'equal-area',
    suitableFor: '世界范围统计专题图（2018 年提出的现代等积投影，NASA 等机构采用）',
    pros: ['全球等积且外形美观、极点成线，是世界专题图的现代优选'],
    cons: ['角度变形存在；提出时间较新，部分旧版软件不支持'],
    epsgHint: 'ESRI:54035（World Equal Earth）；PROJ：+proj=eqearth',
  },
]

/**
 * 中国全图适用性标注（spec/09 §2.4）：用于总览「中国地图投影」模块的徽标与原因说明。
 * 口径 = 整幅中国全图（73.5°E~135.1°E / 3.8°N~53.6°N，含南海诸岛）成图；
 * 分带大比例尺地形图（高斯-克吕格）按「有条件适合」处理。
 */
export const CHINA_SUITABILITY: Record<string, ChinaFit> = {
  mercator: {
    level: 'unsuitable',
    reason: '等角圆柱投影高纬面积急剧放大，中国南北跨约 50° 纬度，北部面积失真显著，中国全图不采用',
  },
  'transverse-mercator': {
    level: 'conditional',
    reason: '分带投影：单带内变形极小，但整幅中国东西跨约 60° 经度，离中央经线越远变形越大——只用于 6°/3° 分带的大比例尺地形图，不适合整幅中国全图',
  },
  'lambert-conformal-conic': {
    level: 'fit',
    reason: '我国 1:100 万地形图与气象图的常用投影，等角保形，中纬东西延展的中国轮廓与之匹配',
  },
  'albers-equal-area-conic': {
    level: 'fit',
    reason: '中国全图惯例投影（105°E，双标准纬线 25°N/47°N）：面积严格相等，统计专题图首选',
  },
  'azimuthal-equidistant': {
    level: 'unsuitable',
    reason: '方位投影适合圆形区域（极地、半球）；中国轮廓东西南北跨度大，边缘变形随中心距增大，中国全图不采用',
  },
  'polar-stereographic': {
    level: 'unsuitable',
    reason: '极地投影以极点为中心，中国位于中低纬，只能被压在图像边缘且变形极大，无法用于中国制图',
  },
  'lambert-azimuthal-equal-area': {
    level: 'unsuitable',
    reason: '适合大洲与极地等积专题；中国为非圆形区域，边缘角度变形大，不属于中国制图惯例',
  },
  'equidistant-cylindrical': {
    level: 'unsuitable',
    reason: '经纬网为方格、无等角等积性质，仅作教学演示，中国地图不采用',
  },
  'gall-peters': {
    level: 'unsuitable',
    reason: '等积但低纬形状强烈拉伸、视觉失真大，中国图不使用',
  },
  robinson: {
    level: 'unsuitable',
    reason: '为世界全图设计的折中投影，区域制图非其用途；中国全图有更合适的圆锥投影',
  },
  'winkel-tripel': {
    level: 'unsuitable',
    reason: '世界全图折中投影（全球挂图常用），中国区域制图不采用',
  },
  mollweide: {
    level: 'unsuitable',
    reason: '全球等积伪圆柱投影，高纬与图幅边缘形状失真大，中国全图不采用',
  },
  sinusoidal: {
    level: 'unsuitable',
    reason: '低纬无变形、高纬剪切失真大，中国中高纬区域不适用',
  },
  polyconic: {
    level: 'conditional',
    reason: '国际 1:100 万地图的旧方案（改良多圆锥）：中央经线附近变形小、两侧增大；我国已改用兰伯特等角圆锥，仅作历史参考',
  },
  orthographic: {
    level: 'unsuitable',
    reason: '正射投影只显示半个地球、边缘强烈压缩，用于「从太空看地球」演示，不能作中国全图',
  },
  gnomonic: {
    level: 'unsuitable',
    reason: '球心投影只能显示小于半球的范围，远离中心变形急剧增大，用于大圆航线图，不能作中国全图',
  },
  'natural-earth': {
    level: 'unsuitable',
    reason: '为小比例尺世界地图设计，全球变形均衡，中国区域制图不采用',
  },
  'equal-earth': {
    level: 'unsuitable',
    reason: '全球等积设计（2018 年提出），用于世界专题图，中国区域不采用',
  },
}

export function findProjection(id: string): ProjectionInfo | undefined {
  return PROJECTION_KB.find((p) => p.id === id)
}
