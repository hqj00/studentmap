/**
 * AI 代理 — 对应 spec/04 §5。
 * 职责：保管 LLM_API_KEY、转发 OpenAI 兼容 Chat Completions、15s 超时。
 * 运行：copy .env.example .env 后 `npm run server`
 */
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'

// 极简 .env 加载（避免引入 dotenv 依赖）
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}

const PORT = Number(process.env.PORT ?? 8787)
const BASE_URL = process.env.LLM_BASE_URL ?? 'https://api.openai.com/v1'
const API_KEY = process.env.LLM_API_KEY
const MODEL = process.env.LLM_MODEL ?? 'gpt-4o-mini'

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.writeHead(204).end()
  if (req.method !== 'POST' || req.url !== '/api/ai/recommend') {
    return res.writeHead(404).end('not found')
  }
  if (!API_KEY) {
    return res.writeHead(503).end('LLM_API_KEY 未配置：请复制 .env.example 为 .env 并填入密钥')
  }

  const body = await new Promise<string>((resolve) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
  })
  const { messages } = JSON.parse(body)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  try {
    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.2 }),
      signal: controller.signal,
    })
    const result = await upstream.json()
    const content = result?.choices?.[0]?.message?.content ?? ''
    res.writeHead(upstream.ok ? 200 : upstream.status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ content }))
  } catch (err) {
    res.writeHead(504, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: `上游调用失败：${String(err)}` }))
  } finally {
    clearTimeout(timer)
  }
})

server.listen(PORT, () => {
  console.log(`[ai-proxy] listening on http://localhost:${PORT}  (model: ${MODEL})`)
})
