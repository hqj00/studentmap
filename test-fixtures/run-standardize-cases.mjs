// SVG 规范化校验验收脚本 — 对应 spec/03 §7 用例1-2（模块级验证，linkedom 提供 DOM）
import { readFileSync } from 'node:fs'
import { DOMParser } from 'linkedom'

// 为被测模块补齐浏览器全局（Node 环境无 DOM；linkedom 节点 toString 即序列化结果）
globalThis.DOMParser = DOMParser
globalThis.XMLSerializer = class {
  serializeToString(node) {
    return node.toString()
  }
}

const { checkAndNormalizeSvg } = await import('./standardize.bundle.mjs')

const cases = [
  { name: '用例1 含<script>的SVG 必须拒绝', file: 'malicious-symbol.svg', expectOk: false, expectLevel: 'error' },
  { name: '用例2 无viewBox 自动补全并可入库', file: 'no-viewbox-symbol.svg', expectOk: true, expectViewBox: true },
  { name: '附加 合法SVG 通过校验', file: 'valid-symbol.svg', expectOk: true },
  { name: '尺寸检查：非正方形画板 → 警告', file: 'nonsquare-symbol.svg', expectOk: true, expectText: '非正方形' },
  { name: '线条检查：线宽不统一 → 警告', file: 'mixed-stroke-symbol.svg', expectOk: true, expectText: '多种线宽' },
  { name: '线条检查：过细线条 → 警告', file: 'mixed-stroke-symbol.svg', expectOk: true, expectText: '过细线条' },
  { name: '配色检查：填充色>3 种 → 警告', file: 'multicolor-symbol.svg', expectOk: true, expectText: '用色应克制' },
]

let pass = 0
for (const c of cases) {
  const svg = readFileSync(new URL(`./${c.file}`, import.meta.url), 'utf8')
  let r
  try {
    r = checkAndNormalizeSvg(svg)
  } catch (e) {
    console.log(`FAIL ${c.name}: 抛异常 ${e}`)
    continue
  }
  const okMatch = r.ok === c.expectOk
  const levelOk = !c.expectLevel || r.issues.some((i) => i.level === c.expectLevel)
  const viewBoxOk = !c.expectViewBox || (r.normalized ?? '').includes('viewBox="0 0 64 64"')
  const textOk = !c.expectText || r.issues.some((i) => i.message.includes(c.expectText))
  const ok = okMatch && levelOk && viewBoxOk && textOk
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'} ${c.name} → ok=${r.ok} issues=${JSON.stringify(r.issues.map((i) => `[${i.level}]${i.message}`))}`)
}
console.log(`\n${pass}/${cases.length} 通过`)
