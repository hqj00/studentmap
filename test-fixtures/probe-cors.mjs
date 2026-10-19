// 对照探测：不带 Origin / localhost / Pages 三种来源，看网关各自放行情况
const URL_ = 'https://studentmap-12345-d0ekn6xdb586bcf.api.tcloudbasegateway.com/auth/v1/verification'

for (const [label, origin] of [
  ['无 Origin（服务器直连）', undefined],
  ['Origin: http://localhost:5173', 'http://localhost:5173'],
  ['Origin: https://hqj00.github.io', 'https://hqj00.github.io'],
]) {
  const resp = await fetch(URL_, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { Origin: origin } : {}),
    },
    body: JSON.stringify({ email: 'probe@example.com' }),
  })
  const text = await resp.text()
  console.log(
    `${label}\n  HTTP ${resp.status} | acao=${resp.headers.get('access-control-allow-origin')} | ${text.slice(0, 200)}\n`,
  )
}
process.exit(0)
