// 校验当前 presets.ts 里的 11 个 refImage URL + 解析 winkel-tripel 的正确地址
import { readFileSync } from 'node:fs'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 从 presets.ts 源码提取 refImage url
const src = readFileSync(new URL('../src/modules/projection/presets.ts', import.meta.url), 'utf8')
const urls = [...src.matchAll(/url: '([^']+)'/g)].map((m) => m[1])
console.log(`本地已有 ${urls.length} 个 refImage URL，逐一验证：`)

for (const url of urls) {
  let done = false
  for (let i = 0; i < 3 && !done; i++) {
    try {
      const r = await fetch(url, { redirect: 'follow' })
      const type = r.headers.get('content-type') ?? '?'
      console.log(`${r.ok && type.startsWith('image/') ? 'OK  ' : 'FAIL'} ${r.status} ${type} ${url.slice(60, 110)}…`)
      done = true
    } catch {
      if (i === 2) console.log(`FAIL 网络 ${url.slice(60, 110)}…`)
      await sleep(1200)
    }
  }
  await sleep(300)
}

// 解析 winkel-tripel（文件名是 "Winkel triple projection SW.jpg"，triple 拼写）
console.log('\n解析 winkel-tripel：')
let wurl = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent('Winkel triple projection SW.jpg') + '?width=960'
for (let hop = 0; hop < 5; hop++) {
  let r
  for (let i = 0; i < 4; i++) {
    try { r = await fetch(wurl, { redirect: 'manual' }); break } catch { await sleep(1500) }
  }
  if (!r) { console.log('连接失败'); process.exit(1) }
  const loc = r.headers.get('location')
  console.log(`hop${hop}: HTTP ${r.status} ${r.headers.get('content-type') ?? ''} ${loc ? '→ …' + loc.slice(-80) : 'len=' + r.headers.get('content-length')}`)
  if (!loc) break
  wurl = loc
}
