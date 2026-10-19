// 查 CloudBase SDK SignUpRequest 的字段（是否支持 username）
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const files = []
;(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (f.endsWith('.d.ts')) files.push(p)
  }
})('node_modules/@cloudbase/js-sdk')

for (const f of files) {
  const c = readFileSync(f, 'utf8')
  const i = c.indexOf('SignUpRequest')
  if (i >= 0) {
    console.log('=== ' + f.split('js-sdk')[1] + ' ===')
    // 打印 SignUpRequest 接口定义
    const j = c.indexOf('SignUpRequest', i + 1)
    for (const k of [i, j]) {
      if (k < 0) continue
      const seg = c.slice(k, k + 700)
      if (/SignUpRequest\s*[=({]|interface SignUpRequest|type SignUpRequest/.test(seg)) console.log(seg.split('}')[0] + '}')
    }
  }
}
console.log('done')
