<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { PROJECTION_KB, REGION_PRESETS } from '@/modules/projection/presets'
import { PROPERTY_LABELS, CATEGORY_LABELS } from '@/modules/projection/types'
import type { DistortionProperty, ProjectionCategory, ProjectionInfo, RegionExtent } from '@/modules/projection/types'
import {
  buildPreviewLayers,
  buildPreviewDecorations,
  PREVIEW_STYLE,
  worldDisplayNote,
  type GratLabel,
} from '@/modules/projection/d3Factory'
import { suitabilityAt } from '@/modules/projection/ruleEngine'
import { effectiveParams, gaussKrugerCentral } from '@/modules/projection/params'
import ZoomableMap from '@/components/ZoomableMap.vue'

// 两个模块 = 同 18 种投影分别在「中国全图」与「世界全图」两种成图区域上的渲染（spec/09 §2）
const WORLD: RegionExtent = { minLon: -180, minLat: -90, maxLon: 180, maxLat: 90 }
const CHINA: RegionExtent = REGION_PRESETS.find((p) => p.id === 'china')!.extent
const W = 280
const H = 180

/** 成图区域模块定义（spec/09 §2.2）：中国组裁剪到中国全图四至，世界组走原有展示带退化规则 */
interface RegionGroupDef {
  key: 'china' | 'world'
  title: string
  extent: RegionExtent
  clip: boolean
}
const REGION_GROUPS: RegionGroupDef[] = [
  { key: 'china', title: '中国地图投影', extent: CHINA, clip: true },
  { key: 'world', title: '世界地图投影', extent: WORLD, clip: false },
]

/** 分类筛选（spec/07 §2.4）：投影面类别 × 变形性质 */
const filter = reactive({
  category: 'all' as 'all' | ProjectionCategory,
  property: 'all' as 'all' | DistortionProperty,
})
const categoryOptions = [
  { value: 'all', label: '全部类别' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
]
const propertyOptions = [
  { value: 'all', label: '全部性质' },
  ...Object.entries(PROPERTY_LABELS).map(([value, label]) => ({ value, label })),
]

/** 按坐标查看（spec/07 §2.4）：输入中心经纬度，缩略图定向到该点并给出规则结论 */
const coord = reactive({ enabled: false, lon: 105, lat: 35 })
/** 移动开关（spec/07 §2.5）：默认固定，仅按钮缩放；开启后才允许拖拽/滚轮 */
const allowMove = ref(false)
const coordValid = computed(
  () =>
    coord.enabled &&
    Number.isFinite(coord.lon) &&
    Number.isFinite(coord.lat) &&
    coord.lon >= -180 &&
    coord.lon <= 180 &&
    coord.lat >= -90 &&
    coord.lat <= 90,
)

/** 以坐标为中心的制图范围（±55° 经 / ±35° 纬，夹取到合法范围）：既看得出位置效应，又保持投影形态可辨认 */
const coordExtent = computed<RegionExtent>(() => ({
  minLon: Math.max(-180, coord.lon - 55),
  maxLon: Math.min(180, coord.lon + 55),
  minLat: Math.max(-90, coord.lat - 35),
  maxLat: Math.min(90, coord.lat + 35),
}))

const fmtLon = (v: number) => `${Math.abs(v)}°${v >= 0 ? 'E' : 'W'}`
const fmtLat = (v: number) => `${Math.abs(v)}°${v >= 0 ? 'N' : 'S'}`

/** 筛选后的投影列表：两个模块共用同一份（每种投影在中国、世界各出现一次） */
const filtered = computed(() =>
  PROJECTION_KB.filter(
    (info) =>
      (filter.category === 'all' || info.category === filter.category) &&
      (filter.property === 'all' || info.property === filter.property),
  ),
)

interface Card {
  info: ProjectionInfo
  no: number
  sphere: string
  land: string
  grat: string
  /** 经纬网经纬度标注（spec/09 §3.1，随图面缩放） */
  gratLabels: GratLabel[]
  /** 投影中心处米/像素（缩放级别 1），比例尺换算用（spec/09 §3.3） */
  mmp: number
  extentD: string
  tissot: string[]
  markerPt: [number, number] | null
  /** 缩略图副标题（成图范围说明） */
  scopeNote: string
  rule?: { hit: boolean; text: string }
  paramsText?: string
}

/** 按模块区域渲染一张缩略图卡片；按坐标查看时两模块统一用坐标范围（spec/07 §2.4） */
function buildCard(info: ProjectionInfo, def: RegionGroupDef): Card {
  const extent = coordValid.value ? coordExtent.value : def.extent
  const clip = !coordValid.value && def.clip
  // 坐标模式下传入中心点，图面上以圆点标出（spec/07 §2.5）
  const layers = buildPreviewLayers(info, extent, W, H, coordValid.value ? [coord.lon, coord.lat] : undefined, {
    clipToExtent: clip,
  })
  const deco = buildPreviewDecorations(info, extent, W, H, { clipToExtent: clip })
  const card: Card = {
    info,
    no: PROJECTION_KB.indexOf(info) + 1,
    sphere: layers.sphere,
    land: layers.land,
    grat: layers.grat,
    gratLabels: deco.gratLabels,
    mmp: deco.metersPerPixel,
    // 坐标模式下叠加范围框与 Tissot，直观呈现该位置的变形
    extentD: coordValid.value ? layers.extentD : '',
    tissot: coordValid.value ? layers.tissot : [],
    markerPt: layers.markerPt,
    scopeNote: coordValid.value
      ? '按坐标定向'
      : def.key === 'china'
        ? '中国全图（含南海诸岛）'
        : (worldDisplayNote(info) ?? '世界全图'),
  }
  if (coordValid.value) {
    card.rule = suitabilityAt(info, coord.lat)
    const p = effectiveParams(info, extent)
    const parts = [`中央经线 ${fmtLon(p.centralMeridian)}`]
    if (p.standardParallels?.length) parts.push(`标准纬线 ${p.standardParallels.map(fmtLat).join(' / ')}`)
    if (info.id === 'transverse-mercator') {
      const band = Math.floor(coord.lon / 6) + 1
      parts.push(`该经度属 6° 带第 ${band} 带（带中央经线 ${fmtLon(gaussKrugerCentral(coord.lon))}）`)
    }
    card.paramsText = parts.join('；')
  }
  return card
}

/** 分组（spec/09 §2.2）：每个模块都是同 18 种投影，只是成图区域不同；筛选为空时整组隐藏 */
const groups = computed(() =>
  REGION_GROUPS.map((def) => ({
    key: def.key,
    title: def.title,
    items: filtered.value.map((info) => buildCard(info, def)),
  })),
)

/** 比例尺（spec/09 §3.3）：取最接近约 52px 的整千米数；zoom 为当前缩放倍率，任意级别下长度重算仍正确 */
const SCALE_KM = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]
function scaleBar(mmp: number, zoom: number): { km: number; px: number } {
  let best: { km: number; px: number } | null = null
  for (const km of SCALE_KM) {
    const px = ((km * 1000) / mmp) * zoom
    if (px > 92) break
    if (!best || Math.abs(px - 52) < Math.abs(best.px - 52)) best = { km, px }
  }
  return best ?? { km: SCALE_KM[0], px: ((SCALE_KM[0] * 1000) / mmp) * zoom }
}

