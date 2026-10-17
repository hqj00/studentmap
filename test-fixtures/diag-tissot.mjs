// 验证变形对比可读性：墨卡托下中国北部的 Tissot 圆应明显大于南部（面积夸大），Albers 下大小基本一致
import { createProjection } from './d3Factory.bundle.mjs'
import { findProjection, resolveExtent } from './presets.bundle.mjs'
import { geoCircle, geoPath } from 'd3-geo'

const china = resolveExtent('china')
const circle = geoCircle().radius(4)

function circleArea(infoId, lat) {
  const proj = createProjection(findProjection(infoId), china, 420, 260)
  const path = geoPath(proj)
  const b = path.bounds(geoCircle().radius(4).center([105, lat])())
  const w = b[1][0] - b[0][0]
  const h = b[1][1] - b[0][1]
  return Math.round(w * h)
}

for (const id of ['mercator', 'albers-equal-area-conic']) {
  const south = circleArea(id, 10)
  const north = circleArea(id, 47)
  console.log(`${id}: 南部(10°N)圆面积≈${south}px², 北部(47°N)≈${north}px², 北/南比=${(north / south).toFixed(2)}`)
}
console.log('预期：mercator 北/南比明显 >1（面积夸大）；albers 接近 1（等积）')
