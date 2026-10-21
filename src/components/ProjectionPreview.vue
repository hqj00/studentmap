<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProjectionInfo, RegionExtent } from '@/modules/projection/types'
import {
  buildPreviewLayers,
  buildPreviewDecorations,
  buildStandaloneSvg,
  isWorldExtent,
  PREVIEW_STYLE,
} from '@/modules/projection/d3Factory'

const props = withDefaults(defineProps<{ info: ProjectionInfo; extent: RegionExtent; width?: number; height?: number }>(), {
  width: 420,
  height: 260,
})

/** 预览图层：球面底 + 经纬网 + 制图范围绿框 + Tissot 变形椭圆（spec/02 §6） */
const layers = computed(() => buildPreviewLayers(props.info, props.extent, props.width, props.height))
/** 图面整饰（spec/09 §3，推荐方案预览同步）：经纬度标注 + 比例尺换算；世界范围沿赤道/中央经线标注 */
const deco = computed(() =>
  buildPreviewDecorations(props.info, props.extent, props.width, props.height, {
    clipToExtent: !isWorldExtent(props.extent),
  }),
)

/** 比例尺（spec/09 §3.3）：取最接近约 72px 的整千米数（预览幅面比总览缩略图大，目标长度相应放大） */
const SCALE_KM = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]
function scaleBar(mmp: number): { km: number; px: number } {
  let best: { km: number; px: number } | null = null
  for (const km of SCALE_KM) {
    const px = (km * 1000) / mmp
    if (px > 120) break
    if (!best || Math.abs(px - 72) < Math.abs(best.px - 72)) best = { km, px }
  }
  return best ?? { km: SCALE_KM[0], px: (SCALE_KM[0] * 1000) / mmp }
}

/** 图例行（spec/09 §3.4）：随实际绘制内容动态增减 */
type LegendRow = { kind: 'land' | 'grat' | 'extent' | 'tissot'; text: string }
const legendRows = computed<LegendRow[]>(() => {
  const rows: LegendRow[] = [
    { kind: 'land', text: '陆地轮廓' },
    { kind: 'grat', text: '经纬网' },
  ]
  if (layers.value.extentD) rows.push({ kind: 'extent', text: '制图范围' })
  if (layers.value.tissot.length) rows.push({ kind: 'tissot', text: '变形椭圆' })
  return rows
})
const LEGEND_W = 74
const legendH = computed(() => 16 + legendRows.value.length * 12)

/**
 * 图面整饰样式全部内联（不依赖 scoped CSS）：导出的独立 SVG / PNG 因而自带样式。
 * 尺寸按预览幅面（420×260）取总览缩略图（280×180）的约 1.5 倍。
 */
const FONT = 'system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif'
const DECOR = {
  gratLabel: { fill: '#4e7a5c', 'font-size': 7, 'paint-order': 'stroke', stroke: '#fbfcfa', 'stroke-width': 1.6, 'font-family': FONT },
  northText: { fill: '#2e5c40', 'font-size': 9, 'font-weight': 'bold', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 1.2, 'font-family': FONT },
  northArrow: { fill: '#2e5c40', stroke: '#fff', 'stroke-width': 0.6 },
  northGroup: { 'font-family': FONT },
  scaleBarA: { fill: '#374f3f' },
  scaleBarB: { fill: '#fff' },
  scaleFrame: { fill: 'none', stroke: '#374f3f', 'stroke-width': 0.6 },
  scaleText: { fill: '#374f3f', 'font-size': 8, 'paint-order': 'stroke', stroke: 'rgba(255,255,255,0.85)', 'stroke-width': 1.4, 'font-family': FONT },
  legendFrame: { fill: 'rgba(255,255,255,0.9)', stroke: '#cfe0d4', 'stroke-width': 0.7 },
  legendTitle: { fill: '#2e5c40', 'font-size': 8.5, 'font-weight': 'bold', 'font-family': FONT },
  legendText: { fill: '#3d5a45', 'font-size': 7.5, 'font-family': FONT },
  lgGrat: { stroke: '#8bab98', 'stroke-width': 1.1, 'stroke-dasharray': '2.5 2.5' },
  lgTissot: { fill: 'rgba(230, 126, 34, 0.28)', stroke: '#e67e22', 'stroke-width': 0.7 },
} as const

const svgEl = ref<SVGSVGElement>()

/** 序列化当前渲染结果为独立 SVG 文本（样式内联在元素属性上，天然自包含） */
function standaloneSvg(): string {
  return buildStandaloneSvg(svgEl.value?.innerHTML ?? '', props.width, props.height)
}

function saveBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

