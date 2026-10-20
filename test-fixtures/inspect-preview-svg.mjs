// 检查 preview-test.svg 两个面板的路径有效性
import { readFileSync } from 'node:fs'

const s = readFileSync(new URL('./preview-test.svg', import.meta.url), 'utf8')
console.log('NaN count:', (s.match(/NaN/g) ?? []).length)
const parts = s.split('<g transform=')
console.log('parts:', parts.length)
for (let i = 1; i < parts.length; i++) {
  const m = parts[i].match(/<path d="(M[-\d.]+),([-\d.]+)/)
  console.log(`panel ${i}: len=${parts[i].length} first M=${m ? `${m[1]},${m[2]}` : 'none'}`)
}