/** 图例行（spec/09 §3.4）：常驻陆地/经纬网，按坐标查看时追加制图范围/变形椭圆/标记点 */
type LegendRow = { kind: 'land' | 'grat' | 'extent' | 'tissot' | 'marker'; text: string }
const legendRows = computed<LegendRow[]>(() => {
  const rows: LegendRow[] = [
    { kind: 'land', text: '陆地' },
    { kind: 'grat', text: '经纬网' },
  ]
  if (coordValid.value) {
    rows.push({ kind: 'extent', text: '制图范围' }, { kind: 'tissot', text: '变形椭圆' }, { kind: 'marker', text: '标记点' })
  }
  return rows
})
const LEGEND_W = 56
const legendH = computed(() => 11 + legendRows.value.length * 8.5)
</script>

<template>
  <div class="gallery-controls">
    <el-select v-model="filter.category" class="ctl-select">
      <el-option v-for="o in categoryOptions" :key="o.value" :value="o.value" :label="o.label" />
    </el-select>
    <el-select v-model="filter.property" class="ctl-select">
      <el-option v-for="o in propertyOptions" :key="o.value" :value="o.value" :label="o.label" />
    </el-select>
    <el-checkbox v-model="coord.enabled" class="ctl-coord">按坐标查看</el-checkbox>
    <el-checkbox v-model="allowMove" class="ctl-move">允许拖动</el-checkbox>
    <template v-if="coord.enabled">
      <el-input-number v-model="coord.lon" :min="-180" :max="180" :step="1" placeholder="经度" class="ctl-num" />
      <el-input-number v-model="coord.lat" :min="-90" :max="90" :step="1" placeholder="纬度" class="ctl-num" />
    </template>
    <span class="ctl-count">符合筛选：{{ filtered.length }} / 18（每个模块）</span>
  </div>
  <p v-if="coord.enabled && !coordValid" class="ctl-warn">请填写合法中心坐标（经度 -180~180，纬度 -90~90）</p>

  <template v-for="g in groups" :key="g.key">
    <section v-if="g.items.length" class="gallery-group">
      <h3 class="group-title">
        {{ g.title }}<span class="group-count">· {{ g.items.length }} 幅</span>
      </h3>
      <div class="gallery-grid">
        <div v-for="c in g.items" :key="c.info.id" class="gallery-item">
          <div class="item-head">
            <span class="item-no">{{ c.no }}</span>
            <div class="item-names">
              <b>{{ c.info.zhName }}</b>
              <span class="item-en">{{ c.info.name }}</span>
            </div>
          </div>
          <p class="item-tags">
            <el-tag size="small">{{ CATEGORY_LABELS[c.info.category] }}</el-tag>
            <el-tag size="small" type="warning">{{ PROPERTY_LABELS[c.info.property] }}</el-tag>
          </p>
          <ZoomableMap
            :width="W"
            :height="H"
            :movable="allowMove"
            :label="`${c.info.zhName}${c.scopeNote}（可缩放）`"
          >
            <path :d="c.sphere" v-bind="PREVIEW_STYLE.sphere" />
            <path :d="c.land" v-bind="PREVIEW_STYLE.land" />
            <path :d="c.grat" v-bind="PREVIEW_STYLE.grat" />
            <!-- 经纬网标注（spec/09 §3.1）：随图面缩放的地图内容 -->
            <text
              v-for="(t, i) in c.gratLabels"
              :key="`g${i}`"
              :x="t.x"
              :y="t.y"
              :text-anchor="t.anchor"
              class="grat-label"
            >
              {{ t.text }}
            </text>
            <path v-if="c.extentD" :d="c.extentD" v-bind="PREVIEW_STYLE.extent" />
            <path v-for="(d, i) in c.tissot" :key="i" :d="d" v-bind="PREVIEW_STYLE.tissot" />
            <!-- 坐标标记点：光晕 + 实心点（spec/07 §2.5） -->
            <g v-if="c.markerPt">
              <circle :cx="c.markerPt[0]" :cy="c.markerPt[1]" r="7" fill="rgba(230, 126, 34, 0.25)" />
              <circle :cx="c.markerPt[0]" :cy="c.markerPt[1]" r="3" fill="#e67e22" stroke="#fff" stroke-width="1.2" />
            </g>
            <!-- 图面整饰（spec/09 §3）：指北针 / 比例尺 / 图例，不随缩放平移 -->
            <template #overlay="{ scale }">
              <g transform="translate(13 15)" class="north-arrow">
                <text x="0" y="-7" text-anchor="middle" class="north-text">N</text>
                <path d="M0,-5 L3.2,4.8 L0,2.4 L-3.2,4.8 Z" />
              </g>
              <g :transform="`translate(8 ${H - 9})`" class="scale-bar">
                <rect x="0" y="0" :width="scaleBar(c.mmp, scale).px / 2" height="2.6" class="sb-a" />
                <rect
                  :x="scaleBar(c.mmp, scale).px / 2"
                  y="0"
                  :width="scaleBar(c.mmp, scale).px / 2"
                  height="2.6"
                  class="sb-b"
                />
                <rect x="0" y="0" :width="scaleBar(c.mmp, scale).px" height="2.6" class="sb-frame" />
                <text :x="scaleBar(c.mmp, scale).px / 2" y="-2.5" text-anchor="middle" class="sb-text">
                  {{ scaleBar(c.mmp, scale).km }} km
                </text>
                <text x="0" y="8" text-anchor="middle" class="sb-text">0</text>
              </g>
              <g :transform="`translate(${W - LEGEND_W - 4} ${H - legendH - 4})`" class="legend-box">
                <rect width="56" :height="legendH" rx="2.5" class="lg-frame" />
                <text x="4" y="7.5" class="lg-title">图例</text>
                <g v-for="(r, i) in legendRows" :key="r.kind" :transform="`translate(0 ${11 + i * 8.5})`">
                  <rect v-if="r.kind === 'land'" x="4" y="1.5" width="8" height="5" class="lg-land" />
                  <line v-else-if="r.kind === 'grat'" x1="4" y1="4" x2="12" y2="4" class="lg-grat" />
                  <rect v-else-if="r.kind === 'extent'" x="4" y="1.5" width="8" height="5" class="lg-extent" />
                  <circle v-else-if="r.kind === 'tissot'" cx="8" cy="4" r="2.6" class="lg-tissot" />
                  <circle v-else cx="8" cy="4" r="2" class="lg-marker" />
                  <text x="15" y="6.5" class="lg-text">{{ r.text }}</text>
                </g>
              </g>
            </template>
          </ZoomableMap>
          <template v-if="c.rule">
            <p class="item-rule" :class="{ miss: !c.rule.hit }">
              <b>{{ c.rule.hit ? '✓ 规则命中：' : '✗ 规则未命中：' }}</b>{{ c.rule.text }}
            </p>
            <p class="item-params"><b>参数：</b>{{ c.paramsText }}</p>
          </template>
          <p class="item-reason"><b>推荐缘由：</b>{{ c.info.suitableFor }}；{{ c.info.pros[0] }}</p>
        </div>
      </div>
    </section>
  </template>
