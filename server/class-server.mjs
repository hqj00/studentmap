/**
 * 班级自建服务器（spec/06 §2）——零云账户、零外部依赖：
 * 账号注册/登录（scrypt 加盐哈希）+ 每人独立的符号库存储 + dist/ 静态托管，单文件单端口。
 *
 *   npm run build && npm run class-server
 *
 * 学生访问 http://<教师机IP>:8788 ；数据落盘在 data/（不入库）。
 */
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DATA = process.env.DATA_DIR ?? join(ROOT, 'data')
const DIST = join(ROOT, 'dist')
const PORT = Number(process.env.CLASS_PORT ?? 8788)

mkdirSync(join(DATA, 'libraries'), { recursive: true })

// —— 极简持久化：users.json / tokens.json / libraries/<用户名>.json
const usersFile = join(DATA, 'users.json')
const tokensFile = join(DATA, 'tokens.json')
const readJson = (f, fallback) => {
  try {
    return JSON.parse(readFileSync(f, 'utf8'))
  } catch {
    return fallback
  }
}
const users = readJson(usersFile, {})
const tokens = readJson(tokensFile, {})
const saveUsers = () => writeFileSync(usersFile, JSON.stringify(users, null, 2))
const saveTokens = () => writeFileSync(tokensFile, JSON.stringify(tokens, null, 2))

const hashPassword = (password, salt) => scryptSync(password, salt, 32).toString('hex')
const libFile = (username) => join(DATA, 'libraries', encodeURIComponent(username) + '.json')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const send = (code, obj) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(obj))
  }

  // 前端探测用（spec/06 §1 自动探测）
  if (url.pathname === '/api/ping') return send(200, { ok: true, service: 'studentmap-class-server' })

  const body = await new Promise((resolve) => {
    let d = ''
    req.on('data', (c) => (d += c))
    req.on('end', () => resolve(d))
  })
  const parse = () => {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }
  // token → 用户名；账号隔离全靠这一道（任何请求只能碰自己的库文件）
  const authedUser = () => {
    const m = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')
    return (m && tokens[m[1]]) || null
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/register') {
    const { username, password } = parse()
    const name = typeof username === 'string' ? username.trim() : ''
    if (!/^[\w一-龥-]{2,20}$/.test(name)) return send(400, { error: '用户名需为 2~20 位字母/数字/中文/下划线' })
    if (typeof password !== 'string' || password.length < 6) return send(400, { error: '密码至少 6 位' })
    if (users[name]) return send(409, { error: '该用户名已被注册' })
    const salt = randomBytes(16).toString('hex')
    users[name] = { salt, hash: hashPassword(password, salt), createdAt: Date.now() }
    saveUsers()
    return send(200, { ok: true })
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    const { username, password } = parse()
    const name = typeof username === 'string' ? username.trim() : ''
    const u = users[name]
    const ok =
      u && timingSafeEqual(Buffer.from(hashPassword(password ?? '', u.salt)), Buffer.from(u.hash))
    if (!ok) return send(401, { error: '用户名或密码错误' })
    const token = randomBytes(24).toString('hex')
    tokens[token] = name
    saveTokens()
    return send(200, { token, username: name })
  }

  if (url.pathname === '/api/auth/me') {
    const name = authedUser()
    return name ? send(200, { username: name }) : send(401, { error: '未登录或会话已失效' })
  }

  if (url.pathname === '/api/library') {
    const name = authedUser()
    if (!name) return send(401, { error: '未登录或会话已失效' })
    if (req.method === 'GET') return send(200, readJson(libFile(name), { symbols: [] }))
    if (req.method === 'PUT') {
      const { symbols } = parse()
      if (!Array.isArray(symbols)) return send(400, { error: '格式错误：symbols 应为数组' })
      writeFileSync(libFile(name), JSON.stringify({ owner: name, symbols, updatedAt: Date.now() }))
      return send(200, { ok: true, count: symbols.length })
    }
  }

  if (url.pathname.startsWith('/api/')) return send(404, { error: 'not found' })

  // 静态托管 dist/（hash 路由无需回退规则）；防目录穿越
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '')
  let file = join(DIST, rel)
  if (!file.startsWith(DIST + sep) && file !== DIST) {
    res.writeHead(403)
    return res.end()
  }
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html')
  if (!existsSync(file)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
    return res.end('dist/ 不存在：请先运行 npm run build')
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
  res.end(readFileSync(file))
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[class-server] 本机访问  http://localhost:${PORT}`)
  console.log(`[class-server] 学生访问  http://<本机局域网IP>:${PORT}（需防火墙放行该端口）`)
  console.log(`[class-server] 数据目录  ${DATA}`)
})
