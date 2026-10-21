import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import katex from 'katex'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const partsDir = path.join(here, 'parts')
const outFile = path.join(root, 'public', 'docs', 'studentmap-technical.html')

const decodeEntities = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')

const parts = fs
  .readdirSync(partsDir)
  .filter((f) => f.endsWith('.html'))
  .sort()
let body = parts.map((f) => fs.readFileSync(path.join(partsDir, f), 'utf8')).join('\n')

// ── display formulas ────────────────────────────────────────────────
let formulaCount = 0
body = body.replace(
  /<div class="formula" data-tex="([\s\S]*?)" data-no="(\d+)"><\/div>/g,
  (_, rawTex, no) => {
    const tex = decodeEntities(rawTex)
    try {
      const html = katex.renderToString(tex, {
        displayMode: true,
        throwOnError: true,
        strict: 'ignore',
        trust: false,
        output: 'htmlAndMathml',
      })
      formulaCount++
      return `<div class="formula" id="eq-${no}">${html}<span class="formula-number">(${no})</span></div>`
    } catch (e) {
      console.error(`[formula ${no}] ${e.message}\n${tex}`)
      process.exitCode = 1
      return `<div class="formula" id="eq-${no}"><pre>FORMULA ERROR (${no}): ${e.message}</pre></div>`
    }
  },
)

// ── inline formulas ─────────────────────────────────────────────────
body = body.replace(
  /<span class="imath" data-tex="([\s\S]*?)"><\/span>/g,
  (_, rawTex) => {
    const tex = decodeEntities(rawTex)
    try {
      const html = katex.renderToString(tex, {
        displayMode: false,
        throwOnError: true,
        strict: 'ignore',
        trust: false,
        output: 'htmlAndMathml',
      })
      return `<span class="imath">${html}</span>`
    } catch (e) {
      console.error(`[inline] ${e.message}\n${tex}`)
      process.exitCode = 1
      return `<span class="imath" title="${e.message}">${tex}</span>`
    }
  },
)

// ── table of contents ───────────────────────────────────────────────
const toc = []
body.replace(/<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g, (_, level, id, inner) => {
  const text = decodeEntities(inner.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
  toc.push(`<a class="level-${level}" href="#${id}">${text}</a>`)
  return _
})
if (!body.includes('<!--TOC-->')) throw new Error('TOC placeholder missing')
body = body.replace('<!--TOC-->', toc.join('\n    '))

// ── KaTeX CSS with woff2 embedded ───────────────────────────────────
const katexDist = path.join(root, 'node_modules', 'katex', 'dist')
let katexCss = fs.readFileSync(path.join(katexDist, 'katex.min.css'), 'utf8')
let embeddedFonts = 0
katexCss = katexCss.replace(/@font-face\{[^}]*\}/g, (block) => {
  const m = block.match(/url\((fonts\/[^)]+\.woff2)\)/)
  if (!m) return block
  const fam = block.match(/font-family:([^;]+);/)[1]
  const style = block.match(/font-style:([^;]+);/)[1]
  const weight = block.match(/font-weight:([^;]+);/)[1]
  const b64 = fs.readFileSync(path.join(katexDist, m[1])).toString('base64')
  embeddedFonts++
  return `@font-face{font-display:block;font-family:${fam};font-style:${style};font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format("woff2")}`
})

const docCss = fs.readFileSync(path.join(here, 'doc.css'), 'utf8')

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>studentmap 学生端：地图投影推荐与符号设计技术文档</title>
<meta name="description" content="studentmap 学生端技术文档：投影推荐规则、有效参数、d3 预览、图面整饰、符号校验、云端同步与验证结果。">
<style>
${katexCss}
${docCss}
</style>
</head>
<body>
${body}
</body>
</html>
`

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, html, 'utf8')
const size = (fs.statSync(outFile).size / 1024).toFixed(1)
console.log(`generated ${outFile}`)
console.log(`formulas: ${formulaCount}, fonts embedded: ${embeddedFonts}, size: ${size} KB`)
if (process.exitCode) console.error('Some formulas failed; see above.')
