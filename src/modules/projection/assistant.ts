import type { RegionExtent } from '@/modules/projection/types'
import { PROJECTION_KB, REGION_PRESETS, findProjection } from '@/modules/projection/presets'

// 与问答/推荐同一等待上限（spec/01 NFR-1）
const TIMEOUT_MS = 125_000
/** AI 代理地址：与其他 AI 功能共用；可选链保证 node 离线验收脚本可加载本模块 */
const AI_BASE = (import.meta.env?.VITE_AI_BASE_URL ?? '/api').replace(/\/+$/, '')

/** 投影实验台状态（spec/08 §3） */
export interface LabState {
  regionMode: 'preset' | 'extent'
  presetId: string
  extent: RegionExtent
  projA: string
  projB: string | null
  overlays: { graticule: boolean; tissot: boolean; land: boolean; marker: boolean }
  marker: [number, number] | null
}

export type LabAction =
  | { type: 'setRegion'; presetId?: string; extent?: RegionExtent }
  | { type: 'setProjections'; a?: string; b?: string | null }
  | { type: 'setOverlays'; graticule?: boolean; tissot?: boolean; land?: boolean; marker?: boolean }
  | { type: 'setMarker'; lon: number; lat: number }
  | { type: 'reset' }

export interface AssistantReply {
  reply: string
  actions: LabAction[]
  source: 'ai' | 'local'
}

export function defaultLabState(): LabState {
  return {
    regionMode: 'preset',
    presetId: 'china',
    extent: { minLon: 73.5, minLat: 3.8, maxLon: 135.1, maxLat: 53.6 },
    projA: 'albers-equal-area-conic',
    projB: 'mercator',
    overlays: { graticule: true, tissot: true, land: true, marker: false },
    marker: null,
  }
}

export function resolveLabExtent(s: LabState): RegionExtent {
  return s.regionMode === 'preset'
    ? (REGION_PRESETS.find((p) => p.id === s.presetId)?.extent ?? s.extent)
    : s.extent
}

/** 应用动作（返回新状态，非法动作丢弃；spec/08 §4.1） */
export function applyActions(state: LabState, actions: LabAction[]): LabState {
  const next: LabState = {
    ...state,
    extent: { ...state.extent },
    overlays: { ...state.overlays },
  }
  for (const a of actions) {
    switch (a.type) {
      case 'reset':
        return defaultLabState()
      case 'setRegion':
        if (a.presetId && REGION_PRESETS.some((p) => p.id === a.presetId)) {
          next.regionMode = 'preset'
          next.presetId = a.presetId
        } else if (a.extent) {
          const e = a.extent
          const nums = [e.minLon, e.minLat, e.maxLon, e.maxLat]
          if (nums.every((n) => Number.isFinite(n)) && e.minLon < e.maxLon && e.minLat < e.maxLat) {
            next.regionMode = 'extent'
            next.extent = {
              minLon: Math.max(-180, e.minLon),
              maxLon: Math.min(180, e.maxLon),
              minLat: Math.max(-90, e.minLat),
              maxLat: Math.min(90, e.maxLat),
            }
          }
        }
        break
      case 'setProjections':
        if (a.a && findProjection(a.a)) next.projA = a.a
        if (a.b === null) next.projB = null
        else if (a.b && findProjection(a.b) && a.b !== next.projA) next.projB = a.b
        break
      case 'setOverlays':
        for (const k of ['graticule', 'tissot', 'land', 'marker'] as const) {
          if (typeof a[k] === 'boolean') next.overlays[k] = a[k] as boolean
        }
        break
      case 'setMarker': {
        const lon = Number(a.lon)
        const lat = Number(a.lat)
        if (Number.isFinite(lon) && Number.isFinite(lat) && Math.abs(lon) <= 180 && Math.abs(lat) <= 90) {
          next.marker = [lon, lat]
          next.overlays.marker = true
        }
        break
      }
    }
  }
  return next
}

