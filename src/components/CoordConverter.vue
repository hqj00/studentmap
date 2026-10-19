<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { ProjectionInfo, RegionExtent } from '@/modules/projection/types'
import { forwardProject, inverseProject } from '@/modules/projection/convert'

/** 坐标试算（spec/02 §10）：正算经纬度→平面坐标（米），反算平面坐标→经纬度 */
const props = defineProps<{ info: ProjectionInfo; extent: RegionExtent }>()

const centerLon = (props.extent.minLon + props.extent.maxLon) / 2
const centerLat = (props.extent.minLat + props.extent.maxLat) / 2

const fwd = reactive({ lon: Math.round(centerLon * 1000) / 1000, lat: Math.round(centerLat * 1000) / 1000 })
const fwdResult = ref('')
const fwdError = ref('')

const inv = reactive({ x: NaN as number, y: NaN as number })
const invResult = ref('')
const invError = ref('')

const fmtM = (v: number) => v.toLocaleString('zh-CN', { maximumFractionDigits: 3 })
const fmtDeg = (v: number) => v.toFixed(6)

function doForward() {
  fwdError.value = ''
  fwdResult.value = ''
  const out = forwardProject(props.info, props.extent, fwd.lon, fwd.lat)
  if (!out) {
    fwdError.value = '该投影暂不支持坐标试算'
    return
  }
  fwdResult.value = `X = ${fmtM(out[0])} m，Y = ${fmtM(out[1])} m`
}

function doInverse() {
  invError.value = ''
  invResult.value = ''
  if (!Number.isFinite(inv.x) || !Number.isFinite(inv.y)) {
    invError.value = '请先输入 X / Y（米）'
    return
  }
  const out = inverseProject(props.info, props.extent, inv.x, inv.y)
  if (!out) {
    invError.value = '该投影暂不支持坐标试算'
    return
  }
  invResult.value = `经度 = ${fmtDeg(out[0])}°，纬度 = ${fmtDeg(out[1])}°`
}

// 联动小便利：正算成功后把结果回填给反算，方便一键验证往返一致
function fillInverse() {
  const out = forwardProject(props.info, props.extent, fwd.lon, fwd.lat)
  if (!out) return
  inv.x = Math.round(out[0] * 1000) / 1000
  inv.y = Math.round(out[1] * 1000) / 1000
  doInverse()
}
</script>

<template>
  <div class="converter">
    <p class="conv-title"><b>坐标试算</b>（与导出的 PROJ4 定义一致，单位：米）</p>

    <div class="conv-row">
      <el-input-number v-model="fwd.lon" :min="-180" :max="180" :step="0.1" placeholder="经度°" :controls="false" />
      <el-input-number v-model="fwd.lat" :min="-90" :max="90" :step="0.1" placeholder="纬度°" :controls="false" />
      <el-button size="small" type="primary" plain @click="doForward">正算 →</el-button>
      <el-button v-if="fwdResult" size="small" text type="primary" @click="fillInverse">回填反算</el-button>
    </div>
    <p v-if="fwdResult" class="conv-result">{{ fwdResult }}</p>
    <p v-if="fwdError" class="conv-error">{{ fwdError }}</p>

    <div class="conv-row">
      <el-input-number v-model="inv.x" :controls="false" placeholder="X (米)" />
      <el-input-number v-model="inv.y" :controls="false" placeholder="Y (米)" />
      <el-button size="small" type="primary" plain @click="doInverse">反算 →</el-button>
    </div>
    <p v-if="invResult" class="conv-result">{{ invResult }}</p>
    <p v-if="invError" class="conv-error">{{ invError }}</p>
  </div>
</template>

<style scoped>
.converter {
  font-size: 13px;
}
.conv-title {
  margin: 0 0 8px;
  color: var(--el-text-color-secondary);
}
.conv-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.conv-row :deep(.el-input-number) {
  width: 130px;
}
.conv-result {
  margin: 2px 0 8px;
  color: #1f7a4d;
  font-weight: 600;
}
.conv-error {
  margin: 2px 0 8px;
  color: var(--el-color-danger);
}
</style>