</template>

<style scoped>
.gallery-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.ctl-select {
  width: 150px;
}
.ctl-coord,
.ctl-move {
  margin-left: 4px;
}
.ctl-num {
  width: 130px;
}
.ctl-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.ctl-warn {
  margin: -6px 0 10px;
  font-size: 12px;
  color: var(--el-color-danger);
}
.gallery-group {
  margin-bottom: 18px;
}
.group-title {
  margin: 4px 0 10px;
  font-size: 15px;
  color: #1f7a4d;
  border-left: 4px solid #2e825b;
  padding-left: 8px;
}
.group-count {
  margin-left: 6px;
  font-size: 12px;
  font-weight: normal;
  color: var(--el-text-color-secondary);
}
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.gallery-item {
  border: 1px solid #e0efe5;
  border-radius: 10px;
  padding: 10px 12px 12px;
  background: #fbfefc;
}
.item-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.item-no {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #2e825b;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.item-names {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.item-names b {
  color: #1f7a4d;
  font-size: 14px;
}
.item-en {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.item-tags {
  margin: 8px 0 6px;
  display: flex;
  gap: 6px;
}
.item-rule {
  margin: 8px 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: #2e825b;
}
.item-rule.miss {
  color: #b26a3c;
}
.item-params {
  margin: 4px 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}
.item-reason {
  margin: 8px 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

/* 图面整饰样式（spec/09 §3） */
.grat-label {
  font-size: 5px;
  fill: #4e7a5c;
  paint-order: stroke;
  stroke: #fbfcfa;
  stroke-width: 1.2px;
}
.north-arrow path {
  fill: #2e5c40;
  stroke: #fff;
  stroke-width: 0.5;
}
.north-text {
  font-size: 6.5px;
  font-weight: bold;
  fill: #2e5c40;
  paint-order: stroke;
  stroke: #fff;
  stroke-width: 1px;
}
.scale-bar .sb-a {
  fill: #374f3f;
}
.scale-bar .sb-b {
  fill: #fff;
}
.scale-bar .sb-frame {
  fill: none;
  stroke: #374f3f;
  stroke-width: 0.5;
}
.sb-text {
  font-size: 5.5px;
  fill: #374f3f;
  paint-order: stroke;
  stroke: rgba(255, 255, 255, 0.85);
  stroke-width: 1px;
}
.legend-box .lg-frame {
  fill: rgba(255, 255, 255, 0.88);
  stroke: #cfe0d4;
  stroke-width: 0.6;
}
.lg-title {
  font-size: 6px;
  font-weight: bold;
  fill: #2e5c40;
}
.lg-text {
  font-size: 5.5px;
  fill: #3d5a45;
}
.lg-land {
  fill: #e9f2e3;
  stroke: #b9cfb2;
  stroke-width: 0.6;
}
.lg-grat {
  stroke: #8bab98;
  stroke-width: 0.9;
  stroke-dasharray: 2.5 2.5;
}
.lg-extent {
  fill: rgba(59, 162, 114, 0.12);
  stroke: #2e825b;
  stroke-width: 0.8;
}
.lg-tissot {
  fill: rgba(230, 126, 34, 0.28);
  stroke: #e67e22;
  stroke-width: 0.6;
}
.lg-marker {
  fill: #e67e22;
  stroke: #fff;
  stroke-width: 0.6;
}

/* 响应式（spec/04 §9）：平板 2 列、手机 1 列 */
@media (max-width: 1080px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
  .ctl-select,
  .ctl-num {
    width: 100%;
  }
  .ctl-count {
    margin-left: 0;
  }
}
</style>
