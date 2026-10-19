// 下载全部 refImage 到 public/ref-images/<id>.<ext>（带重试）
import { mkdirSync, writeFileSync } from 'node:fs'
import { PROJECTION_KB } from './presets.bundle.mjs'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const outDir = new URL('../public/ref-images/', import.meta.url)
mkdirSync(outDir, { recursive: true })

let ok = 0
for (const p of PROJECTION_KB) {
  if (!p.refImage) continue
  const ext = p.refImage.url.toLowerCase().includes('.png') ? 'png' : 'jpg'
  const file = new URL(`./${p.id}.${ext}`, outDir)
  let done = false
  for (let i = 0; i < 4 && !done; i++) {
    try {
      const r = await fetch(p.refImage.url, { redirect: 'follow' })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const buf = Buffer.from(await r.arrayBuffer())
      writeFileSync(file, buf)
      console.log(`OK   ${p.id}.${ext}  ${Math.round(buf.length / 1024)}KB`)
      ok++
      done = true
    } catch (e) {
      if (i === 3) console.log(`FAIL ${p.id}: ${e.message ?? e}`)
      else await sleep(1500)
    }
  }
}
console.log(`\n${ok}/12 已下载`)
