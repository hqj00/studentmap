<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { MapPurpose, RecommendRequest, Recommendation, RegionExtent } from '@/modules/projection/types'
import { PURPOSE_LABELS, PROPERTY_LABELS, CATEGORY_LABELS } from '@/modules/projection/types'
import { REGION_PRESETS, extentText, resolveExtent } from '@/modules/projection/presets'
import { recommendByRule } from '@/modules/projection/ruleEngine'
import { recommendByAI } from '@/modules/projection/aiClient'
import { effectiveParams } from '@/modules/projection/params'
import { buildProj4, buildWkt, epsgHint } from '@/modules/projection/exporters'
import ProjectionPreview from '@/components/ProjectionPreview.vue'
import ExtentMapPicker from '@/components/ExtentMapPicker.vue'
import CoordConverter from '@/components/CoordConverter.vue'

const presetGroups = [...new Set(REGION_PRESETS.map((p) => p.group))]

const form = reactive({
  regionMode: 'preset' as 'preset' | 'extent',
  presetId: 'china',
  extent: { minLon: 73.5, minLat: 3.8, maxLon: 135.1, maxLat: 53.6 } as RegionExtent,
  purpose: 'statistic' as MapPurpose,
  useAI: false,
})

const purposeOptions = Object.entries(PURPOSE_LABELS).map(([value, label]) => ({ value, label }))

const loading = ref(false)
const errorMsg = ref('')
const aiDegraded = ref(false)
const results = ref<Recommendation[]>([])
/** 参考影像加载失败的投影 id（整块隐藏，不影响其他内容） */
const refImageFailed = ref(new Set<string>())
/** 本次推荐对应的实际范围（预览/参数/导出共用） */
const lastExtent = ref<RegionExtent | null>(null)

// 双方案对比：取前两名（spec/02 §9）
const schemes = computed(() => results.value.slice(0, 2))

const currentExtent = computed<RegionExtent>(() =>
  form.regionMode === 'preset'
    ? (resolveExtent(form.presetId) ?? form.extent)
    : form.extent,
)

function onPickExtent(e: RegionExtent) {
  form.regionMode = 'extent'
  form.extent = { ...e }
  ElMessage.success(`已框选范围：${extentText(e)}`)
}

function validate(): string | null {
  if (form.regionMode === 'extent') {
    const { minLon, minLat, maxLon, maxLat } = form.extent
    const nums = [minLon, minLat, maxLon, maxLat]
    if (nums.some((n) => !Number.isFinite(n))) return '请完整填写经纬度范围'
    if (minLon < -180 || maxLon > 180) return '经度须在 -180°~180° 之间'
    if (minLat < -90 || maxLat > 90) return '纬度须在 -90°~90° 之间'
    if (minLon >= maxLon || minLat >= maxLat) return '最小值须小于最大值'
  }
  return null
}

async function submit() {
  errorMsg.value = validate() ?? ''
  if (errorMsg.value) return
  loading.value = true
  aiDegraded.value = false
  try {
    const req: RecommendRequest = {
      region:
        form.regionMode === 'extent'
          ? { kind: 'extent', extent: { ...form.extent } }
          : { kind: 'preset', presetId: form.presetId },
      purpose: form.purpose,
    }
    const ruleResults = recommendByRule(req)
    lastExtent.value =
      req.region.kind === 'extent' ? req.region.extent : (resolveExtent(req.region.presetId) ?? null)
    if (form.useAI) {
      try {
        const aiResults = await recommendByAI(req, ruleResults)
        results.value = aiResults.length > 0 ? aiResults : ruleResults
        if (aiResults.length === 0) aiDegraded.value = true
      } catch {
        // spec/02 §10：AI 不可用静默降级为规则结果并明示
        results.value = ruleResults
        aiDegraded.value = true
      }
    } else {
      results.value = ruleResults
    }
  } finally {
    loading.value = false
  }
}

const fmtLat = (v: number) => `${Math.abs(v)}°${v >= 0 ? 'N' : 'S'}`
const fmtLon = (v: number) => `${Math.abs(v)}°${v >= 0 ? 'E' : 'W'}`

/** 有效参数文本（与预览/导出一致，spec/02 §6.1） */
function paramsText(rec: Recommendation): string {
  if (!lastExtent.value) return '—'
  const p = effectiveParams(rec.projection, lastExtent.value)
  const parts = [`中央经线 ${fmtLon(p.centralMeridian)}`]
  if (p.standardParallels?.length) parts.push(`标准纬线 ${p.standardParallels.map(fmtLat).join(' / ')}`)
  if (rec.projection.id === 'transverse-mercator') parts.push('6° 分带，假东 500km')
  return parts.join('；')
}

