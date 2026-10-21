<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { PROJECTION_KB, REGION_PRESETS, findProjection } from '@/modules/projection/presets'
import { buildPreviewLayers, PREVIEW_STYLE } from '@/modules/projection/d3Factory'
import { effectiveParams } from '@/modules/projection/params'
import {
  applyActions,
  askAssistant,
  defaultLabState,
  parseLocally,
  regionLabel,
  resolveLabExtent,
  summarizeChange,
  type AssistantReply,
  type LabState,
} from '@/modules/projection/assistant'
import ZoomableMap from '@/components/ZoomableMap.vue'

const W = 340
const H = 220

const state = ref<LabState>(defaultLabState())
const extent = computed(() => resolveLabExtent(state.value))

const projectionOptions = PROJECTION_KB.map((p) => ({ value: p.id, label: `${p.zhName}（${p.name}）` }))
const regionOptions = REGION_PRESETS.map((p) => ({ value: p.id, label: p.label }))

/** A/B 两幅预览（spec/08 §3） */
const panes = computed(() => {
  const ids = [state.value.projA, state.value.projB].filter((x): x is string => !!x)
  return ids.map((id) => {
    const info = findProjection(id)
    if (!info) return null
    const layers = buildPreviewLayers(info, extent.value, W, H, state.value.marker ?? undefined)
    const params = effectiveParams(info, extent.value)
    return { info, layers, params }
  }).filter((p): p is NonNullable<typeof p> => !!p)
})

const fmtLon = (v: number) => `${Math.abs(v)}°${v >= 0 ? 'E' : 'W'}`
const fmtLat = (v: number) => `${Math.abs(v)}°${v >= 0 ? 'N' : 'S'}`

function onPresetChange(id: string) {
  state.value = { ...state.value, regionMode: 'preset', presetId: id }
}

// ─── 教学助手（spec/08 §2/§4） ───
interface ChatMsg {
  role: 'user' | 'assistant'
  text: string
  source?: 'ai' | 'local'
  change?: string[]
  undo?: LabState
  undone?: boolean
}

const CHIPS = [
  '比较墨卡托和等地球',
  '中国全图用阿尔伯斯',
  '打开变形椭圆',
  '郑州为中心打开标记',
  '全球投影对比',
]

const drawer = ref(false)
const messages = ref<ChatMsg[]>([])
const input = ref('')
const loading = ref(false)
const listEl = ref<HTMLElement>()

async function scrollToBottom() {
  await nextTick()
  listEl.value?.scrollTo({ top: listEl.value.scrollHeight, behavior: 'smooth' })
}

