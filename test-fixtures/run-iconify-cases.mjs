// Iconify 模块验收 — 对应 spec/05 §6（模块级验证，含真实网络调用）
import { toQuery, searchIcons, fetchIconSvg, iconSvgUrl, iconfontSearchUrl } from './iconify.bundle.mjs'

let pass = 0
const results = []

async function check(name, fn) {
  try {
    const detail = await fn()
    pass++
    results.push(`PASS ${name}${detail ? ` → ${detail}` : ''}`)
  } catch (e) {
    results.push(`FAIL ${name} → ${e.message}`)
  }
}

await check('用例1 词库转换：加油站 → gas station', async () => {
  const r = toQuery('我需要一个加油站的点状符号')
  if (r.query !== 'gas station' || !r.translated) throw new Error(JSON.stringify(r))
  return 'gas station'
})

await check('词库兜底：未命中词原样返回', async () => {
  const r = toQuery('观星台')
  if (r.translated || r.query !== '观星台') throw new Error(JSON.stringify(r))
  return '观星台（未翻译）'
})

await check('用例1 搜索返回图标列表', async () => {
  const icons = await searchIcons('gas station', 10)
  if (!Array.isArray(icons) || icons.length === 0) throw new Error('空结果')
  if (!icons.some((i) => i.includes('gas-station'))) throw new Error('结果不含 gas-station: ' + icons.slice(0, 3).join(','))
  return `${icons.length} 个结果，如 ${icons[0]}`
})

await check('用例3 SVG 下载可用于校验', async () => {
  const svg = await fetchIconSvg('mdi:gas-station')
  if (!svg.includes('<svg') || !svg.includes('viewBox')) throw new Error('SVG 不完整')
  return `${svg.length} 字符`
})

await check('工具函数：URL 拼装', async () => {
  if (iconSvgUrl('tabler:park') !== 'https://api.iconify.design/tabler/park.svg') throw new Error('iconSvgUrl 错误')
  if (!iconfontSearchUrl('加油站').includes(encodeURIComponent('加油站'))) throw new Error('iconfontSearchUrl 错误')
})

console.log(results.join('\n'))
console.log(`\n${pass}/5 通过`)
