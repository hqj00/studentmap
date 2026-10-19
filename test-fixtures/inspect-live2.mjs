// 从线上 bundle 挖 CloudBase 环境 ID（VITE_TCB_ENV 构建期烧入）
import { readFileSync } from 'node:fs'

for (const f of ['live-main.js', 'live-lib.js', 'live-login.js']) {
  const t = readFileSync(new URL(`./${f}`, import.meta.url), 'utf8')
  // env id 形如 abc123-def456 或带数字字母横杠组合
  const cands = [
    ...new Set(
      [...t.matchAll(/["'`]([a-z][a-z0-9]{2,20}-[0-9a-z]{6,16})["'`]/g)].map((m) => m[1]),
    ),
  ]
  console.log(f, '→', cands.length ? cands.join(', ') : '(无候选)')
}
