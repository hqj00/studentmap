const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const names = [
  'Winkel tripel projection SW.jpg',
  'Winkel Tripel projection SW.jpg',
  'Winkel tripel projection.jpg',
  'Winkel Tripel projection.jpg',
]
for (const n of names) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&titles=' +
    encodeURIComponent('File:' + n) +
    '&prop=imageinfo&iiprop=url&iiurlwidth=960&format=json&formatversion=2'
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const resp = await fetch(url, { headers: { 'User-Agent': 'studentmap-course-project/0.1' } })
      const data = await resp.json()
      const page = data?.query?.pages?.[0]
      if (page && page.missing === undefined && page.imageinfo?.length) {
        console.log('FOUND', n, page.imageinfo[0].thumburl ?? page.imageinfo[0].url)
        process.exit(0)
      }
      console.log('missing:', n)
      break
    } catch (e) {
      console.log('retry', attempt, n, e.cause?.code ?? e.message)
      await sleep(3000)
    }
  }
  await sleep(500)
}
console.log('NOT_FOUND')
