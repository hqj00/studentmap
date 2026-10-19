const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const qs = ['transverse Mercator projection', 'UTM projection map', 'Gauss Kruger projection']

for (const q of qs) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q + ' filetype:bitmap')}&srnamespace=6&srlimit=8&format=json&origin=*`
  for (let i = 0; i < 3; i++) {
    try {
      const resp = await fetch(url)
      const data = await resp.json()
      console.log(`\n${q}:`)
      ;(data.query?.search ?? []).forEach((h) => console.log('  -', h.title.replace('File:', '')))
      break
    } catch {
      if (i === 2) console.log(`\n${q}: 搜索失败`)
      await sleep(1000)
    }
  }
  await sleep(500)
}
