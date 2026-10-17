// 投影规则引擎验收脚本 — 对应 spec/02 §8 用例1-5（模块级验证）
import { recommendByRule } from './ruleEngine.bundle.mjs'

const cases = [
  {
    name: '用例1 中国全图+统计专题',
    req: { region: { kind: 'preset', presetId: 'china' }, purpose: 'statistic' },
    expectId: 'albers-equal-area-conic',
    expectParams: { centralMeridian: 105, standardParallels: [25, 47] },
  },
  {
    name: '用例2 世界+教学演示',
    req: { region: { kind: 'preset', presetId: 'world' }, purpose: 'education' },
    expectOneOf: ['robinson', 'winkel-tripel'],
  },
  {
    name: '用例3 高纬(70-85°N)+极地制图',
    req: { region: { kind: 'extent', extent: { minLon: -180, minLat: 70, maxLon: 180, maxLat: 85 } }, purpose: 'polar' },
    expectOneOf: ['polar-stereographic', 'azimuthal-equidistant'],
  },
  {
    name: '用例4 赤道附近+航海导航',
    req: { region: { kind: 'extent', extent: { minLon: -10, minLat: -5, maxLon: 10, maxLat: 5 } }, purpose: 'navigation' },
    expectId: 'mercator',
  },
  {
    name: '用例5 智利(南北狭长)+地形图',
    req: { region: { kind: 'preset', presetId: 'chile' }, purpose: 'topographic' },
    expectId: 'transverse-mercator',
  },
]

let pass = 0
for (const c of cases) {
  const recs = recommendByRule(c.req)
  const top = recs[0]
  if (!top) {
    console.log(`FAIL ${c.name}: 无推荐结果`)
    continue
  }
  const idOk = c.expectId ? top.projection.id === c.expectId : c.expectOneOf.includes(top.projection.id)
  let paramOk = true
  if (c.expectParams) {
    const p = top.projection.typicalParams ?? {}
    paramOk =
      p.centralMeridian === c.expectParams.centralMeridian &&
      JSON.stringify(p.standardParallels) === JSON.stringify(c.expectParams.standardParallels)
  }
  const ok = idOk && paramOk
  if (ok) pass++
  console.log(
    `${ok ? 'PASS' : 'FAIL'} ${c.name} → 主推荐: ${top.projection.zhName} (${top.projection.id})` +
      (top.projection.typicalParams ? ` 参数: ${JSON.stringify(top.projection.typicalParams)}` : '') +
      ` 来源: ${top.source} 候选数: ${recs.length}`,
  )
}
console.log(`\n${pass}/${cases.length} 通过`)