/** 「为什么优先方案 A？」结论（spec/02 §9 模板） */
const compareReason = computed(() => {
  const [a, b] = results.value
  if (!a || !b) return ''
  return (
    `方案 A（${a.projection.zhName}）为${PROPERTY_LABELS[a.projection.property]}投影：${a.reason}。` +
    `方案 B（${b.projection.zhName}）为${PROPERTY_LABELS[b.projection.property]}投影，优势在于「${b.projection.pros[0]}」，但「${b.projection.cons[0]}」。` +
    `在当前用途（${PURPOSE_LABELS[form.purpose]}）下优先方案 A；若用途变化，可切换方案 B。`
  )
})

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`${label} 已复制，可直接粘贴到 ArcGIS Pro / 超图 GIS`)
  } catch {
    ElMessage.error('复制失败，请检查浏览器剪贴板权限')
  }
}
</script>

<template>
  <div class="page">
    <div class="page-hero">
      <h2>地图投影智能推荐</h2>
      <p>输入制图区域与地图用途，规则引擎 + 大模型给出含参数与理由的专业投影方案</p>
    </div>

    <el-card shadow="never">
      <template #header>① 输入制图区域与用途</template>
      <el-form label-width="110px">
        <el-form-item label="区域范围">
          <el-radio-group v-model="form.regionMode">
            <el-radio value="preset">预设区域</el-radio>
            <el-radio value="extent">自定义经纬度</el-radio>
          </el-radio-group>
          <el-select v-if="form.regionMode === 'preset'" v-model="form.presetId" class="ml preset-select">
            <el-option-group v-for="g in presetGroups" :key="g" :label="g">
              <el-option
                v-for="p in REGION_PRESETS.filter((r) => r.group === g)"
                :key="p.id"
                :value="p.id"
                :label="p.label"
              >
                <span class="opt-label">{{ p.label }}</span>
                <span class="opt-extent">{{ extentText(p.extent) }}</span>
              </el-option>
            </el-option-group>
          </el-select>
          <div v-else class="extent-inputs">
            <el-input-number v-model="form.extent.minLon" :min="-180" :max="180" :step="1" placeholder="最小经度" />
            <el-input-number v-model="form.extent.minLat" :min="-90" :max="90" :step="1" placeholder="最小纬度" />
            <el-input-number v-model="form.extent.maxLon" :min="-180" :max="180" :step="1" placeholder="最大经度" />
            <el-input-number v-model="form.extent.maxLat" :min="-90" :max="90" :step="1" placeholder="最大纬度" />
          </div>
        </el-form-item>
        <el-form-item label="地图框选">
          <div class="picker-wrap">
            <ExtentMapPicker :model-value="currentExtent" @select="onPickExtent" />
            <p class="picker-hint">
              在地图上按住拖拽框选，自动填入四至（当前范围：{{ extentText(currentExtent) }}）
            </p>
          </div>
        </el-form-item>
        <el-form-item label="地图用途">
          <el-select v-model="form.purpose" class="purpose-select">
            <el-option v-for="o in purposeOptions" :key="o.value" :value="o.value" :label="o.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="大模型增强">
          <div class="ai-toggle">
            <el-checkbox v-model="form.useAI">使用大模型解释与排序</el-checkbox>
            <p class="ai-hint">未勾选或 AI 异常时自动降级为规则引擎推荐；本地开发需先 npm run server</p>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submit">获取投影推荐</el-button>
          <span v-if="errorMsg" class="error-text">{{ errorMsg }}</span>
        </el-form-item>
      </el-form>
    </el-card>

    <template v-if="results.length && lastExtent">
      <el-alert
        v-if="aiDegraded"
        type="warning"
        :closable="false"
        title="大模型不可用或返回异常，已降级为规则引擎推荐"
        class="mt"
      />

      <div class="scheme-grid mt" :class="{ single: schemes.length === 1 }">
        <el-card
          v-for="(rec, i) in schemes"
          :key="rec.projection.id"
          shadow="never"
          class="scheme-card"
          :class="{ best: i === 0 }"
        >
          <template #header>
            <div class="scheme-header">
              <span>{{ i === 0 ? '方案 A · 主推荐' : '方案 B · 备选' }}</span>
              <el-tag :type="rec.source === 'ai' ? 'success' : 'info'" size="small">
                {{ rec.source === 'ai' ? 'AI（供学习参考）' : '规则引擎' }}
              </el-tag>
            </div>
          </template>

          <h3>{{ rec.projection.zhName }}（{{ rec.projection.name }}）</h3>
          <p>
            <el-tag size="small">{{ CATEGORY_LABELS[rec.projection.category] }}</el-tag>
            <el-tag size="small" type="warning" class="ml">{{ PROPERTY_LABELS[rec.projection.property] }}</el-tag>
          </p>

          <ProjectionPreview :info="rec.projection" :extent="lastExtent" />
          <p class="legend">灰网：经纬网 · 橙圈：Tissot 变形椭圆（越扁/越大＝变形越大） · 绿框：制图范围</p>

          <!-- 参考影像（spec/02 §10）：与本应用生成的示意图上下结构，加载失败整块隐藏 -->
          <div v-if="rec.projection.refImage && !refImageFailed.has(rec.projection.id)" class="ref-image">
            <img
              :src="rec.projection.refImage.url"
              :alt="`${rec.projection.zhName}世界全图效果`"
              loading="lazy"
              @error="refImageFailed.add(rec.projection.id)"
            />
            <p class="legend">
              参考影像：{{ rec.projection.zhName }}（世界全图效果） · {{ rec.projection.refImage.credit }}
            </p>
          </div>

          <p><b>参数：</b>{{ paramsText(rec) }}</p>
          <p><b>推荐理由：</b>{{ rec.reason }}</p>

          <div class="pros-cons">
            <ul class="pros">
              <li v-for="t in rec.projection.pros" :key="t">✓ {{ t }}</li>
            </ul>
            <ul class="cons">
              <li v-for="t in rec.projection.cons" :key="t">✗ {{ t }}</li>
            </ul>
          </div>

          <el-divider />
          <p class="epsg"><b>EPSG：</b>{{ epsgHint(rec.projection) }}</p>
          <div class="export-btns">
            <el-button size="small" @click="copyText(buildProj4(rec.projection, lastExtent!), 'PROJ4')">
              复制 PROJ4
            </el-button>
            <el-button size="small" @click="copyText(buildWkt(rec.projection, lastExtent!), 'WKT')">
              复制 WKT
            </el-button>
          </div>

          <el-divider />
          <CoordConverter :info="rec.projection" :extent="lastExtent" />
        </el-card>
      </div>

      <el-card v-if="results.length >= 2" shadow="never" class="mt compare-card">
        <template #header>为什么优先方案 A？</template>
        <p class="compare-text">{{ compareReason }}</p>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 1080px;
  margin: 0 auto;
}
.mt {
  margin-top: 16px;
}
.ml {
  margin-left: 12px;
}
.extent-inputs {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.purpose-select {
  width: 320px;
}
.preset-select {
  width: 380px;
}
.opt-label {
  float: left;
}
.opt-extent {
  float: right;
  margin-left: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.picker-wrap {
  width: 100%;
  max-width: 560px;
}
.picker-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.error-text {
  color: var(--el-color-danger);
  margin-left: 12px;
}
.ai-toggle {
  line-height: 1.4;
}
.ai-hint {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.scheme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.scheme-grid.single {
  grid-template-columns: 1fr;
}
.scheme-card.best {
  border-color: #8fceb0;
  box-shadow: 0 4px 18px rgba(35, 110, 70, 0.14);
}
.scheme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.scheme-card h3 {
  margin-top: 0;
  color: #1f7a4d;
}
.legend {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.ref-image img {
  width: 100%;
  display: block;
  margin-top: 12px;
  border-radius: 8px;
  border: 1px solid #e0efe5;
  background: #f3faf6;
}
.pros-cons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.pros-cons ul {
  margin: 0;
  padding: 0 0 0 4px;
  list-style: none;
  font-size: 13px;
  line-height: 1.8;
}
.pros li {
  color: #2e825b;
}
.cons li {
  color: #b26a3c;
}
.epsg {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}
.compare-text {
  margin: 0;
  line-height: 1.9;
}

/* 移动端（spec/04 §9）：单列布局、控件全宽 */
@media (max-width: 768px) {
  .scheme-grid {
    grid-template-columns: 1fr;
  }
  .pros-cons {
    grid-template-columns: 1fr;
  }
  .preset-select,
  .purpose-select {
    width: 100%;
  }
  .preset-select.ml {
    margin-left: 0;
    margin-top: 8px;
  }
  .extent-inputs {
    flex-direction: column;
  }
  .extent-inputs .el-input-number {
    width: 100%;
  }
  .picker-wrap {
    max-width: 100%;
  }
}
</style>
