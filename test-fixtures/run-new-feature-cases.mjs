// 新增功能验收：符号库导入合并（transfer.ts）+ 预览独立 SVG（buildStandaloneSvg）
import { DOMParser } from 'linkedom'

// 为 standardize.ts 补齐浏览器全局（Node 无 DOM；linkedom 节点 toString 即序列化）
globalThis.DOMParser = DOMParser
globalThis.XMLSerializer = class {
  serializeToString(node) {
    return node.toString()
  }
}

import { mergeLibraryJson } from './transfer.bundle.mjs'
import { buildStandaloneSvg, PREVIEW_STYLE } from './d3Factory.bundle.mjs'

let pass = 0
const lines = []
function check(name, cond, detail = '') {
  if (cond) pass++
  lines.push(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' → ' + detail : ''}`)
}

const good = {
  id: 'a1', name: '加油站', category: 'point', tags: ['交通'],
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="currentColor"/></svg>',
  source: 'iconify', createdAt: 1,
}
const dup = { ...good }
const badField = { id: 'b2', name: '缺svg', category: 'point', tags: [], source: 'iconify', createdAt: 2 }
const evil = { ...good, id: 'c3', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><script>alert(1)</script></svg>' }
const broken = { ...good, id: 'd4', svg: 'not an svg at all' }

// 1) 正常合并：1 条新增
let r = mergeLibraryJson(JSON.stringify([good]), [])
check('导入 1 条合法记录', r.ok && r.added === 1 && r.skipped === 0 && r.records.length === 1, JSON.stringify({ added: r.added, skipped: r.skipped }))

// 2) 混合包：重复 id + 缺字段 + 带脚本 + 非 SVG → 全跳过，只保留新增的 good 变体
const good2 = { ...good, id: 'e5' }
r = mergeLibraryJson(JSON.stringify([dup, badField, evil, broken, good2]), [{ ...good }])
check(
  '混合包：重复/缺字段/带脚本/非SVG 全跳过，合法新增 1',
  r.ok && r.added === 1 && r.skipped === 4,
  JSON.stringify({ added: r.added, skipped: r.skipped }),
)

// 3) 非法输入
r = mergeLibraryJson('not json', [])
check('非法 JSON 报错', !r.ok && !!r.error)
r = mergeLibraryJson('{"a":1}', [])
check('非数组报错', !r.ok && !!r.error)

// 4) 预览独立 SVG：包装后是自包含合法 SVG
const inner = `<path d="M0 0h10" fill="${PREVIEW_STYLE.grat.fill}" stroke="${PREVIEW_STYLE.grat.stroke}"/>`
const svg = buildStandaloneSvg(inner, 420, 260)
check(
  '独立 SVG 包装',
  svg.startsWith('<?xml') && svg.includes('xmlns="http://www.w3.org/2000/svg"') && svg.includes('width="840"') && svg.includes(inner) && svg.trimEnd().endsWith('</svg>'),
)

console.log(lines.join('\n'))
console.log(`\n${pass}/5 通过`)
process.exit(pass === 5 ? 0 : 1)
