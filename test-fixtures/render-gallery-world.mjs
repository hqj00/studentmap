// 离线复刻 ProjectionGallery 的世界全图总览（WORLD 四至，280×180）—— 用于核对 issue：圆锥/TM 等投影世界图渲染异常
import { writeFileSync } from 'node:fs'
import { buildPreviewLayers } from './d3Factory.bundle.mjs'
import { PROJECTION_KB } from './presets.bundle.mjs'

const WORLD = { minLon: -180, minLat: -90, maxLon: 180, maxLat: 90 }
const W = 280
const H = 180
const COLS = 3

const cell = (info, x, y) => {
  const L = buildPreviewLayers(info, WORLD, W, H)
  return `<g transform="translate(${x},${y})">
    <rect width="${W}" height="${H + 22}" fill="#fff" stroke="#ccc"/>
    <text x="6" y="15" font-size="12" font-family="sans-serif">${PROJECTION_KB.indexOf(info) + 1}. ${info.zhName} (${info.id})</text>
    <g transform="translate(0,22)">
      <path d="${L.sphere}" fill="#fbfcfa" stroke="#c9d9c9"/>
      <path d="${L.land}" fill="#e9f2e3" stroke="#b9cfb2" stroke-width="0.6"/>
      <path d="${L.grat}" fill="none" stroke="#c3d8c4" stroke-width="0.5" stroke-dasharray="2 3"/>
    </g>
  </g>`
}

const rows = Math.ceil(PROJECTION_KB.length / COLS)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * (W + 10)}" height="${rows * (H + 32)}" font-family="sans-serif">
${PROJECTION_KB.map((info, i) => cell(info, (i % COLS) * (W + 10), Math.floor(i / COLS) * (H + 32))).join('\n')}
</svg>`

writeFileSync(new URL('./gallery-world-check.svg', import.meta.url), svg)
console.log('written test-fixtures/gallery-world-check.svg,', PROJECTION_KB.length, 'panels')