/** 变化摘要（已应用卡片逐条展示；spec/08 §2） */
export function summarizeChange(before: LabState, after: LabState): string[] {
  const lines: string[] = []
  const regionBefore = before.regionMode === 'preset' ? before.presetId : JSON.stringify(before.extent)
  const regionAfter = after.regionMode === 'preset' ? after.presetId : JSON.stringify(after.extent)
  if (regionBefore !== regionAfter) {
    lines.push(`区域：${regionLabel(after)}`)
  }
  if (before.projA !== after.projA || before.projB !== after.projB) {
    const a = findProjection(after.projA)?.zhName ?? after.projA
    const b = after.projB ? (findProjection(after.projB)?.zhName ?? after.projB) : '单幅'
    lines.push(`对比：${a} / ${b}`)
  }
  const layerNames: Record<keyof LabState['overlays'], string> = {
    graticule: '经纬网',
    tissot: '变形椭圆',
    land: '陆地',
    marker: '坐标标记',
  }
  const changedLayers = (Object.keys(layerNames) as (keyof LabState['overlays'])[]).filter(
    (k) => before.overlays[k] !== after.overlays[k],
  )
  if (changedLayers.length) {
    lines.push(`图层：${changedLayers.map((k) => `${layerNames[k]}${after.overlays[k] ? '开' : '关'}`).join('、')}`)
  }
  if (JSON.stringify(before.marker) !== JSON.stringify(after.marker) && after.marker) {
    lines.push(`标记点：${fmtCoord(after.marker[0], 'E', 'W')}，${fmtCoord(after.marker[1], 'N', 'S')}`)
  }
  return lines
}

export function regionLabel(s: LabState): string {
  if (s.regionMode === 'preset') return REGION_PRESETS.find((p) => p.id === s.presetId)?.label ?? s.presetId
  const e = s.extent
  return `自定义 ${fmtCoord(e.minLon, 'E', 'W')}~${fmtCoord(e.maxLon, 'E', 'W')}，${fmtCoord(e.minLat, 'N', 'S')}~${fmtCoord(e.maxLat, 'N', 'S')}`
}

function fmtCoord(v: number, pos: string, neg: string): string {
  return `${Math.abs(Math.round(v * 10) / 10)}°${v >= 0 ? pos : neg}`
}

// ─── 别名表（离线解析用） ───
const ALIASES: [string, string[]][] = [
  ['mercator', ['墨卡托', 'mercator']],
  ['transverse-mercator', ['高斯', '克吕格', '横轴墨卡托']],
  ['lambert-conformal-conic', ['兰伯特等角']],
  ['albers-equal-area-conic', ['阿尔伯斯', 'albers']],
  ['azimuthal-equidistant', ['方位等距']],
  ['polar-stereographic', ['极地立体']],
  ['lambert-azimuthal-equal-area', ['方位等积']],
  ['equidistant-cylindrical', ['等距圆柱']],
  ['gall-peters', ['高尔', '彼得斯']],
  ['robinson', ['罗宾逊', 'robinson']],
  ['winkel-tripel', ['温克尔', 'winkel']],
  ['mollweide', ['摩尔魏特', 'mollweide']],
  ['sinusoidal', ['正弦曲线', '桑逊']],
  ['polyconic', ['多圆锥']],
  ['orthographic', ['正射']],
  ['gnomonic', ['球心', '日晷']],
  ['natural-earth', ['自然地球']],
  ['equal-earth', ['等地球', 'equal earth']],
]

const REGION_WORDS: [string, string[]][] = [
  ['world', ['全球', '世界']],
  ['china', ['中国']],
  ['beijing', ['北京']],
  ['qinghai-tibet', ['青藏']],
  ['europe', ['欧洲']],
  ['chile', ['智利']],
  ['arctic', ['北极']],
  ['antarctic', ['南极']],
]

const CITIES: [string, [number, number]][] = [
  ['郑州', [113.6254, 34.7466]],
  ['北京', [116.4074, 39.9042]],
  ['上海', [121.4737, 31.2304]],
  ['广州', [113.2644, 23.1291]],
  ['成都', [104.0665, 30.5723]],
  ['西安', [108.9398, 34.3416]],
  ['拉萨', [91.1409, 29.6456]],
  ['乌鲁木齐', [87.6168, 43.8256]],
  ['哈尔滨', [126.6425, 45.7569]],
  ['武汉', [114.3055, 30.5928]],
]

const NEGATIVE = ['关闭', '关掉', '隐藏', '取消', '不要']