async function send(text?: string) {
  const question = (text ?? input.value).trim()
  if (!question || loading.value) return
  input.value = ''
  messages.value.push({ role: 'user', text: question })
  loading.value = true
  await scrollToBottom()
  const before = state.value
  try {
    // AI 优先，失败或返回不可执行动作时降级为离线解析（spec/08 §4.2）
    let res: AssistantReply
    try {
      res = await askAssistant(question, before)
    } catch {
      res = parseLocally(question)
    }
    const after = applyActions(before, res.actions)
    const change = summarizeChange(before, after)
    state.value = after
    messages.value.push({
      role: 'assistant',
      text: res.reply,
      source: res.source,
      change: change.length ? change : undefined,
      undo: change.length ? before : undefined,
    })
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

function undo(msg: ChatMsg) {
  if (!msg.undo) return
  state.value = msg.undo
  msg.undone = true
  ElMessage.success('已撤销本次设置')
}

function onEnter(e: KeyboardEvent) {
  if (e.shiftKey) return
  e.preventDefault()
  send()
}

function resetLab() {
  state.value = defaultLabState()
}
</script>

<template>
  <el-card shadow="never" class="lab-card">
    <template #header>
      <div class="lab-header">
        <span>② 投影实验室 <span class="lab-sub">用自然语言指挥投影</span></span>
        <el-button type="primary" size="small" @click="drawer = true">投影教学助手</el-button>
      </div>
    </template>

    <!-- 状态与控制 -->
    <div class="lab-controls">
      <div class="ctl-item">
        <span class="ctl-label">投影 A</span>
        <el-select :model-value="state.projA" size="small" class="proj-select" @update:model-value="(v: string) => (state = { ...state, projA: v })">
          <el-option v-for="o in projectionOptions" :key="o.value" :value="o.value" :label="o.label" />
        </el-select>
      </div>
      <div class="ctl-item">
        <span class="ctl-label">对比 B</span>
        <el-select
          :model-value="state.projB ?? ''"
          size="small"
          class="proj-select"
          @update:model-value="(v: string) => (state = { ...state, projB: v || null })"
        >
          <el-option value="" label="不对比（单幅）" />
          <el-option v-for="o in projectionOptions" :key="o.value" :value="o.value" :label="o.label" />
        </el-select>
      </div>
      <div class="ctl-item">
        <span class="ctl-label">区域</span>
        <el-select :model-value="state.presetId" size="small" class="region-select" @update:model-value="onPresetChange">
          <el-option v-for="o in regionOptions" :key="o.value" :value="o.value" :label="o.label" />
        </el-select>
      </div>
      <el-button size="small" text type="primary" @click="resetLab">恢复默认</el-button>
    </div>

    <div class="lab-layers">
      <el-checkbox :model-value="state.overlays.graticule" @update:model-value="(v: any) => (state = { ...state, overlays: { ...state.overlays, graticule: !!v } })">经纬网</el-checkbox>
      <el-checkbox :model-value="state.overlays.tissot" @update:model-value="(v: any) => (state = { ...state, overlays: { ...state.overlays, tissot: !!v } })">变形椭圆</el-checkbox>
      <el-checkbox :model-value="state.overlays.land" @update:model-value="(v: any) => (state = { ...state, overlays: { ...state.overlays, land: !!v } })">陆地</el-checkbox>
      <el-checkbox :model-value="state.overlays.marker" @update:model-value="(v: any) => (state = { ...state, overlays: { ...state.overlays, marker: !!v } })">坐标标记</el-checkbox>
      <span class="lab-state">
        区域：{{ regionLabel(state) }}<template v-if="state.marker"> · 标记 {{ fmtLon(state.marker[0]) }}, {{ fmtLat(state.marker[1]) }}</template>
      </span>
    </div>

    <!-- A/B 预览 -->
    <div class="lab-panes" :class="{ single: panes.length === 1 }">
      <div v-for="pane in panes" :key="pane.info.id" class="pane">
        <div class="pane-title">
          <b>{{ pane.info.zhName }}</b>
          <span class="pane-params">
            中央经线 {{ fmtLon(pane.params.centralMeridian) }}<template v-if="pane.params.standardParallels?.length"> · 标准纬线 {{ pane.params.standardParallels.map(fmtLat).join('/') }}</template>
          </span>
        </div>
        <ZoomableMap :width="W" :height="H" :label="`${pane.info.zhName}实验预览`">
          <path :d="pane.layers.sphere" v-bind="PREVIEW_STYLE.sphere" />
          <path v-if="state.overlays.land" :d="pane.layers.land" v-bind="PREVIEW_STYLE.land" />
          <path v-if="state.overlays.graticule" :d="pane.layers.grat" v-bind="PREVIEW_STYLE.grat" />
          <path v-if="pane.layers.extentD" :d="pane.layers.extentD" v-bind="PREVIEW_STYLE.extent" />
          <path v-for="(d, i) in (state.overlays.tissot ? pane.layers.tissot : [])" :key="i" :d="d" v-bind="PREVIEW_STYLE.tissot" />
          <g v-if="state.overlays.marker && pane.layers.markerPt">
            <circle :cx="pane.layers.markerPt[0]" :cy="pane.layers.markerPt[1]" r="7" fill="rgba(230, 126, 34, 0.25)" />
            <circle :cx="pane.layers.markerPt[0]" :cy="pane.layers.markerPt[1]" r="3" fill="#e67e22" stroke="#fff" stroke-width="1.2" />
          </g>
        </ZoomableMap>
      </div>
    </div>
    <p class="lab-hint">缩放用图右上角 ＋/－ 按钮；需要拖拽时在总览卡片勾选「允许拖动」。助手可直接改区域、投影与图层。</p>
  </el-card>

  <!-- 教学助手抽屉 -->
  <el-drawer v-model="drawer" size="400px" :with-header="true" class="assistant-drawer">
    <template #header>
      <div class="assistant-head">
        <div class="assistant-badge">✦</div>
        <div class="assistant-title">
          <b>投影教学助手</b>
          <span>已接入大模型 · 指令直达实验台</span>
        </div>
      </div>
    </template>
    <div ref="listEl" class="assistant-list">
      <div class="assistant-hero">
        <p class="hero-en">JUST ASK, THEN EXPLORE</p>
        <h3>把需求说出来，<br />让实验开始。</h3>
        <p class="hero-desc">描述你想观察的现象，我会选择投影、设置区域和图层。</p>
      </div>
      <div class="assistant-chips">
        <el-tag v-for="c in CHIPS" :key="c" effect="plain" class="chip" @click="send(c)">{{ c }}</el-tag>
      </div>

      <div v-if="messages.length === 0" class="assistant-empty">对话记录会显示在这里。</div>
      <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
        <div class="msg-bubble">
          <p class="msg-text">{{ m.text }}</p>
          <p v-if="m.role === 'assistant'" class="msg-meta">
            <el-tag size="small" :type="m.source === 'ai' ? 'success' : 'info'">
              {{ m.source === 'ai' ? 'AI 助教' : '离线解析' }}
            </el-tag>
          </p>
        </div>
        <div v-if="m.change" class="applied" :class="{ undone: m.undone }">
          <p class="applied-title">{{ m.undone ? '已撤销本次设置' : '✓ 已应用' }}</p>
          <ul>
            <li v-for="line in m.change" :key="line">{{ line }}</li>
          </ul>
          <el-button v-if="!m.undone" text type="primary" size="small" @click="undo(m)">撤销本次设置</el-button>
        </div>
      </div>
      <div v-if="loading" class="msg assistant">
        <div class="msg-bubble thinking">思考中…（慢模型首字可能需 1 分钟）</div>
      </div>
    </div>
    <div class="assistant-input">
      <el-input v-model="input" type="textarea" :rows="2" resize="none" placeholder="例如：切换到全球，比较墨卡托和等地球，打开变形椭圆" @keydown.enter="onEnter" />
      <div class="assistant-actions">
        <el-button size="small" text :disabled="messages.length === 0" @click="messages = []">清空对话</el-button>
        <el-button type="primary" :loading="loading" :disabled="!input.trim()" @click="send()">发送</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.lab-card {
  margin-top: 16px;
}
.lab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.lab-sub {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}
.lab-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.ctl-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ctl-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.proj-select {
  width: 230px;
}
.region-select {
  width: 190px;
}
.lab-layers {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #dcefe3;
}
.lab-state {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.lab-panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 12px;
}
.lab-panes.single {
  grid-template-columns: 1fr;
}
.pane-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}
.pane-title b {
  color: #1f7a4d;
  font-size: 14px;
}
.pane-params {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.lab-hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 助手抽屉 */
.assistant-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.assistant-badge {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #1f7a4d, #63bd8f);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.assistant-title {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}
.assistant-title b {
  color: #1f7a4d;
}
.assistant-title span {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.assistant-list {
  height: calc(100% - 96px);
  overflow-y: auto;
  padding-right: 4px;
}
.assistant-hero .hero-en {
  margin: 0;
  font-size: 10px;
  letter-spacing: 1.5px;
  color: #8fb8a0;
}
.assistant-hero h3 {
  margin: 8px 0 8px;
  font-size: 22px;
  line-height: 1.35;
  color: #145c3a;
}
.hero-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.assistant-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.chip {
  cursor: pointer;
  white-space: normal;
  height: auto;
  padding: 4px 10px;
  line-height: 1.5;
}
.chip:hover {
  color: #1f7a4d;
  border-color: #8fceb0;
}
.assistant-empty {
  padding: 18px 0;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.msg {
  display: flex;
  flex-direction: column;
  margin: 10px 0;
}
.msg.user {
  align-items: flex-end;
}
.msg-bubble {
  max-width: 92%;
  padding: 9px 12px;
  border-radius: 10px;
  background: #f0f8f3;
  border: 1px solid #dcefe3;
  font-size: 13px;
  line-height: 1.75;
}
.msg.user .msg-bubble {
  background: #2e825b;
  border-color: #2e825b;
  color: #fff;
}
.msg-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.msg-meta {
  margin: 6px 0 0;
}
.thinking {
  color: var(--el-text-color-secondary);
}
.applied {
  margin-top: 6px;
  max-width: 92%;
  padding: 9px 12px;
  border-radius: 10px;
  background: #eef8f1;
  border: 1px solid #bfe3cc;
  font-size: 12.5px;
  line-height: 1.7;
}
.applied.undone {
  opacity: 0.65;
}
.applied-title {
  margin: 0 0 4px;
  font-weight: 600;
  color: #1f7a4d;
}
.applied ul {
  margin: 0;
  padding-left: 16px;
  color: var(--el-text-color-regular);
}
.assistant-input {
  position: sticky;
  bottom: 0;
  padding-top: 8px;
  background: #fff;
}
.assistant-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

@media (max-width: 768px) {
  .lab-panes {
    grid-template-columns: 1fr;
  }
  .proj-select,
  .region-select {
    width: 100%;
  }
  .ctl-item {
    width: 100%;
  }
  .lab-state {
    margin-left: 0;
  }
}
</style>
