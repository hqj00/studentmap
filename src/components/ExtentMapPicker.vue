<script setup lang="ts">
import { computed, ref } from 'vue'
import { geoEquirectangular, geoGraticule, geoPath } from 'd3-geo'
import type { RegionExtent } from '@/modules/projection/types'

const props = defineProps<{ modelValue: RegionExtent | null }>()
const emit = defineEmits<{ select: [e: RegionExtent] }>()

const W = 720
const H = 360
const proj = geoEquirectangular().fitExtent(
  [
    [0, 0],
    [W, H],
  ],
  { type: 'Sphere' },
)
const path = geoPath(proj)
const gratD = path(geoGraticule()()) ?? ''

// 经纬度标注（60° 经 / 30° 纬间隔）
const lonLabels = [-120, -60, 0, 60, 120].map((lon) => ({
  x: proj([lon, 0])?.[0] ?? 0,
  text: lon === 0 ? '0°' : `${Math.abs(lon)}°${lon > 0 ? 'E' : 'W'}`,
}))
const latLabels = [-60, -30, 0, 30, 60].map((lat) => ({
  y: (proj([0, lat])?.[1] ?? 0) + 4,
  text: lat === 0 ? '0°' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`,
}))

const drag = ref<{ x0: number; y0: number; x1: number; y1: number } | null>(null)

function localPoint(ev: MouseEvent) {
  const el = ev.currentTarget as SVGSVGElement
  const rect = el.getBoundingClientRect()
  return {
    x: ((ev.clientX - rect.left) / rect.width) * W,
    y: ((ev.clientY - rect.top) / rect.height) * H,
  }
}

function toLonLat(x: number, y: number): [number, number] {
  const p = proj.invert?.([x, y]) ?? [0, 0]
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
  // 保留 0.1°（spec/02 §8）
  return [
    Math.round(clamp(p[0], -180, 180) * 10) / 10,
    Math.round(clamp(p[1], -90, 90) * 10) / 10,
  ]
}

function down(ev: MouseEvent) {
  const p = localPoint(ev)
  drag.value = { x0: p.x, y0: p.y, x1: p.x, y1: p.y }
}
function move(ev: MouseEvent) {
  if (!drag.value) return
  const p = localPoint(ev)
  drag.value.x1 = p.x
  drag.value.y1 = p.y
}
function up() {
  if (!drag.value) return
  const { x0, y0, x1, y1 } = drag.value
  drag.value = null
  if (Math.abs(x1 - x0) < 8 || Math.abs(y1 - y0) < 8) return // 视为误触
  const [lonA, latA] = toLonLat(x0, y0)
  const [lonB, latB] = toLonLat(x1, y1)
  emit('select', {
    minLon: Math.min(lonA, lonB),
    minLat: Math.min(latA, latB),
    maxLon: Math.max(lonA, lonB),
    maxLat: Math.max(latA, latB),
  })
}

// 当前生效范围（预设或已框选）的绿色虚线回显
const currentRect = computed(() => {
  const v = props.modelValue
  if (!v) return null
  const tl = proj([v.minLon, v.maxLat])
  const br = proj([v.maxLon, v.minLat])
  if (!tl || !br) return null
  return { x: tl[0], y: tl[1], width: br[0] - tl[0], height: br[1] - tl[1] }
})

const dragRect = computed(() => {
  const d = drag.value
  if (!d) return null
  return {
    x: Math.min(d.x0, d.x1),
    y: Math.min(d.y0, d.y1),
    width: Math.abs(d.x1 - d.x0),
    height: Math.abs(d.y1 - d.y0),
  }
})
</script>

<template>
  <svg
    class="picker"
    :viewBox="`0 0 ${W} ${H}`"
    style="aspect-ratio: 2 / 1"
    @mousedown="down"
    @mousemove="move"
    @mouseup="up"
    @mouseleave="up"
  >
    <path :d="gratD" class="grat" />
    <text v-for="l in lonLabels" :key="`lon${l.text}`" :x="l.x" y="14" class="lbl" text-anchor="middle">{{ l.text }}</text>
    <text v-for="l in latLabels" :key="`lat${l.text}`" x="4" :y="l.y" class="lbl">{{ l.text }}</text>
    <rect v-if="currentRect" v-bind="currentRect" class="current" />
    <rect v-if="dragRect" v-bind="dragRect" class="dragging" />
  </svg>
</template>

<style scoped>
.picker {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  border: 1px solid #cfe5d8;
  background: #eef6f0;
  cursor: crosshair;
  user-select: none;
}
.grat {
  fill: none;
  stroke: #b9d9c6;
  stroke-width: 0.7;
}
.lbl {
  font-size: 11px;
  fill: #5b7267;
}
.current {
  fill: rgba(59, 162, 114, 0.1);
  stroke: #2e825b;
  stroke-width: 1.2;
  stroke-dasharray: 5 3;
}
.dragging {
  fill: rgba(59, 162, 114, 0.18);
  stroke: #2e825b;
  stroke-width: 1.4;
}
</style>
