// 用 MD5 规则直接构造 upload.wikimedia.org 缩略图 URL 并 HEAD 验证（绕过 commons API）
import { createHash } from 'node:crypto'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function thumbUrl(filename, width = 960) {
  const name = filename.replace(/ /g, '_')
  const md5 = createHash('md5').update(name).digest('hex')
  const ext = name.toLowerCase().endsWith('.svg') ? '.png' : ''
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${md5[0]}/${md5.slice(0, 2)}/${encodeURIComponent(name)}/${width}px-${encodeURIComponent(name)}${ext}`
}

const CANDIDATES = {
  'polar-stereographic': [
    'Stereographic projection SW.JPG',
    'Stereographic projection SW.jpg',
    'Polar stereographic projection.jpg',
    'Stereographic projection polar SW.jpg',
    'South Pole stereographic projection.jpg',
    'Stereographic Projection.jpg',
  ],
  'winkel-tripel': [
    'Winkel tripel projection SW.jpg',
    'Winkel tripel projection SW.JPG',
    'Winkel Tripel projection SW.jpg',
    'Winkel-tripel projection SW.jpg',
    'Winkel tripel projection new.jpg',
  ],
}

for (const [id, names] of Object.entries(CANDIDATES)) {
  let found = null
  for (const n of names) {
    const url = thumbUrl(n)
    try {
      const resp = await fetch(url, { method: 'HEAD' })
      await sleep(300)
      if (resp.ok) {
        found = { title: n, url }
        console.log(`OK   ${id} → ${n}`)
        break
      }
    } catch (e) {
      console.log(`ERR  ${n}: ${e.cause?.code ?? e.message}`)
    }
  }
  if (!found) console.log(`MISS ${id}`)
}
