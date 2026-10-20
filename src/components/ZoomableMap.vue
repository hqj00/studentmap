<script setup lang="ts">
import { ref } from 'vue'

/**
 * 可缩放地图容器（spec/07 §2.5）：滚轮以指针为中心缩放、按住拖拽平移、右上角 +/−/重置。
 * 缩放平移只是 SVG 视图变换（transform），插槽内容（投影路径）不重新计算。
 */
const props = defineProps<{ width: number; height: number; label?: string }>()

const MIN_SCALE = 1
const MAX_SCALE = 16

const scale = ref(1)
const tx = ref(0)
const ty = ref(0)

/** 以 (mx, my) 为不动点把缩放乘 k 倍 */
function zoomBy(k: number, mx: number, my: number) {
  const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value * k))
  const r = s / scale.value
  tx.value = mx - (mx - tx.value) * r
  ty.value = my - (my - ty.value) * r
  scale.value = s
}

/** 指针位置 → viewBox 坐标 */
function localPoint(ev: WheelEvent | PointerEvent): [number, number] {
  const el = (ev.currentTarget as HTMLElement).closest('svg') as SVGSVGElement
  const rect = el.getBoundingClientRect()
  return [
    ((ev.clientX - rect.left) / rect.width) * props.width,
    ((ev.clientY - rect.top) / rect.height) * props.height,
  ]
}

function onWheel(ev: WheelEvent) {
  const [mx, my] = localPoint(ev)
  zoomBy(ev.deltaY < 0 ? 1.2 : 1 / 1.2, mx, my)
}

const dragging = ref<{ x: number; y: number } | null>(null)

function onPointerDown(ev: PointerEvent) {
  ;(ev.currentTarget as SVGSVGElement).setPointerCapture(ev.pointerId)
  dragging.value = { x: ev.clientX, y: ev.clientY }
}
function onPointerMove(ev: PointerEvent) {
  if (!dragging.value) return
  const el = ev.currentTarget as SVGSVGElement
  const rect = el.getBoundingClientRect()
  const kx = props.width / rect.width
  const ky = props.height / rect.height
  tx.value += (ev.clientX - dragging.value.x) * kx
  ty.value += (ev.clientY - dragging.value.y) * ky
  dragging.value = { x: ev.clientX, y: ev.clientY }
}
function onPointerUp(ev: PointerEvent) {
  ;(ev.currentTarget as SVGSVGElement).releasePointerCapture(ev.pointerId)
  dragging.value = null
}

function zoomIn() {
  zoomBy(1.4, props.width / 2, props.height / 2)
}
function zoomOut() {
  zoomBy(1 / 1.4, props.width / 2, props.height / 2)
}
function reset() {
  scale.value = 1
  tx.value = 0
  ty.value = 0
}
</script>

<template>
  <div class="zm-wrap">
    <svg
      class="zm-svg"
      :class="{ panning: dragging }"
      :viewBox="`0 0 ${width} ${height}`"
      :style="{ aspectRatio: `${width} / ${height}` }"
      role="img"
      :aria-label="label ?? '可缩放地图'"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <g :transform="`translate(${tx} ${ty}) scale(${scale})`">
        <slot />
      </g>
    </svg>
    <div class="zm-btns">
      <button type="button" title="放大" @click="zoomIn">＋</button>
      <button type="button" title="缩小" @click="zoomOut">－</button>
      <button type="button" title="重置视图" @click="reset">⟲</button>
    </div>
  </div>
</template>

<style scoped>
.zm-wrap {
  position: relative;
}
.zm-svg {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
  border: 1px solid #e0efe5;
  background: #fbfcfa;
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.zm-svg.panning {
  cursor: grabbing;
}
.zm-btns {
  position: absolute;
  right: 6px;
  top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.zm-btns button {
  width: 26px;
  height: 26px;
  border: 1px solid #dcefe3;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.92);
  color: #2e825b;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}
.zm-btns button:hover {
  background: #eef7f1;
  border-color: #8fceb0;
}
</style>
