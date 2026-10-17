// 预览健全性检查：各投影 fitExtent 后，区域角点应落在画幅内（坐标为像素级，非退化）
import { createProjection, buildPreviewLayers } from './d3Factory.bundle.mjs'
import { findProjection, resolveExtent, PROJECTION_KB, REGION_PRESETS } from './presets.bundle.mjs'

const W = 420
const H = 260
let fail = 0

for (const preset of REGION_PRESETS) {
  for (const info of PROJECTION_KB) {
    const proj = createProjection(info, preset.extent, W, H)
    const c = proj([(preset.extent.minLon + preset.extent.maxLon) / 2, (preset.extent.minLat + preset.extent.maxLat) / 2])
    const L = buildPreviewLayers(info, preset.extent, W, H)
    const centerOk = c && Number.isFinite(c[0]) && Number.isFinite(c[1]) && c[0] >= -W && c[0] <= 2 * W && c[1] >= -H && c[1] <= 2 * H
    const tissotOk = L.tissot.length > 0
    const scaleOk = proj.scale() > 5 // 退化拟合的阈值
    if (!(centerOk && tissotOk && scaleOk)) {
      fail++
      console.log(`FAIL ${preset.id} × ${info.id}: center=${JSON.stringify(c)}, scale=${proj.scale().toFixed(3)}, tissot=${L.tissot.length}`)
    }
  }
}
console.log(fail === 0 ? `全部 ${REGION_PRESETS.length} 区域 × ${PROJECTION_KB.length} 投影组合健全` : `${fail} 个组合异常`)
