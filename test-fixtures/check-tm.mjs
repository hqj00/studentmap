let url = 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Ellipsoidal_transverse_Mercator_projection_SW.jpg&width=800'
for (let hop = 0; hop < 5; hop++) {
  let r
  for (let i = 0; i < 4; i++) {
    try {
      r = await fetch(url, { redirect: 'manual' })
      break
    } catch (e) {
      await new Promise((s) => setTimeout(s, 1500))
    }
  }
  if (!r) {
    console.log('hop', hop, '连接失败:', url)
    process.exit(1)
  }
  const loc = r.headers.get('location')
  console.log(`hop${hop}: HTTP ${r.status} ${r.headers.get('content-type') ?? ''} ${loc ? '→ ' + loc.slice(0, 120) : '(内容长度 ' + r.headers.get('content-length') + ')'}`)
  if (!loc) break
  url = loc
}
