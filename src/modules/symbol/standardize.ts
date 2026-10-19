/**
 * SVG 规范化校验 — 对应 spec/03 §3 步骤④。
 * 错误级问题禁止入库；警告级问题提示学生回 Illustrator 修正。
 */

export type IssueLevel = 'error' | 'warning' | 'info'

export interface SvgIssue {
  level: IssueLevel
  message: string
}

export interface SvgCheckResult {
  ok: boolean
  issues: SvgIssue[]
  /** 自动修正（如补 viewBox）后的 SVG 文本；解析失败时为 undefined */
  normalized?: string
}

const FORBIDDEN_TAGS = ['script', 'foreignObject']

export function checkAndNormalizeSvg(svgText: string): SvgCheckResult {
  const issues: SvgIssue[] = []
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const root = doc.documentElement
  // root 为 null = 内容连元素都没有（如纯文本）；parsererror = 浏览器解析出错的标记节点
  if (!root || doc.querySelector('parsererror')) {
    return { ok: false, issues: [{ level: 'error', message: 'SVG 无法解析，请确认文件完整且为矢量 SVG（非位图改名）' }] }
  }
  if (root.tagName.toLowerCase() !== 'svg') {
    return { ok: false, issues: [{ level: 'error', message: '根元素不是 <svg>' }] }
  }

  for (const tag of FORBIDDEN_TAGS) {
    if (doc.getElementsByTagName(tag).length > 0) {
      issues.push({ level: 'error', message: `包含禁止元素 <${tag}>，存在安全风险，请移除后重新导出` })
    }
  }

  // 外部引用：http(s) 的 image / use href / @import
  const all = Array.from(doc.querySelectorAll('*'))
  const hasExternalRef = all.some((el) =>
    ['href', 'xlink:href'].some((attr) => /^https?:\/\//.test(el.getAttribute(attr) ?? '')),
  )
  if (hasExternalRef) {
    issues.push({ level: 'error', message: '包含外部资源引用（http/https 链接的图片或引用），符号必须离线可用' })
  }

  if (doc.getElementsByTagName('text').length > 0) {
    issues.push({ level: 'warning', message: '包含未转曲文字 <text>，请回 Illustrator 执行「文字 → 创建轮廓」' })
  }

  // viewBox：缺失时尝试用数值型 width/height 补全
  if (!root.getAttribute('viewBox')) {
    const w = parseFloat(root.getAttribute('width') ?? '')
    const h = parseFloat(root.getAttribute('height') ?? '')
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      root.setAttribute('viewBox', `0 0 ${w} ${h}`)
      issues.push({ level: 'warning', message: `缺少 viewBox，已按 width/height 自动补全为 0 0 ${w} ${h}` })
    } else {
      issues.push({ level: 'error', message: '缺少 viewBox 且无法从 width/height 推导，缩放将失真' })
    }
  }

  // 尺寸检查（spec/03 §3 步骤④）：viewBox 非正方形给出警告
  const vb = (root.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number)
  if (vb.length === 4 && vb.every(Number.isFinite) && vb[2] !== vb[3]) {
    issues.push({
      level: 'warning',
      message: `画板非正方形（${vb[2]}×${vb[3]}），建议 64×64 基准正方形画板`,
    })
  }

  // 线条检查：多种 stroke-width 或过细线宽
  const strokeWidths = new Set(
    all
      .map((el) => parseFloat(el.getAttribute('stroke-width') ?? ''))
      .filter((v) => Number.isFinite(v) && v > 0),
  )
  if (strokeWidths.size >= 2) {
    issues.push({
      level: 'warning',
      message: `检测到多种线宽（${[...strokeWidths].sort((a, b) => a - b).join('px、')}px），同组符号线宽应统一（建议 2~4px）`,
    })
  }
  const minStroke = Math.min(...strokeWidths)
  if (strokeWidths.size > 0 && minStroke < 0.5) {
    issues.push({ level: 'warning', message: `存在过细线条（${minStroke}px），缩放后将不清晰` })
  }

  // 配色检查：填充色超过 3 种
  const fills = new Set(
    all
      .map((el) => el.getAttribute('fill'))
      .filter((v): v is string => !!v && v !== 'none' && v !== 'currentColor'),
  )
  if (fills.size > 3) {
    issues.push({
      level: 'warning',
      message: `填充色共 ${fills.size} 种（${[...fills].slice(0, 4).join('、')}…），地图符号用色应克制（≤3 种）`,
    })
  }

  // 单色 / currentColor 建议
  if (!all.some((el) => el.getAttribute('fill') === 'currentColor') && fills.size > 1) {
    issues.push({ level: 'info', message: '建议单体符号使用单色并改为 currentColor，便于配图时整体换色' })
  }

  const serialized = new XMLSerializer().serializeToString(doc)
  if (new Blob([serialized]).size > 512 * 1024) {
    issues.push({ level: 'warning', message: '文件超过 512KB，建议回 Illustrator 精简锚点后重新导出' })
  }

  return { ok: !issues.some((i) => i.level === 'error'), issues, normalized: serialized }
}
