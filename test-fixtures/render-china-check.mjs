// 中国范围预览逐张独立渲染（每个 panel 独立 svg viewport，与 App 一致）
import { writeFileSync } from 'node:fs'
import { buildPreviewLayers } from './d3Factory.bundle.mjs'
import { findProjection, resolveExtent } from './presets.bundle.mjs'

const china = resolveExtent('china')
const ids = ['albers-equal-area-conic', 'mercator', 'lambert-conformal-conic', 'transverse-mercator']
const W = 420
const H = 260

const panels = ids
  .map((id) => {
    const info = findProjection(id)
    const L = buildPreviewLayers(info, china, W, H, [105, 35])
    const tissot = L.tissot.map((d) => `<path d="${d}" fill="rgba(230,126,34,0.28)" stroke="#e67e22" stroke-width="0.8"/>`).join('')
    const extentPath = L.extentD ? `<path d="${L.extentD}" fill="rgba(59,162,114,0.12)" stroke="#2e825b" stroke-width="1.2"/>` : ''
    const markerPath = L.markerPt ? `<circle cx="${L.markerPt[0]}" cy="${L.markerPt[1]}" r="7" fill="rgba(230,126,34,0.25)"/><circle cx="${L.markerPt[0]}" cy="${L.markerPt[1]}" r="3" fill="#e67e22" stroke="#fff" stroke-width="1.2"/>` : ''
    return `<div class="card">
  <p>${info.zhName}（${id}）· 中国范围</p>
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="background:#fbfcfa;border:1px solid #ddd">
    <path d="${L.sphere}" fill="#fbfcfa" stroke="#c9d9c9"/>
    <path d="${L.land}" fill="#e9f2e3" stroke="#b9cfb2" stroke-width="0.6"/>
    <path d="${L.grat}" fill="none" stroke="#c3d8c4" stroke-width="0.5" stroke-dasharray="2 3"/>
    ${extentPath}${tissot}${markerPath}
  </svg>
</div>`
  })
  .join('\n')

writeFileSync(
  new URL('./preview-china-check.html', import.meta.url),
  `<!doctype html><html><head><meta charset="utf-8"><style>
body{font-family:sans-serif;margin:10px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.card p{margin:0 0 6px;font-size:13px}
</style></head><body>${panels}</body></html>`,
)
console.log('written test-fixtures/preview-china-check.html')
