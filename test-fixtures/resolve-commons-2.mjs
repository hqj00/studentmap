// 补查 polar-stereographic 与 winkel-tripel 的 Commons 配图
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function resolve(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent('File:' + title)}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&format=json&formatversion=2`
  const resp = await fetch(url, { headers: { 'User-Agent': 'studentmap-course-project/0.1 (contact: hqj00)' } })
  const text = await resp.text()
  if (text.startsWith('You are making too many requests')) {
    await sleep(2500)
    return resolve(title)
  }
  const data = JSON.parse(text)
  const page = data?.query?.pages?.[0]
  if (!page || page.missing !== undefined || !page.imageinfo?.length) return null
  const info = page.imageinfo[0]
  return {
    url: info.thumburl ?? info.url,
    license: info.extmetadata?.LicenseShortName?.value ?? '',
    artist: (info.extmetadata?.Artist?.value ?? '').replace(/<[^>]*>/g, '').slice(0, 40),
  }
}

const MORE = {
  'polar-stereographic': [
    'Stereographic projection SW.JPG',
    'Polar stereographic projection.jpg',
    'Stereographic projection polar SW.jpg',
    'South Pole stereographic projection.jpg',
    'Stereographic Projection.jpg',
  ],
  'winkel-tripel': [
    'Winkel tripel projection SW.JPG',
    'Winkel-tripel projection SW.jpg',
    'Winkel Tripel projection.jpg',
    'Winkel tripel projection new.jpg',
    'Winkel Tripel world map.jpg',
  ],
}

const out = {}
for (const [id, titles] of Object.entries(MORE)) {
  for (const t of titles) {
    const r = await resolve(t)
    await sleep(400)
    if (r) {
      out[id] = { title: t, ...r }
      break
    }
  }
  if (!out[id]) out[id] = null
}
console.log(JSON.stringify(out, null, 2))