/**
 * 离线中文指令解析（spec/08 §4.2）：命中即产生动作；未命中返回引导语且不动状态。
 */
export function parseLocally(question: string): AssistantReply {
  const q = question.toLowerCase()
  const actions: LabAction[] = []
  const notes: string[] = []

  // 重置
  if (/重置|复位|恢复默认/.test(q)) {
    return { reply: '已恢复投影实验台的默认设置（中国全图 · 阿尔伯斯 / 墨卡托）。', actions: [{ type: 'reset' }], source: 'local' }
  }

  // 投影（按出现顺序去重）
  const projHits: string[] = []
  for (const [id, words] of ALIASES) {
    if (words.some((w) => q.includes(w)) && !projHits.includes(id)) projHits.push(id)
  }
  const wantsCompare = /比较|对比|相比|对照/.test(q)
  if (projHits.length >= 2 && wantsCompare) {
    actions.push({ type: 'setProjections', a: projHits[0], b: projHits[1] })
    notes.push(`切换为「${zh(projHits[0])}」与「${zh(projHits[1])}」对比`)
  } else if (projHits.length === 1) {
    if (wantsCompare) {
      const b = projHits[0] === 'mercator' ? 'equal-earth' : 'mercator'
      actions.push({ type: 'setProjections', a: projHits[0], b })
      notes.push(`以「${zh(projHits[0])}」与「${zh(b)}」对比`)
    } else {
      actions.push({ type: 'setProjections', a: projHits[0] })
      notes.push(`主投影切换为「${zh(projHits[0])}」`)
    }
  } else if (wantsCompare && /两种|两个|投影/.test(q)) {
    actions.push({ type: 'setProjections', a: 'mercator', b: 'equal-earth' })
    notes.push('用墨卡托与等地球投影做对比')
  }

  // 区域
  for (const [id, words] of REGION_WORDS) {
    if (words.some((w) => q.includes(w))) {
      actions.push({ type: 'setRegion', presetId: id })
      notes.push(`区域切到「${REGION_PRESETS.find((p) => p.id === id)?.label ?? id}」`)
      break
    }
  }

  // 图层开关（分句判断正负）
  const clauses = q.split(/[，,。;；]/)
  const layerWords: [keyof LabState['overlays'], string[]][] = [
    ['tissot', ['变形', '椭圆', 'tissot']],
    ['graticule', ['经纬网', '网格']],
    ['land', ['陆地', '海岸线']],
    ['marker', ['标记', '位置', '中心点', '圆点']],
  ]
  for (const [key, words] of layerWords) {
    for (const c of clauses) {
      if (!words.some((w) => c.includes(w))) continue
      const off = NEGATIVE.some((n) => c.includes(n))
      actions.push({ type: 'setOverlays', [key]: !off } as LabAction)
      notes.push(`${key === 'tissot' ? '变形椭圆' : key === 'graticule' ? '经纬网' : key === 'land' ? '陆地' : '坐标标记'}${off ? '关闭' : '打开'}`)
      break
    }
  }

  // 标记点：城市优先，其次坐标
  let marker: [number, number] | null = null
  for (const [name, coord] of CITIES) {
    if (q.includes(name)) {
      marker = coord
      break
    }
  }
  if (!marker) {
    const m = q.match(/(\d+(?:\.\d+)?)\s*°?\s*[eE东][,，\s]*(\d+(?:\.\d+)?)\s*°?\s*[nN北]/)
    if (m) marker = [Number(m[1]), Number(m[2])]
  }
  if (marker) {
    actions.push({ type: 'setMarker', lon: marker[0], lat: marker[1] })
    notes.push(`在 ${fmtCoord(marker[0], 'E', 'W')}，${fmtCoord(marker[1], 'N', 'S')} 打标记`)
  }

  if (!actions.length) {
    return {
      reply:
        '我可以帮你操作这个投影实验台，例如：「切换到全球，比较墨卡托和等地球，打开变形椭圆」「中国全图用阿尔伯斯」「郑州为中心打开标记」「打开经纬网」。请换一种说法试试。',
      actions: [],
      source: 'local',
    }
  }
  return { reply: `已${notes.join('；')}。`, actions, source: 'local' }
}

