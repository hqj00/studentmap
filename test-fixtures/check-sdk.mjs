// 在 CloudBase SDK 类型声明里核对认证/数据库方法名
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

const kws = ['signInWithUsernameAndPassword', 'signUpWithUsernameAndPassword', 'getLoginState', 'signOut', 'onAuthStateChanged', 'customSignUp', 'signUp']
for (const f of files) {
  const c = readFileSync(f, 'utf8')
  const hits = kws.filter((k) => c.includes(k))
  if (hits.length) {
    console.log(f.split('js-sdk')[1], '→', hits.join(', '))
    for (const k of hits) {
      const i = c.indexOf(k)
      console.log('   ', c.slice(i - 80, i + 120).replace(/\s+/g, ' '))
    }
  }
}
console.log('done')
