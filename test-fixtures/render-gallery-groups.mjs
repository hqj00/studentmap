// 离线复刻 ProjectionGallery 分组+图面整饰（spec/09）：中国组按中国全图四至成图、世界组按世界四至；
// 每幅含经纬网标注、指北针、比例尺、图例 —— 用于离线核对 spec/09 验收 1/3/4
import { writeFileSync } from 'node:fs'
import { buildPreviewLayers, buildPreviewDecorations } from './d3Factory.bundle.mjs'
import { PROJECTION_KB, REGION_PRESETS } from './presets.bundle.mjs'

const WORLD = { minLon: -180, minLat: -90, maxLon: 180, maxLat: 90 }
const CHINA = REGION_PRESETS.find((p) => p.id === 'china').extent
const W = 280
const H = 180
const COLS = 3

const SCALE_KM = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]
function scaleBar(mmp, zoom) {
  let best = null
  for (const km of SCALE_KM) {
    const px = ((km * 1000) / mmp) * zoom
    if (px > 92) break
    if (!best || Math.abs(px - 52) < Math.abs(best.px - 52)) best = { km, px }
  }
  return best ?? { km: SCALE_KM[0], px: ((SCALE_KM[0] * 1000) / mmp) * zoom }
}

const cell = (info, x, y) => {
  const chinaScope = info.scope === 'china'
  const extent = chinaScope ? CHINA : WORLD
  const L = buildPreviewLayers(info, extent, W, H, undefined, { clipToExtent: chinaScope })
  const deco = buildPreviewDecorations(info, extent, W, H, { clipToExtent: chinaScope })
  const sb = scaleBar(deco.metersPerPixel, 1)
  const labels = deco.gratLabels
    .map(
      (t) =>
        `<text x="${t.x.toFixed(1)}" y="${t.y.toFixed(1)}" text-anchor="${t.anchor}" font-size="5" fill="#4e7a5c" paint-order="stroke" stroke="#fbfcfa" stroke-width="1.2">${t.text}</text>`,
    )
    .join('')
  return `<g transform="translate(${x},${y})">
    <rect width="${W}" height="${H + 22}" fill="#fff" stroke="#ccc"/>
    <text x="6" y="15" font-size="12" font-family="sans-serif">${PROJECTION_KB.indexOf(info) + 1}. ${info.zhName}（${chinaScope ? '中国' : '世界'}）</text>
    <g transform="translate(0,22)">
      <path d="${L.sphere}" fill="#fbfcfa" stroke="#c9d9c9"/>
      <path d="${L.land}" fill="#e9f2e3" stroke="#b9cfb2" stroke-width="0.6"/>
      <path d="${L.grat}" fill="none" stroke="#a9c8b0" stroke-width="0.6" stroke-dasharray="2 3"/>
      ${labels}
      <!-- 指北针 -->
      <g transform="translate(13 15)">
        <text x="0" y="-7" text-anchor="middle" font-size="6.5" font-weight="bold" fill="#2e5c40" paint-order="stroke" stroke="#fff">N</text>
        <path d="M0,-5 L3.2,4.8 L0,2.4 L-3.2,4.8 Z" fill="#2e5c40" stroke="#fff" stroke-width="0.5"/>
      </g>
      <!-- 比例尺 -->
      <g transform="translate(8 ${H - 9})">
        <rect x="0" y="0" width="${(sb.px / 2).toFixed(1)}" height="2.6" fill="#374f3f"/>
        <rect x="${(sb.px / 2).toFixed(1)}" y="0" width="${(sb.px / 2).toFixed(1)}" height="2.6" fill="#ffffff"/>
        <rect x="0" y="0" width="${sb.px.toFixed(1)}" height="2.6" fill="none" stroke="#374f3f" stroke-width="0.5"/>
        <text x="${(sb.px / 2).toFixed(1)}" y="-2.5" text-anchor="middle" font-size="5.5" fill="#374f3f" paint-order="stroke" stroke="rgba(255,255,255,.85)">${sb.km} km</text>
        <text x="0" y="8" text-anchor="middle" font-size="5.5" fill="#374f3f" paint-order="stroke" stroke="rgba(255,255,255,.85)">0</text>
      </g>
      <!-- 图例 -->
      <g transform="translate(${W - 56 - 4} ${H - 31 - 4})">
        <rect width="56" height="31" rx="2.5" fill="rgba(255,255,255,.88)" stroke="#cfe0d4" stroke-width="0.6"/>
        <text x="4" y="7.5" font-size="6" font-weight="bold" fill="#2e5c40">图例</text>
        <g transform="translate(0 11)">
          <rect x="4" y="1.5" width="8" height="5" fill="#e9f2e3" stroke="#b9cfb2" stroke-width="0.6"/>
          <text x="15" y="6.5" font-size="5.5" fill="#3d5a45">陆地</text>
        </g>
        <g transform="translate(0 19.5)">
          <line x1="4" y1="4" x2="12" y2="4" stroke="#a9c8b0" stroke-width="0.9" stroke-dasharray="2 2"/>
          <text x="15" y="6.5" font-size="5.5" fill="#3d5a45">经纬网</text>
        </g>
      </g>
    </g>
  </g>`
}

const groups = [
  { title: '中国地图投影', items: PROJECTION_KB.filter((p) => p.scope === 'china') },
  { title: '世界地图投影', items: PROJECTION_KB.filter((p) => p.scope === 'world') },
]
let y = 0
const parts = []
for (const g of groups) {
  parts.push(`<text x="4" y="${y + 18}" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1f7a4d">${g.title} · ${g.items.length} 幅</text>`)
  y += 26
  g.items.forEach((info, i) => {
    parts.push(cell(info, (i % COLS) * (W + 10), y + Math.floor(i / COLS) * (H + 32)))
  })
  y += Math.ceil(g.items.length / COLS) * (H + 32) + 10
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * (W + 10)}" height="${y}" font-family="sans-serif">
<rect width="100%" height="100%" fill="#f4f8f5"/>
${parts.join('\n')}
</svg>`

writeFileSync(new URL('./gallery-groups-check.svg', import.meta.url), svg)
console.log(
  'written test-fixtures/gallery-groups-check.svg;',
  groups.map((g) => `${g.title}=${g.items.length}`).join(', '),
)
