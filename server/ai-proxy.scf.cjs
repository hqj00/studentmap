/**
 * 腾讯云函数 SCF「Web 函数」版 —— 粘贴到模板自带的 app.js（文件名保持不变！）
 * 与本地 server/ai-proxy.mjs 同职责：保管 LLM_API_KEY、转发 OpenAI 兼容 Chat Completions。
 * CommonJS 格式，模板 app.js 默认即 CJS，无需改 package.json、无需动 scf_bootstrap。
 * 环境变量：LLM_API_KEY（必填）、LLM_BASE_URL、LLM_MODEL、ALLOW_ORIGIN、PORT（SCF 固定 9000）
 *
 * v0.2：上游（大模型方）报错时透传其错误内容（upstreamError 字段），便于定位；不含任何密钥信息。
 *      超时从 15s 提高到 115s（中转站 + 慢模型首字可能 20~60s）。
 */
const { createServer } = require('node:http')

const PORT = Number(process.env.PORT ?? 9000)
const BASE_URL = process.env.LLM_BASE_URL ?? 'https://api.openai.com/v1'
const API_KEY = process.env.LLM_API_KEY
const MODEL = process.env.LLM_MODEL ?? 'gpt-4o-mini'
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN ?? '*'
const UPSTREAM_TIMEOUT = Number(process.env.UPSTREAM_TIMEOUT ?? 115_000)

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.writeHead(204).end()
  // 宽松匹配路径后缀：函数 URL 直连为 /ai/recommend，网关形态可能带前缀
  if (req.method !== 'POST' || !(req.url ?? '').endsWith('/ai/recommend')) {
    return res.writeHead(404).end('not found')
  }
  if (!API_KEY) return res.writeHead(503).end('LLM_API_KEY 未配置')

  const body = await new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
  })
  const { messages } = JSON.parse(body)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT)
  try {
    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ model: MODEL, messages }),
      signal: controller.signal,
    })
    const text = await upstream.text()
    let content = ''
    try {
      content = JSON.parse(text)?.choices?.[0]?.message?.content ?? ''
    } catch {
      // 上游返回非 JSON 时 content 留空
    }
    res.writeHead(upstream.ok ? 200 : upstream.status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(upstream.ok ? { content } : { content, upstreamError: text.slice(0, 800) }))
  } catch (err) {
    res.writeHead(504, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: `上游调用失败：${String(err)}` }))
  } finally {
    clearTimeout(timer)
  }
})

server.listen(PORT, () => console.log(`[ai-proxy] listening on ${PORT} (model: ${MODEL})`))
