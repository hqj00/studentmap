// 用 Commons API 解析各投影配图的真实 URL（输出可粘贴到 presets.ts 的 refImage 字段）
// Wikimedia Commons API: action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800

const CANDIDATES = {
  mercator: ['Mercator projection Square.JPG', 'Mercator projection SW.jpg', 'Mercator-projection.jpg'],
  'transverse-mercator': ['Transverse Mercator projection SW.jpg', 'Universal Transverse Mercator zones.svg'],
  'lambert-conformal-conic': ['Lambert conformal conic projection SW.jpg', 'Lambert conformal conic.svg'],
  'albers-equal-area-conic': ['Albers projection SW.jpg', 'Albers equal-area conic projection SW.jpg'],
  'azimuthal-equidistant': ['Azimuthal equidistant projection SW.jpg', 'Azimuthal equidistant projection.jpg'],
  'polar-stereographic': ['Stereographic projection SW.jpg', 'Polar stereographic projection SW.jpg'],
  'lambert-azimuthal-equal-area': ['Lambert azimuthal equal-area projection SW.jpg'],
  'equidistant-cylindrical': ['Equirectangular projection SW.jpg', 'Equirectangular projection.jpg'],
  'gall-peters': ['Gall–Peters projection SW.jpg', 'Gall-Peters projection SW.jpg', 'Peters projection SW.jpg'],
  robinson: ['Robinson projection SW.jpg'],
  'winkel-tripel': ['Winkel tripel projection SW.jpg', 'Winkel Tripel projection SW.jpg'],
  mollweide: ['Mollweide projection SW.jpg'],
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function resolve(title, retries = 3) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent('File:' + title)}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&format=json&formatversion=2`
  const resp = await fetch(url, { headers: { 'User-Agent': 'studentmap-course-project/0.1 (contact: hqj00)' } })
  const text = await resp.text()
  if (text.startsWith('You are making too many requests')) {
    if (retries <= 0) return null
    await sleep(2000)
    return resolve(title, retries - 1)
  }
  const data = JSON.parse(text)
  const page = data?.query?.pages?.[0]
  if (!page || page.missing !== undefined || !page.imageinfo?.length) return null
  const info = page.imageinfo[0]
  const license = info.extmetadata?.LicenseShortName?.value ?? ''
  const artist = (info.extmetadata?.Artist?.value ?? '').replace(/<[^>]*>/g, '').slice(0, 40)
  return { url: info.thumburl ?? info.url, license, artist }
}

const out = {}
for (const [id, titles] of Object.entries(CANDIDATES)) {
  for (const t of titles) {
    const r = await resolve(t)
    await sleep(400) // 限速，避免触发 Commons 限流
    if (r) {
      out[id] = { title: t, ...r }
      break
    }
  }
  if (!out[id]) out[id] = null
}
console.log(JSON.stringify(out, null, 2))
