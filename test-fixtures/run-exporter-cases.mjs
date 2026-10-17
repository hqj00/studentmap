// 参数导出验收脚本 — 对应 spec/02 §11 用例7/10（模块级验证）
import { buildProj4, buildWkt, epsgHint } from './exporters.bundle.mjs'
import { findProjection, resolveExtent } from './presets.bundle.mjs'

const china = resolveExtent('china')
const beijing = resolveExtent('beijing')
const antarctic = resolveExtent('antarctic')

const cases = [
  {
    name: '用例7 中国全图 Albers PROJ4',
    get: () => buildProj4(findProjection('albers-equal-area-conic'), china),
    contains: ['+proj=aea', '+lat_1=25', '+lat_2=47', '+lon_0=105', '+datum=WGS84'],
  },
  {
    name: '用例7b 中国全图 Albers WKT',
    get: () => buildWkt(findProjection('albers-equal-area-conic'), china),
    contains: ['PROJCRS', 'Albers Equal Area', '9822', '25', '47', '105'],
  },
  {
    name: '用例10 北京市 高斯-克吕格 PROJ4（6°带中央经线 117°E）',
    get: () => buildProj4(findProjection('transverse-mercator'), beijing),
    contains: ['+proj=tmerc', '+lon_0=117', '+k=1', '+x_0=500000'],
  },
  {
    name: '用例10b 高斯-克吕格 EPSG 提示分带系列',
    get: () => epsgHint(findProjection('transverse-mercator')),
    contains: ['EPSG:4491', 'EPSG:4513'],
  },
  {
    name: '墨卡托 EPSG 提示',
    get: () => epsgHint(findProjection('mercator')),
    contains: ['3395', '3857'],
  },
  {
    name: '南极地区 极地立体 PROJ4',
    get: () => buildProj4(findProjection('polar-stereographic'), antarctic),
    contains: ['+proj=stere', '+lat_0=-90'],
  },
  {
    name: '无编号投影 EPSG 兜底文案',
    get: () => epsgHint(findProjection('robinson')),
    contains: ['无直接对应', 'PROJ4'],
  },
]

let pass = 0
for (const c of cases) {
  const out = c.get()
  const missing = c.contains.filter((t) => !out.includes(t))
  const ok = missing.length === 0
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'} ${c.name}${ok ? '' : ` 缺少: ${missing.join(' | ')}`}`)
  if (!ok) console.log(`  实际: ${out}`)
}
console.log(`\n${pass}/${cases.length} 通过`)
