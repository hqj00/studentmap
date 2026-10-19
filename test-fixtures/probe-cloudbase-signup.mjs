// 核对 SDK 是否有 getVerification/verify/signIn，并对真实环境探测 getVerification 是否可用
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = 'node_modules/@cloudbase/js-sdk'
const files = []
;(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (f.endsWith('.d.ts')) files.push(p)
  }
})(root)

for (const kw of ['getVerification', 'verify(', 'signIn(', 'signUp(']) {
  const where = files.filter((f) => readFileSync(f, 'utf8').includes(kw)).map((f) => f.split('js-sdk')[1])
  console.log(kw, '→', where.length ? where.join(' | ') : '（无）')
}

if (!globalThis.localStorage) {
  globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
}
const { default: cloudbase } = await import('@cloudbase/js-sdk')
const app = cloudbase.init({ env: 'studentmap-12345-d0ekn6xdb586bcf' })
const auth = app.auth()
console.log('\nauth 句柄上有:', ['getVerification', 'verify', 'signIn', 'signUp'].map((m) => `${m}:${typeof auth[m]}`).join(' '))

try {
  const v = await auth.getVerification({ email: 'test@example.com' })
  console.log('getVerification 返回:', JSON.stringify(v).slice(0, 400))
} catch (e) {
  console.log('getVerification 抛错(完整):', JSON.stringify(e, Object.getOwnPropertyNames(e), 2))
}
process.exit(0)
