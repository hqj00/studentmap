<script setup lang="ts">
import { computed } from 'vue'
import { PROJECTION_KB } from '@/modules/projection/presets'
import { PROPERTY_LABELS, CATEGORY_LABELS } from '@/modules/projection/types'
import { buildPreviewLayers, PREVIEW_STYLE } from '@/modules/projection/d3Factory'

// 总览统一用世界四至渲染经纬网缩略图（spec/07 §2.3）
const WORLD = { minLon: -180, minLat: -90, maxLon: 180, maxLat: 90 }
const W = 280
const H = 180

/** 每幅卡片：知识库条目 + 预计算的球面/经纬网路径（只算一次，避免响应式重复投影计算） */
const cards = computed(() =>
  PROJECTION_KB.map((info, i) => {
    const layers = buildPreviewLayers(info, WORLD, W, H)
    return { info, no: i + 1, sphere: layers.sphere, grat: layers.grat }
  }),
)
</script>

<template>
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
      <svg
        class="thumb"
        :viewBox="`0 0 ${W} ${H}`"
        role="img"
        :aria-label="`${c.info.zhName}世界全图经纬网`"
      >
        <path :d="c.sphere" v-bind="PREVIEW_STYLE.sphere" />
        <path :d="c.grat" v-bind="PREVIEW_STYLE.grat" />
      </svg>
      <p class="item-reason"><b>推荐缘由：</b>{{ c.info.suitableFor }}；{{ c.info.pros[0] }}</p>
    </div>
  </div>
</template>

<style scoped>
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
.thumb {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
  border: 1px solid #e0efe5;
  background: #f3faf6;
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
}
</style>