function zh(id: string): string {
  return findProjection(id)?.zhName ?? id
}

// ─── AI 通道 ───
const SYSTEM_PROMPT =
  '你是地图投影教学助手，负责把学生的自然语言指令转换成投影实验设置。' +
  '只能输出 JSON，不要输出任何其他文字。格式：' +
  '{"reply":"简要说明你做了什么","actions":[...]}。' +
  '可用动作：' +
  '{"type":"setRegion","presetId":"world|china|beijing|qinghai-tibet|europe|chile|arctic|antarctic"} 或 {"type":"setRegion","extent":{"minLon":-180,"minLat":-90,"maxLon":180,"maxLat":90}}；' +
  '{"type":"setProjections","a":"投影id","b":"投影id或null"}；' +
  '{"type":"setOverlays","graticule":true,"tissot":true,"land":true,"marker":true}（只写要改的键）；' +
  '{"type":"setMarker","lon":113.6,"lat":34.7}；{"type":"reset"}。' +
  '投影 id 只能从以下列表选择：' +
  PROJECTION_KB.map((p) => `${p.id}（${p.zhName}）`).join('、') +
  '。用户说「距离」但目前只能标注位置，不能量算。'

interface AiPayload {
  reply?: string
  actions?: unknown
}

/** AI 解析（spec/08 §4.1）；任何失败向上抛出，由调用方降级 */
export async function askAssistant(question: string, state: LabState): Promise<AssistantReply> {
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    {
      role: 'user' as const,
      content: JSON.stringify({
        指令: question,
        当前状态: {
          区域: state.regionMode === 'preset' ? state.presetId : state.extent,
          投影A: state.projA,
          投影B: state.projB,
          图层: state.overlays,
          标记点: state.marker,
        },
      }),
    },
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
    const start = text.indexOf('{')
    if (start < 0) throw new Error('AI 响应不含 JSON')
    const parsed = rawParse(text.slice(start)) as AiPayload
    const actions = sanitizeActions(parsed.actions)
    if (!actions.length) throw new Error('AI 未给出可执行动作')
    return {
      reply: parsed.reply ?? '已按你的要求调整实验设置。',
      actions,
      source: 'ai',
    }
  } finally {
    clearTimeout(timer)
  }
}

/** 容错解析：截到最后一个平衡的 }，应对模型偶发尾随文字 */
function rawParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    const end = text.lastIndexOf('}')
    if (end > 0) return JSON.parse(text.slice(0, end + 1))
    throw new Error('JSON 解析失败')
  }
}

function sanitizeActions(input: unknown): LabAction[] {
  if (!Array.isArray(input)) return []
  const out: LabAction[] = []
  for (const item of input) {
    if (!item || typeof item !== 'object') continue
    const a = item as Record<string, unknown>
    switch (a.type) {
      case 'setRegion':
        if (typeof a.presetId === 'string' && REGION_PRESETS.some((p) => p.id === a.presetId)) {
          out.push({ type: 'setRegion', presetId: a.presetId })
        } else if (a.extent && typeof a.extent === 'object') {
          const e = a.extent as RegionExtent
          out.push({ type: 'setRegion', extent: e })
        }
        break
      case 'setProjections': {
        const okA = typeof a.a === 'string' && !!findProjection(a.a)
        const okB = a.b === null || (typeof a.b === 'string' && !!findProjection(a.b))
        if (okA || okB) {
          out.push({
            type: 'setProjections',
            a: okA ? (a.a as string) : undefined,
            b: a.b === null ? null : okB ? (a.b as string) : undefined,
          })
        }
        break
      }
      case 'setOverlays': {
        const patch: Record<string, boolean> = {}
        for (const k of ['graticule', 'tissot', 'land', 'marker']) {
          if (typeof a[k] === 'boolean') patch[k] = a[k] as boolean
        }
        if (Object.keys(patch).length) out.push({ type: 'setOverlays', ...patch })
        break
      }
      case 'setMarker':
        if (typeof a.lon === 'number' && typeof a.lat === 'number') {
          out.push({ type: 'setMarker', lon: a.lon, lat: a.lat })
        }
        break
      case 'reset':
        out.push({ type: 'reset' })
        break
    }
  }
  return out
}