function downloadSvg() {
  saveBlob(new Blob([standaloneSvg()], { type: 'image/svg+xml' }), `${props.info.id}-预览.svg`)
}

async function downloadPng() {
  const url = URL.createObjectURL(new Blob([standaloneSvg()], { type: 'image/svg+xml' }))
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('SVG 栅格化失败'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = props.width * 2
    canvas.height = props.height * 2
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (blob) saveBlob(blob, `${props.info.id}-预览.png`)
  } finally {
    URL.revokeObjectURL(url)
  }
}
</script>

<template>
  <div class="preview-wrap">
    <svg
      ref="svgEl"
      class="preview"
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="`0 0 ${width} ${height}`"
      :style="{ aspectRatio: `${width} / ${height}` }"
      role="img"
      :aria-label="`${info.zhName}预览（含经纬网、比例尺、图例与指北针）`"
    >
      <path :d="layers.sphere" v-bind="PREVIEW_STYLE.sphere" />
      <path :d="layers.land" v-bind="PREVIEW_STYLE.land" />
      <path :d="layers.grat" v-bind="PREVIEW_STYLE.grat" />
      <!-- 经纬网标注（spec/09 §3.1） -->
      <text
        v-for="(t, i) in deco.gratLabels"
        :key="`g${i}`"
        :x="t.x"
        :y="t.y"
        :text-anchor="t.anchor"
        v-bind="DECOR.gratLabel"
      >
        {{ t.text }}
      </text>
      <path v-if="layers.extentD" :d="layers.extentD" v-bind="PREVIEW_STYLE.extent" />
      <path v-for="(d, i) in layers.tissot" :key="i" :d="d" v-bind="PREVIEW_STYLE.tissot" />

      <!-- 图面整饰（spec/09 §3）：指北针 / 比例尺 / 图例，导出 SVG/PNG 时一并带走 -->
      <g transform="translate(18 20)" v-bind="DECOR.northGroup">
        <text x="0" y="-9" text-anchor="middle" v-bind="DECOR.northText">N</text>
        <path d="M0,-6 L4,6.5 L0,3.2 L-4,6.5 Z" v-bind="DECOR.northArrow" />
      </g>
      <g :transform="`translate(10 ${height - 11})`">
        <rect x="0" y="0" :width="scaleBar(deco.metersPerPixel).px / 2" height="3.4" v-bind="DECOR.scaleBarA" />
        <rect
          :x="scaleBar(deco.metersPerPixel).px / 2"
          y="0"
          :width="scaleBar(deco.metersPerPixel).px / 2"
          height="3.4"
          v-bind="DECOR.scaleBarB"
        />
        <rect x="0" y="0" :width="scaleBar(deco.metersPerPixel).px" height="3.4" v-bind="DECOR.scaleFrame" />
        <text :x="scaleBar(deco.metersPerPixel).px / 2" y="-3" text-anchor="middle" v-bind="DECOR.scaleText">
          {{ scaleBar(deco.metersPerPixel).km }} km
        </text>
        <text x="0" y="11" text-anchor="middle" v-bind="DECOR.scaleText">0</text>
      </g>
      <g :transform="`translate(${width - LEGEND_W - 6} ${height - legendH - 6})`">
        <rect :width="LEGEND_W" :height="legendH" rx="3" v-bind="DECOR.legendFrame" />
        <text x="6" y="10.5" v-bind="DECOR.legendTitle">图例</text>
        <g v-for="(r, i) in legendRows" :key="r.kind" :transform="`translate(0 ${16 + i * 12})`">
          <rect v-if="r.kind === 'land'" x="6" y="1.5" width="11" height="6.5" v-bind="PREVIEW_STYLE.land" />
          <line v-else-if="r.kind === 'grat'" x1="6" y1="5" x2="17" y2="5" v-bind="DECOR.lgGrat" />
          <rect v-else-if="r.kind === 'extent'" x="6" y="1.5" width="11" height="6.5" v-bind="PREVIEW_STYLE.extent" />
          <circle v-else cx="11.5" cy="5" r="3.4" v-bind="DECOR.lgTissot" />
          <text x="21" y="9" v-bind="DECOR.legendText">{{ r.text }}</text>
        </g>
      </g>
    </svg>
    <div class="preview-actions">
      <el-button text size="small" type="primary" @click="downloadSvg">下载 SVG</el-button>
      <el-button text size="small" type="primary" @click="downloadPng">下载 PNG</el-button>
    </div>
  </div>
</template>

<style scoped>
.preview-wrap {
  position: relative;
}
.preview {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  border: 1px solid #e0efe5;
  background: #fbfcfa;
}
.preview-actions {
  position: absolute;
  right: 6px;
  top: 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.85);
}
</style>
