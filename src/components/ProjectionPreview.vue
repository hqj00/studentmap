<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProjectionInfo, RegionExtent } from '@/modules/projection/types'
import { buildPreviewLayers, buildStandaloneSvg, PREVIEW_STYLE } from '@/modules/projection/d3Factory'

const props = withDefaults(defineProps<{ info: ProjectionInfo; extent: RegionExtent; width?: number; height?: number }>(), {
  width: 420,
  height: 260,
})

/** 预览图层：球面底 + 经纬网 + 制图范围绿框 + Tissot 变形椭圆（spec/02 §6） */
const layers = computed(() => buildPreviewLayers(props.info, props.extent, props.width, props.height))

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
      aria-label="投影预览"
    >
      <path :d="layers.sphere" v-bind="PREVIEW_STYLE.sphere" />
      <path :d="layers.land" v-bind="PREVIEW_STYLE.land" />
      <path :d="layers.grat" v-bind="PREVIEW_STYLE.grat" />
      <path v-if="layers.extentD" :d="layers.extentD" v-bind="PREVIEW_STYLE.extent" />
      <path v-for="(d, i) in layers.tissot" :key="i" :d="d" v-bind="PREVIEW_STYLE.tissot" />
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
