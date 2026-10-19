// 符号库导入验收脚本 — 对应 spec/03 §7 用例6（模块级验证）
import { readFileSync } from 'node:fs'
import { mergeLibraryJson } from './transfer.bundle.mjs'

const existing = [
  {
    id: 'dup1',
    name: '加油站',
    category: 'point',
    tags: [],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="12" y="12" width="40" height="40" fill="currentColor"/></svg>',
    source: 'illustrator',
    createdAt: 1760000001000,
  },
]

const sample = readFileSync(new URL('./library-import-sample.json', import.meta.url), 'utf8')

let pass = 0
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`)
  if (cond) pass++
}

// 1) 正常合并：demo1 新增、dup1 重复跳过、bad1 非法跳过
const r1 = mergeLibraryJson(sample, existing)
check('合并：ok 且 records=2', r1.ok && r1.records.length === 2)
check('合并：新增 1、跳过 2（1 重复 + 1 非法）', r1.added === 1 && r1.skipped === 2)
check('合并：原有记录保持不变', r1.records[0].name === '加油站')

// 2) 非法 JSON
const r2 = mergeLibraryJson('not-json', existing)
check('非法 JSON：ok=false 且不改动原库', !r2.ok && r2.records === existing && !!r2.error)

// 3) 非数组 JSON
const r3 = mergeLibraryJson('{"a":1}', existing)
check('非数组 JSON：ok=false', !r3.ok && !!r3.error)

// 4) 空数组合法
const r4 = mergeLibraryJson('[]', existing)
check('空数组：ok 且 0 新增 0 跳过', r4.ok && r4.added === 0 && r4.skipped === 0 && r4.records.length === 1)

console.log(`\n${pass}/6 通过`)
