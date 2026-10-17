<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectionInfo, RegionExtent } from '@/modules/projection/types'
import { buildPreviewLayers } from '@/modules/projection/d3Factory'

const props = withDefaults(defineProps<{ info: ProjectionInfo; extent: RegionExtent; width?: number; height?: number }>(), {
  width: 420,
  height: 260,
})

/** 预览图层：球面底 + 经纬网 + 制图范围绿框 + Tissot 变形椭圆（spec/02 §6） */
const layers = computed(() => buildPreviewLayers(props.info, props.extent, props.width, props.height))
</script>

<template>
  <svg class="preview" :viewBox="`0 0 ${width} ${height}`" role="img" aria-label="投影预览">
    <path :d="layers.sphere" class="sphere" />
    <path :d="layers.grat" class="grat" />
    <path v-if="layers.extentD" :d="layers.extentD" class="extent" />
    <path v-for="(d, i) in layers.tissot" :key="i" :d="d" class="tissot" />
  </svg>
</template>

<style scoped>
.preview {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  border: 1px solid #e0efe5;
  background: #f3faf6;
}
.sphere {
  fill: #eaf4ee;
  stroke: #7fb894;
  stroke-width: 1;
}
.grat {
  fill: none;
  stroke: #b9d9c6;
  stroke-width: 0.6;
}
.extent {
  fill: rgba(59, 162, 114, 0.12);
  stroke: #2e825b;
  stroke-width: 1.2;
}
.tissot {
  fill: rgba(230, 126, 34, 0.28);
  stroke: #e67e22;
  stroke-width: 0.8;
}
</style>
