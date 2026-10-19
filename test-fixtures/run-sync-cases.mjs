// 云端合并逻辑验收（spec/06 §6 用例4）
import { mergeLibraries } from './sync.bundle.mjs'

const mk = (id, name) => ({ id, name, category: 'point', tags: [], svg: '<svg/>', source: 'iconify', createdAt: 1 })

// 本地 3 个（含与云端重复 1 个），云端 2 个 → 并集 4 个，云端同 id 优先
const local = [mk('a', '本地A'), mk('b', '本地B'), mk('c', '本地C-旧')]
const remote = [mk('c', '云端C-新'), mk('d', '云端D')]
const merged = mergeLibraries(local, remote)

const checks = [
  ['并集数量=4', merged.length === 4],
  ['同 id 云端优先', merged.find((m) => m.id === 'c').name === '云端C-新'],
  ['本地独有保留', merged.some((m) => m.id === 'a') && merged.some((m) => m.id === 'b')],
  ['顺序：云端在前', merged[0].id === 'c' && merged[1].id === 'd'],
  ['空云端不丢本地', mergeLibraries(local, []).length === 3],
]
let pass = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`)
  if (ok) pass++
}
console.log(`\n${pass}/${checks.length} 通过`)
