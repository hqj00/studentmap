<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { PROJECTION_KB } from '@/modules/projection/presets'
import { PROPERTY_LABELS, CATEGORY_LABELS } from '@/modules/projection/types'
import type { DistortionProperty, ProjectionCategory, ProjectionInfo, RegionExtent } from '@/modules/projection/types'
import { buildPreviewLayers, PREVIEW_STYLE } from '@/modules/projection/d3Factory'
import { suitabilityAt } from '@/modules/projection/ruleEngine'
import { effectiveParams, gaussKrugerCentral } from '@/modules/projection/params'
import ZoomableMap from '@/components/ZoomableMap.vue'

// 默认总览：世界四至渲染经纬网缩略图（spec/07 §2.3）
const WORLD: RegionExtent = { minLon: -180, minLat: -90, maxLon: 180, maxLat: 90 }
const W = 280
const H = 180

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

const cards = computed(() => {
  const extent = coordValid.value ? coordExtent.value : WORLD
  return PROJECTION_KB.filter(
    (info) =>
      (filter.category === 'all' || info.category === filter.category) &&
      (filter.property === 'all' || info.property === filter.property),
  ).map((info) => {
    // 坐标模式下传入中心点，图面上以圆点标出（spec/07 §2.5）
    const layers = buildPreviewLayers(info, extent, W, H, coordValid.value ? [coord.lon, coord.lat] : undefined)
    const card: {
      info: ProjectionInfo
      no: number
      sphere: string
      land: string
      grat: string
      extentD: string
      tissot: string[]
      markerPt: [number, number] | null
      rule?: { hit: boolean; text: string }
      paramsText?: string
    } = {
      info,
      no: PROJECTION_KB.indexOf(info) + 1,
      sphere: layers.sphere,
      land: layers.land,
      grat: layers.grat,
      // 坐标模式下叠加范围框与 Tissot，直观呈现该位置的变形
      extentD: coordValid.value ? layers.extentD : '',
      tissot: coordValid.value ? layers.tissot : [],
      markerPt: layers.markerPt,
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
  })
})
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
    <template v-if="coord.enabled">
      <el-input-number v-model="coord.lon" :min="-180" :max="180" :step="1" placeholder="经度" class="ctl-num" />
      <el-input-number v-model="coord.lat" :min="-90" :max="90" :step="1" placeholder="纬度" class="ctl-num" />
    </template>
    <span class="ctl-count">符合筛选：{{ cards.length }} / 18</span>
  </div>
  <p v-if="coord.enabled && !coordValid" class="ctl-warn">请填写合法中心坐标（经度 -180~180，纬度 -90~90）</p>

  <div class="gallery-grid">
    <div v-for="c in cards" :key="c.info.id" class="gallery-item">
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
        :label="`${c.info.zhName}${coordValid ? '（按坐标定向，可缩放拖拽）' : '世界全图（可缩放拖拽）'}`"
      >
        <path :d="c.sphere" v-bind="PREVIEW_STYLE.sphere" />
        <path :d="c.land" v-bind="PREVIEW_STYLE.land" />
        <path :d="c.grat" v-bind="PREVIEW_STYLE.grat" />
        <path v-if="c.extentD" :d="c.extentD" v-bind="PREVIEW_STYLE.extent" />
        <path v-for="(d, i) in c.tissot" :key="i" :d="d" v-bind="PREVIEW_STYLE.tissot" />
        <!-- 坐标标记点：光晕 + 实心点（spec/07 §2.5） -->
        <g v-if="c.markerPt">
          <circle :cx="c.markerPt[0]" :cy="c.markerPt[1]" r="7" fill="rgba(230, 126, 34, 0.25)" />
          <circle :cx="c.markerPt[0]" :cy="c.markerPt[1]" r="3" fill="#e67e22" stroke="#fff" stroke-width="1.2" />
        </g>
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
.ctl-coord {
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
