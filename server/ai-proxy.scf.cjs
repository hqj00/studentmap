/**
 * 腾讯云函数 SCF「Web 函数」版 —— 粘贴到模板自带的 app.js（文件名保持不变！）
 * 与本地 server/ai-proxy.mjs 同职责：保管 LLM_API_KEY、转发 OpenAI 兼容 Chat Completions。
 * CommonJS 格式，模板 app.js 默认即 CJS，无需改 package.json、无需动 scf_bootstrap。
 * 环境变量：LLM_API_KEY（必填）、LLM_BASE_URL、LLM_MODEL、ALLOW_ORIGIN、PORT（SCF 固定 9000）
 *
 * v0.2：上游（大模型方）报错时透传其错误内容（upstreamError 字段），便于定位；不含任何密钥信息。
 *      超时从 15s 提高到 115s（中转站 + 慢模型首字可能 20~60s）。
 * v0.3：上游 429（RPM 限流）自动重试 2 次（等 5s / 15s），限流窗口按分钟计时，退避后大概率放行；
 *      重试总时长受 UPSTREAM_TIMEOUT 约束。
 * v0.4：429 重试退避加强为 10s / 30s / 60s（共 3 次重试）——组级限流按分钟窗口计，
 *      5s/15s 多半仍落在同一窗口内；拉长到跨窗口才大概率放行。最坏情况 ≈104s + 一次上游耗时，
 *      仍在 115s 上限内（前端等待上限 125s）。
 * v0.5：ALLOW_ORIGIN 支持逗号分隔的多域名白名单（如 https://hqj00.github.io,http://localhost:5173），
 *      按请求 Origin 回显匹配值并加 Vary: Origin；填 * 或不填则全放行。便于本地开发同时保留线上白名单。
 */
const { createServer } = require('node:http')

const PORT = Number(process.env.PORT ?? 9000)
const BASE_URL = process.env.LLM_BASE_URL ?? 'https://api.openai.com/v1'
const API_KEY = process.env.LLM_API_KEY
const MODEL = process.env.LLM_MODEL ?? 'gpt-4o-mini'
const UPSTREAM_TIMEOUT = Number(process.env.UPSTREAM_TIMEOUT ?? 115_000)
/** 429 重试退避（毫秒）；最后一次失败后直接透传错误 */
const RETRY_DELAYS = [10_000, 30_000, 60_000]

/** 允许的前端来源：* 或逗号分隔的白名单（v0.5） */
const ALLOW_ORIGINS = (process.env.ALLOW_ORIGIN ?? '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

/** 按请求 Origin 回显白名单内的来源；* 直接全放行 */
function corsOrigin(req) {
  if (ALLOW_ORIGINS.includes('*')) return '*'
  const origin = req.headers.origin
  return origin && ALLOW_ORIGINS.includes(origin) ? origin : ALLOW_ORIGINS[0]
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', corsOrigin(req))
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Vary', 'Origin')
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

  const deadline = Date.now() + UPSTREAM_TIMEOUT
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), Math.max(5_000, deadline - Date.now()))
    try {
      const upstream = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ model: MODEL, messages }),
        signal: controller.signal,
      })
      const text = await upstream.text()
      // 429 = 上游 RPM 限流：等退避时间后重试（还有剩余时间才重试）
      if (upstream.status === 429 && attempt < RETRY_DELAYS.length && Date.now() + RETRY_DELAYS[attempt] + 5_000 < deadline) {
        console.log(`[ai-proxy] 上游 429，${RETRY_DELAYS[attempt] / 1000}s 后第 ${attempt + 2} 次尝试`)
        await sleep(RETRY_DELAYS[attempt])
        continue
      }
      let content = ''
      try {
        content = JSON.parse(text)?.choices?.[0]?.message?.content ?? ''
      } catch {
        // 上游返回非 JSON 时 content 留空
      }
      res.writeHead(upstream.ok ? 200 : upstream.status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(upstream.ok ? { content } : { content, upstreamError: text.slice(0, 800) }))
      return
    } catch (err) {
      if (attempt < RETRY_DELAYS.length && Date.now() + RETRY_DELAYS[attempt] + 5_000 < deadline) {
        console.log(`[ai-proxy] 上游调用失败（${String(err)}），${RETRY_DELAYS[attempt] / 1000}s 后重试`)
        await sleep(RETRY_DELAYS[attempt])
        continue
      }
      res.writeHead(504, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: `上游调用失败：${String(err)}` }))
      return
    } finally {
      clearTimeout(timer)
    }
  }
})

server.listen(PORT, () => console.log(`[ai-proxy] listening on ${PORT} (model: ${MODEL})`))
