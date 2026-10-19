// 坐标试算验收 — 对应 spec/02 §11 用例11：正算/反算往返一致；不支持的投影优雅返回 null
import { forwardProject, inverseProject } from './convert.bundle.mjs'
import { findProjection, resolveExtent } from './presets.bundle.mjs'

const china = resolveExtent('china')
const beijing = resolveExtent('beijing')
const arctic = resolveExtent('arctic')

let pass = 0
function roundTrip(name, id, extent, lon, lat) {
  const fwd = forwardProject(findProjection(id), extent, lon, lat)
  if (!fwd) {
    console.log(`FAIL ${name}: 正算返回 null`)
    return
  }
  const back = inverseProject(findProjection(id), extent, fwd[0], fwd[1])
  if (!back) {
    console.log(`FAIL ${name}: 反算返回 null`)
    return
  }
  const err = Math.max(Math.abs(back[0] - lon), Math.abs(back[1] - lat))
  const ok = err < 1e-6
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} → (${lon}, ${lat}) → (${fwd[0].toFixed(1)}m, ${fwd[1].toFixed(1)}m) → 回算误差 ${err.toExponential(2)}°`)
}

roundTrip('中国 Albers 往返', 'albers-equal-area-conic', china, 116.4, 39.9)
roundTrip('北京 高斯-克吕格 往返', 'transverse-mercator', beijing, 116.4, 39.9)
roundTrip('墨卡托 往返', 'mercator', china, 120, 30)
roundTrip('北极 方位等距 往返', 'azimuthal-equidistant', arctic, 0, 75)
roundTrip('极地立体 往返', 'polar-stereographic', arctic, 30, 80)

// 不支持投影的优雅降级
const wintri = forwardProject(findProjection('winkel-tripel'), china, 116, 40)
const wOk = wintri === null
if (wOk) pass++
console.log(`${wOk ? 'PASS' : 'FAIL'} 温克尔三重不支持试算时返回 null（界面提示"暂不支持"）`)

console.log(`\n${pass}/6 通过`)
