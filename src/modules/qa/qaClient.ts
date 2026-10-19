import { PROJECTION_KB } from '@/modules/projection/presets'
import { CATEGORY_LABELS, PROPERTY_LABELS } from '@/modules/projection/types'

// 与投影推荐同一等待上限（spec/01 NFR-1）
const TIMEOUT_MS = 125_000

/** AI 代理地址：与投影推荐共用同一代理端点（spec/07 §3.2）；可选链保证 node 离线验收脚本可加载本模块 */
const AI_BASE = (import.meta.env?.VITE_AI_BASE_URL ?? '/api').replace(/\/+$/, '')

export interface QaMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT =
  '你是地图学课程的助教，面向本科生回答地图学问题，' +
  '范围包括地图投影、坐标系与大地基准、比例尺、地图符号、制图综合、GIS 基础。' +
  '回答要准确、简洁、有条理，必要时举例；不确定时如实说明，不要编造。'

/**
 * AI 问答 — 对应 spec/07 §3.2。
 * 复用 AI 代理的 /ai/recommend 端点（代理只做 Chat Completions 转发，不区分业务）；
 * 任何失败都向上抛出，由调用方降级为离线知识库回答。
 */
export async function askByAI(history: QaMessage[]): Promise<string> {
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    // 只携带最近 10 条上下文，控制 token 与超时风险（spec/07 §3.2）
    ...history.slice(-10),
  ]

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const resp = await fetch(`${AI_BASE}/ai/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    })
    if (!resp.ok) throw new Error(`AI 代理返回 ${resp.status}`)
    const data = (await resp.json()) as { content?: string }
    const text = data.content?.trim() ?? ''
    if (!text) throw new Error('AI 响应为空')
    return text
  } finally {
    clearTimeout(timer)
  }
}

/** 投影别名 → 知识库 id（离线匹配用；含中英文俗名） */
const PROJECTION_ALIASES: Record<string, string[]> = {
  mercator: ['墨卡托', 'mercator'],
  'transverse-mercator': ['高斯', '克吕格', '横轴墨卡托', 'utm'],
  'lambert-conformal-conic': ['兰伯特等角', 'lambert'],
  'albers-equal-area-conic': ['阿尔伯斯', 'albers'],
  'azimuthal-equidistant': ['方位等距'],
  'polar-stereographic': ['极地立体'],
  'lambert-azimuthal-equal-area': ['方位等积'],
  'equidistant-cylindrical': ['等距圆柱', '方格投影'],
  'gall-peters': ['高尔', '彼得斯', 'peters'],
  robinson: ['罗宾逊', 'robinson'],
  'winkel-tripel': ['温克尔', 'winkel'],
  mollweide: ['摩尔魏特', 'mollweide'],
  sinusoidal: ['正弦曲线', '桑逊', 'sinusoidal'],
  polyconic: ['多圆锥', 'polyconic'],
  orthographic: ['正射'],
  gnomonic: ['球心投影', '日晷', 'gnomonic'],
  'natural-earth': ['自然地球', 'natural earth'],
  'equal-earth': ['等地球', 'equal earth'],
}

/** 高频概念 FAQ（spec/07 §3.3）：全部关键词命中才触发，顺序即优先级 */
const FAQS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['什么是', '投影'],
    answer:
      '地图投影是把地球椭球面上的经纬度坐标按一定数学法则转换到平面的方法。' +
      '由于球面不可展平，任何投影都会带来变形，按保持不变的性质分为等角（正形）、等积、等距与折中（任意）四类。' +
      '选择投影时先看制图区域的纬度位置与形状，再看地图用途对变形性质的要求。',
  },
  {
    keywords: ['等角', '等积'],
    answer:
      '三种变形性质的区别：①等角（正形）投影保持角度与局部形状不变，面积变形大，代表是墨卡托、兰伯特等角圆锥，适合航海航空与气象图；' +
      '②等积投影保持面积比例正确，形状有变形，代表是阿尔伯斯等积圆锥、摩尔魏特、等地球投影，适合统计专题图；' +
      '③等距投影沿特定方向（如自投影中心）保持距离正确，代表是方位等距、等距圆柱。' +
      '一个投影不能同时等角又等积，折中投影（罗宾逊、温克尔三重）各类变形都不严格但视觉均衡，适合挂图。',
  },
  {
    keywords: ['中国', '投影'],
    answer:
      '中国全图（统计/参考图）惯例用阿尔伯斯等积圆锥投影：双标准纬线 25°N / 47°N、中央经线 105°E；' +
      '大比例尺地形图用高斯-克吕格投影（横轴等角圆柱），按 6° 或 3° 分带；' +
      '世界地图中的我国出版图件常用等差分纬线多圆锥投影。本站的「地图投影推荐」页选「中国全图」即可一键得到这些参数。',
  },
  {
    keywords: ['格陵兰'],
    answer:
      '这是墨卡托投影的高纬面积夸大效应：墨卡托是等角圆柱投影，纬度越高面积放大越严重（放大倍数随 1/cos²φ 增长）。' +
      '格陵兰（约 216 万 km²）在高纬度被显著放大，视觉上接近非洲（约 3020 万 km²，实际约为其 14 倍）。' +
      '需要做面积对比的世界地图应改用等积投影，如高尔-彼得斯、摩尔魏特或等地球投影。',
  },
  {
    keywords: ['变形椭圆'],
    answer:
      'Tissot 变形椭圆（底索指示线）：在球面上各点画等半径小圆，投影后变成椭圆——椭圆越扁说明角度/形状变形越大，' +
      '面积与圆不等说明面积有变形；若处处仍是等大的圆则该投影等角，若面积处处相等则该投影等积。' +
      '本站推荐结果预览中的橙色小圆就是 Tissot 椭圆，可直观比较方案 A/B 的变形分布。',
  },
  {
    keywords: ['分带'],
    answer:
      '高斯-克吕格投影（横轴等角圆柱）为控制东西向变形按经度分带：6° 带用于 1:2.5万~1:50万 地形图，' +
      '带号 = ⌊经度/6⌋+1，中央经线 = 带号×6−3；3° 带用于 1:1万 及更大比例尺。' +
      '每带独立建坐标系，横坐标加 500km 假东避免负值，CGCS2000 下 6° 带对应 EPSG:4491–4501。',
  },
  {
    keywords: ['比例尺'],
    answer:
      '比例尺 = 图上距离 / 实地距离。1:1万 属于大比例尺（内容详细），1:100万 为小比例尺（内容概略）。' +
      '比例尺决定地图内容的详细程度与制图综合的程度；注意投影主比例尺只在无变形的点/线上成立，' +
      '其他地方存在局部比例尺变化（即变形），量算时要选变形性质合适的投影。',
  },
  {
    keywords: ['坐标'],
    answer:
      '常见概念分层：①大地基准（Datum）定义椭球与定位，如 WGS84、我国 CGCS2000；' +
      '②地理坐标系用经纬度表示位置（EPSG:4326 是 WGS84 经纬度）；' +
      '③投影坐标系把经纬度投影为平面直角坐标（米），如 Web 墨卡托 EPSG:3857、高斯-克吕格分带系列。' +
      '叠加数据前务必统一坐标系，导出参数可用本站推荐页的 PROJ4 / WKT 一键复制。',
  },
]

/**
 * 离线知识库回答 — 对应 spec/07 §3.3（AI 不可用时的保底通道，结果必须如实标注来源）。
 */
export function answerLocally(question: string): string {
  const q = question.toLowerCase()

  // 1) 投影条目别名匹配
  for (const [id, aliases] of Object.entries(PROJECTION_ALIASES)) {
    if (!aliases.some((a) => q.includes(a.toLowerCase()))) continue
    const p = PROJECTION_KB.find((k) => k.id === id)
    if (!p) continue
    return (
      `${p.zhName}（${p.name}）——${CATEGORY_LABELS[p.category]} · ${PROPERTY_LABELS[p.property]}。\n` +
      `适用场景：${p.suitableFor}。\n` +
      `优点：${p.pros.join('；')}。\n` +
      `局限：${p.cons.join('；')}。\n` +
      '（更多可视化效果见「地图投影推荐」页底部的 18 幅投影总览）'
    )
  }

  // 2) FAQ：关键词全部命中
  for (const faq of FAQS) {
    if (faq.keywords.every((k) => q.includes(k.toLowerCase()))) return faq.answer
  }

  // 3) 兜底：说明覆盖范围（spec/07 §3.3）
  return (
    '离线知识库暂未覆盖这个问题。我目前可以离线回答：18 种常用地图投影的特点与适用场景（试试问「墨卡托适合做什么」）、' +
    '地图投影的定义、等角/等积/等距的区别、中国全图投影惯例、Tissot 变形椭圆、高斯分带、比例尺与坐标系基础。' +
    '配置 AI 代理（本地 npm run server，或部署后设置 VITE_AI_BASE_URL）即可向我提问任意地图学问题。'
  )
}
