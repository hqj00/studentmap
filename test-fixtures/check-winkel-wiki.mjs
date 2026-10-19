const url = 'https://en.wikipedia.org/api/rest_v1/page/summary/Winkel_tripel_projection'
fetch(url, { headers: { 'User-Agent': 'studentmap-course-project/0.1' } })
  .then(async (r) => {
    const d = await r.json()
    console.log('title:', d.title)
    console.log('thumb:', d.thumbnail?.source ?? '(none)')
    console.log('original:', d.originalimage?.source ?? '(none)')
  })
  .catch((e) => console.log('ERR', e.cause?.code ?? e.message))
