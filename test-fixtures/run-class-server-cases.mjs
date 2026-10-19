// 班级自建服务器验收（spec/06 §2）：拉起真实服务进程，跑完整注册/登录/库读写/隔离流程
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = 18788
const BASE = `http://localhost:${PORT}`
const dataDir = mkdtempSync(join(tmpdir(), 'sm-class-server-'))

const server = spawn(process.execPath, ['server/class-server.mjs'], {
  env: { ...process.env, CLASS_PORT: String(PORT), DATA_DIR: dataDir },
  stdio: 'pipe',
})
await new Promise((r) => server.stdout.once('data', r))

let pass = 0
async function check(name, fn) {
  try {
    const detail = await fn()
    pass++
    console.log(`PASS ${name}${detail ? ` → ${detail}` : ''}`)
  } catch (e) {
    console.log(`FAIL ${name} → ${e.message ?? e}`)
  }
}
const post = (path, body, token) =>
  fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })

try {
  await check('ping 探测', async () => {
    const r = await fetch(`${BASE}/api/ping`)
    if (!r.ok || !(await r.json()).ok) throw new Error('ping 失败')
  })

  let tokenA
  await check('注册 A（学号2026001）', async () => {
    const r = await post('/api/auth/register', { username: '学号2026001', password: 'secret6' })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
  })
  await check('重复注册被拒 409', async () => {
    const r = await post('/api/auth/register', { username: '学号2026001', password: 'secret6' })
    if (r.status !== 409) throw new Error(`HTTP ${r.status}`)
  })
  await check('弱密码被拒 400', async () => {
    const r = await post('/api/auth/register', { username: '新同学', password: '123' })
    if (r.status !== 400) throw new Error(`HTTP ${r.status}`)
  })
  await check('错误密码登录被拒 401', async () => {
    const r = await post('/api/auth/login', { username: '学号2026001', password: 'wrong00' })
    if (r.status !== 401) throw new Error(`HTTP ${r.status}`)
  })
  await check('登录 A 拿到 token', async () => {
    const r = await post('/api/auth/login', { username: '学号2026001', password: 'secret6' })
    const d = await r.json()
    if (!d.token) throw new Error('无 token')
    tokenA = d.token
  })
  await check('me 恢复登录态', async () => {
    const r = await fetch(`${BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${tokenA}` } })
    if ((await r.json()).username !== '学号2026001') throw new Error('me 不符')
  })

  const sym = { id: 's1', name: '加油站', category: 'point', tags: [], svg: '<svg/>', source: 'iconify', createdAt: 1 }
  await check('A 写入符号库（1 个符号）', async () => {
    const r = await fetch(`${BASE}/api/library`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ symbols: [sym] }),
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
  })
  await check('A 读回自己的符号库', async () => {
    const r = await fetch(`${BASE}/api/library`, { headers: { Authorization: `Bearer ${tokenA}` } })
    const d = await r.json()
    if (d.symbols?.[0]?.name !== '加油站') throw new Error('读回内容不符')
  })

  let tokenB
  await check('注册并登录 B', async () => {
    await post('/api/auth/register', { username: 'student-b', password: 'secret6' })
    const r = await post('/api/auth/login', { username: 'student-b', password: 'secret6' })
    tokenB = (await r.json()).token
    if (!tokenB) throw new Error('无 token')
  })
  await check('账号隔离：B 的库为空（看不到 A 的符号）', async () => {
    const r = await fetch(`${BASE}/api/library`, { headers: { Authorization: `Bearer ${tokenB}` } })
    const d = await r.json()
    if ((d.symbols ?? []).length !== 0) throw new Error('B 看到了 A 的数据！')
  })
  await check('未带 token 访问被拒 401', async () => {
    const r = await fetch(`${BASE}/api/library`)
    if (r.status !== 401) throw new Error(`HTTP ${r.status}`)
  })
  await check('落盘文件确认（users.json 无明文密码）', async () => {
    const users = readFileSync(join(dataDir, 'users.json'), 'utf8')
    if (users.includes('secret6')) throw new Error('明文密码落盘了！')
    if (!readFileSync(join(dataDir, 'libraries', `${encodeURIComponent('学号2026001')}.json`), 'utf8').includes('加油站'))
      throw new Error('库文件缺失')
  })
} finally {
  server.kill()
}
console.log(`\n${pass}/13 通过`)
process.exit(pass === 13 ? 0 : 1)
