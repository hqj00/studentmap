// 预览图层离线渲染 — 用真实 buildPreviewLayers 生成 SVG 供浏览器截图核对（spec/02 §6 + spec/07 §2.5）
import { writeFileSync } from 'node:fs'
import { buildPreviewLayers } from './d3Factory.bundle.mjs'
import { findProjection, resolveExtent } from './presets.bundle.mjs'

const W = 420
const H = 260

function panel(infoId, extent, dx, marker) {
  const L = buildPreviewLayers(findProjection(infoId), extent, W, H, marker)
  const tissot = L.tissot
    .map((d) => `<path d="${d}" fill="rgba(230,126,34,0.28)" stroke="#e67e22" stroke-width="0.8"/>`)
    .join('')
  const extentPath = L.extentD
    ? `<path d="${L.extentD}" fill="rgba(59,162,114,0.12)" stroke="#2e825b" stroke-width="1.2"/>`
    : ''
  const markerPath = L.markerPt
    ? `<circle cx="${L.markerPt[0]}" cy="${L.markerPt[1]}" r="7" fill="rgba(230,126,34,0.25)"/><circle cx="${L.markerPt[0]}" cy="${L.markerPt[1]}" r="3" fill="#e67e22" stroke="#fff" stroke-width="1.2"/>`
    : ''
  return `<g transform="translate(${dx},0)">
    <rect width="${W}" height="${H}" fill="#fbfcfa" stroke="#e0efe5" rx="8"/>
    <path d="${L.sphere}" fill="#fbfcfa" stroke="#c9d9c9"/>
    <path d="${L.land}" fill="#e9f2e3" stroke="#b9cfb2" stroke-width="0.6"/>
    <path d="${L.grat}" fill="none" stroke="#c3d8c4" stroke-width="0.5" stroke-dasharray="2 3"/>
    ${extentPath}${tissot}${markerPath}
  </g>`
}

const china = resolveExtent('china')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 2 + 20}" height="${H + 30}">
  <text x="0" y="18" font-size="14">左：中国-Albers 等积圆锥（25°N/47°N/105°E，含陆地轮廓与 105°E,35°N 标记点）　右：中国-墨卡托（对照：高纬 Tissot 椭圆明显变大）</text>
  <g transform="translate(0,24)">
    ${panel('albers-equal-area-conic', china, 0, [105, 35])}
    ${panel('mercator', china, W + 20)}
  </g>
</svg>`

writeFileSync(new URL('./preview-test.svg', import.meta.url), svg)
console.log('written test-fixtures/preview-test.svg')
