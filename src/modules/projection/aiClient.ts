import type { RecommendRequest, Recommendation } from './types'
import { findProjection, PROJECTION_KB, resolveExtent, REGION_PRESETS } from './presets'
import { PURPOSE_LABELS } from './types'

const TIMEOUT_MS = 15_000

/** AI 代理地址：开发期走 vite 代理（/api）；线上用 VITE_AI_BASE_URL 指向部署好的代理（spec/04 §5/§7） */
const AI_BASE = (import.meta.env.VITE_AI_BASE_URL ?? '/api').replace(/\/+$/, '')

interface AiRecommendationItem {
  id: string
  reason?: string
  params?: { centralMeridian?: number; standardParallels?: number[] }
}

/**
 * 大模型增强推荐 — 对应 spec/02 §4.3。
 * 通过服务端代理（server/ai-proxy.mjs）调用 OpenAI 兼容端点；
 * 任何失败都向上抛出，由调用方降级为规则结果。
 */
export async function recommendByAI(
  req: RecommendRequest,
  ruleCandidates: Recommendation[],
): Promise<Recommendation[]> {
  const regionDesc =
    req.region.kind === 'extent'
      ? `自定义范围：经度 ${req.region.extent.minLon}°~${req.region.extent.maxLon}°，纬度 ${req.region.extent.minLat}°~${req.region.extent.maxLat}°`
      : `预设区域：${REGION_PRESETS.find((p) => p.id === (req.region as { presetId: string }).presetId)?.label ?? '未知'}`

  const messages = [
    {
      role: 'system' as const,
      content:
        '你是地图学助教，熟悉地图投影的分类、变形性质与参数设置。' +
        '只能从给定候选投影 id 中选择或微调参数，不得编造投影。' +
        '严格输出 JSON：{"recommendations":[{"id":"...","reason":"...","params":{"centralMeridian":105,"standardParallels":[25,47]}}]}',
    },
    {
      role: 'user' as const,
      content: JSON.stringify({
        区域: regionDesc,
        用途: PURPOSE_LABELS[req.purpose],
        规则候选: ruleCandidates.map((r) => ({ id: r.projection.id, 理由: r.reason })),
        投影知识库: PROJECTION_KB.map((p) => ({ id: p.id, 名称: p.zhName, 性质: p.property, 适用: p.suitableFor })),
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
    const jsonStart = text.indexOf('{')
    if (jsonStart < 0) throw new Error('AI 响应不含 JSON')
    const parsed = JSON.parse(text.slice(jsonStart)) as { recommendations?: AiRecommendationItem[] }
    if (!Array.isArray(parsed.recommendations)) throw new Error('AI 响应缺少 recommendations')

    // 只接受知识库内的投影 id，规则理由作为兜底补充
    return parsed.recommendations.flatMap((item) => {
      const projection = findProjection(item.id)
      if (!projection) return []
      const merged = item.params ? { ...projection, typicalParams: { ...projection.typicalParams, ...item.params } } : projection
      const ruleReason = ruleCandidates.find((r) => r.projection.id === item.id)?.reason
      return [
        {
          projection: merged,
          reason: item.reason ?? ruleReason ?? '大模型推荐（未附理由）',
          source: 'ai' as const,
        },
      ]
    })
  } finally {
    clearTimeout(timer)
  }
}
