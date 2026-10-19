const { createHash } = require('node:crypto')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const names = [
  'Winkel tripel projection.jpg',
  'Winkel Tripel projection SW.jpg',
  'Winkel-tripel projection SW.jpg',
  'Winkel Tripel world map.jpg',
  'Winkel Tripel Projection.jpg',
  'Winkeltripel.jpg',
  'Winkel3.jpg',
  'Winkel Tripel Projection map.jpg',
  'Winkel_tripel_projection_SW.jpg',
]
;(async () => {
  for (const raw of names) {
    const name = raw.replace(/ /g, '_')
    const md5 = createHash('md5').update(name).digest('hex')
    const url = `https://upload.wikimedia.org/wikipedia/commons/thumb/${md5[0]}/${md5.slice(0, 2)}/${name}/960px-${name}`
    try {
      const r = await fetch(url, { method: 'HEAD' })
      console.log(r.status, raw)
      if (r.status === 200) {
        console.log('FOUND_URL=' + url)
        break
      }
    } catch (e) {
      console.log('ERR', raw, e.cause?.code ?? e.message)
    }
    await sleep(300)
  }
})()
