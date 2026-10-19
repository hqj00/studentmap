// 生成临时核验页：渲染知识库全部 refImage（直接读打包后的真实数据）
import { mkdirSync, writeFileSync } from 'node:fs'
import { PROJECTION_KB } from './presets.bundle.mjs'

const items = PROJECTION_KB.filter((p) => p.refImage)
console.log(`知识库 ${PROJECTION_KB.length} 条，其中 refImage ${items.length} 条`)

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:sans-serif;background:#f5faf6;margin:0;padding:10px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.card{background:#fff;border:1px solid #ddd;border-radius:6px;padding:6px;text-align:center}
.card img{width:100%;height:130px;object-fit:contain}
.card div{font-size:11px;margin-top:4px}
</style></head><body><div class="grid">
${items.map((p) => `<div class="card"><img src="${p.refImage.url}" alt="${p.zhName}"><div>${p.zhName}</div></div>`).join('\n')}
</div></body></html>`

mkdirSync(new URL('../public', import.meta.url), { recursive: true })
writeFileSync(new URL('../public/refimg-test.html', import.meta.url), html)
console.log('written public/refimg-test.html')
