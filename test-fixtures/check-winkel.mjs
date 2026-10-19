let wurl = 'https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Winkel_triple_projection_SW.jpg&width=960'
for (let hop = 0; hop < 5; hop++) {
  let r
  for (let i = 0; i < 6; i++) {
    try { r = await fetch(wurl, { redirect: 'manual' }); break } catch { await new Promise((s) => setTimeout(s, 2000)) }
  }
  if (!r) { console.log('连接失败:', wurl.slice(0, 90)); process.exit(1) }
  const loc = r.headers.get('location')
  console.log(`hop${hop}: HTTP ${r.status} ${r.headers.get('content-type') ?? ''}`)
  if (!loc) { console.log('最终长度:', r.headers.get('content-length')); break }
  console.log('  →', loc)
  wurl = loc
}
