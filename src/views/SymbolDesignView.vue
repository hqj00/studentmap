<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import type { SymbolCategory, SymbolSource } from '@/modules/symbol/types'
import { CATEGORY_LABELS, SOURCE_LABELS } from '@/modules/symbol/types'
import { checkAndNormalizeSvg, type SvgCheckResult } from '@/modules/symbol/standardize'
import { useSymbolLibrary } from '@/modules/symbol/library'
import { useIsMobile } from '@/utils/useIsMobile'

const { symbols, add, remove, exportJson, importJson } = useSymbolLibrary()
const isMobile = useIsMobile()

// 向导步骤（spec/03 §3：一次只展示一步，前置条件未满足则禁下一步）
const STEPS = ['需求定义', 'iconfont AI 素材', 'Illustrator 设计', '上传与校验', '入库'] as const
const step = ref(0)

// 第 1 步：需求定义 —— 名称/分类/风格会自动带入后续步骤
const need = reactive({ name: '加油站', category: 'point' as SymbolCategory, style: '线性风格' })
const needValid = computed(() => need.name.trim().length > 0)

// 第 2 步：iconfont 描述词（spec/03 §3 步骤②）
const iconfontPrompt = computed(
  () => `${need.name.trim() || '某'}地图符号，${need.style}，单色，几何简洁，居中构图，无文字`,
)
async function copyPrompt() {
  await navigator.clipboard.writeText(iconfontPrompt.value)
  ElMessage.success('描述词已复制，到 iconfont 粘贴即可')
}

// 第 3 步：Illustrator 对照清单（spec/03 §3 步骤③）
const AI_CHECKLIST = [
  '新建 64×64px 画板，建立 4px 网格对齐',
  '统一线宽 2~4px，必要时「对象 → 扩展」把描边转填充',
  '统一留白：符号内容距画布边缘 4~8px，同组符号一致',
  '色彩模式 RGB；单体符号使用单色（便于 currentColor 换色）',
  '文字全部「创建轮廓」（转曲），避免字体依赖',
  '删除多余锚点与隐藏图层',
  '导出 SVG：样式=内联、字体=轮廓、图像=不嵌入、小数位=2',
]
const checklist = ref<boolean[]>(AI_CHECKLIST.map(() => false))

// 第 4 步：上传与规范化校验（spec/03 §3 步骤④）
const checkResult = ref<SvgCheckResult | null>(null)
let pickedFileName = ''
async function onFileChange(file: UploadFile) {
  const raw = file.raw
  if (!raw || !raw.name.toLowerCase().endsWith('.svg')) {
    checkResult.value = { ok: false, issues: [{ level: 'error', message: '仅支持 .svg 文件' }] }
    return
  }
  pickedFileName = raw.name.replace(/\.svg$/i, '')
  checkResult.value = checkAndNormalizeSvg(await raw.text())
}

// 第 5 步：入库（名称默认取第 1 步的地物名称，其次取文件名）
const meta = reactive({ name: '', tags: '', source: 'iconfont-ai' as SymbolSource })
const finalName = computed(() => meta.name.trim() || need.name.trim() || pickedFileName || '未命名符号')

function addToLibrary() {
  if (!checkResult.value?.ok || !checkResult.value.normalized) return
  add({
    name: finalName.value,
    category: need.category,
    tags: meta.tags.split(/[,，\s]+/).filter(Boolean),
    svg: checkResult.value.normalized,
    source: meta.source,
  })
  ElMessage.success(`「${finalName.value}」已入库，可以继续设计下一个`)
  // 重置到第 1 步，保留分类/风格便于连续设计
  checkResult.value = null
  pickedFileName = ''
  meta.name = ''
  meta.tags = ''
  step.value = 0
}

function next() {
  if (step.value < STEPS.length - 1) step.value++
}
function prev() {
  if (step.value > 0) step.value--
}
const canNext = computed(() => {
  if (step.value === 0) return needValid.value
  if (step.value === 3) return !!checkResult.value?.ok
  return true
})

function downloadJson() {
  const blob = new Blob([exportJson()], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'studentmap-symbols.json'
  a.click()
  URL.revokeObjectURL(a.href)
}

// 导入他人分享的符号库 JSON（合并去重，spec/03 §7 用例6）
async function onImportFile(file: UploadFile) {
  const raw = file.raw
  if (!raw) return
  const result = importJson(await raw.text())
  if (!result.ok) {
    ElMessage.error(`导入失败：${result.error}`)
    return
  }
  ElMessage.success(
    `导入完成：新增 ${result.added} 个符号` + (result.skipped ? `，跳过 ${result.skipped} 条重复/无效记录` : ''),
  )
}

const darkPreview = ref(false)
const levelType = { error: 'error', warning: 'warning', info: 'info' } as const
const levelLabel = { error: '错误', warning: '警告', info: '建议' } as const
</script>

<template>
  <div class="page">
    <div class="page-hero">
      <h2>地图符号设计</h2>
      <p>五步向导：需求定义 → iconfont AI 素材 → Illustrator 精修 → 规范化校验 → 入符号库</p>
    </div>
    <el-steps :active="step" :align-center="!isMobile" :direction="isMobile ? 'vertical' : 'horizontal'" finish-status="success">
      <el-step v-for="(t, i) in STEPS" :key="i" :title="t" />
    </el-steps>

    <el-card shadow="never" class="mt">
      <template #header>第 {{ step + 1 }} 步 · {{ STEPS[step] }}</template>

      <!-- 第 1 步 -->
      <div v-if="step === 0">
        <p class="hint">只需想清三件事：画什么地物、它是点/线/面、要什么风格。这些信息会自动带入后面的步骤。</p>
        <el-form label-width="90px">
          <el-form-item label="地物名称" required>
            <el-input v-model="need.name" placeholder="如：加油站、气象台站" style="width: 240px" />
          </el-form-item>
          <el-form-item label="符号分类">
            <el-radio-group v-model="need.category">
              <el-radio v-for="(label, value) in CATEGORY_LABELS" :key="value" :value="value">{{ label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="风格">
            <el-radio-group v-model="need.style">
              <el-radio value="线性风格">线性</el-radio>
              <el-radio value="面性风格">面性</el-radio>
              <el-radio value="剪影风格">剪影</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- 第 2 步 -->
      <div v-else-if="step === 1">
        <ol class="guide">
          <li>打开 <a href="https://www.iconfont.cn" target="_blank" rel="noopener">iconfont（阿里矢量图标库）</a>，进入站内 AI 生成功能；</li>
          <li>粘贴下面的描述词（已按第 1 步自动填好）；</li>
          <li>从生成结果里挑最满意的 1~3 个，<b>下载 SVG</b>。</li>
        </ol>
        <el-input :model-value="iconfontPrompt" type="textarea" :rows="2" readonly />
        <div class="mt">
          <el-button @click="copyPrompt">复制描述词</el-button>
        </div>
        <el-alert type="info" :closable="false" class="mt"
          title="许可提示：iconfont 素材遵循其站点许可协议，课程作业使用请注明来源；入库时来源将记录为 iconfont-ai。" />
      </div>

      <!-- 第 3 步 -->
      <div v-else-if="step === 2">
        <p class="hint">在 Illustrator 里打开下载的 SVG，逐条对照即可。暂时没有 Illustrator 也可以先用原稿入库，之后再精修替换。</p>
        <el-checkbox
          v-for="(item, i) in AI_CHECKLIST"
          :key="i"
          v-model="checklist[i]"
          :label="item"
          class="check-item"
        />
      </div>

      <!-- 第 4 步 -->
      <div v-else-if="step === 3">
        <p class="hint">把精修后的 SVG 拖进来，系统自动检查安全性与规范性；有「错误」需要回 Illustrator 修正后重新上传。</p>
        <el-upload drag accept=".svg" :auto-upload="false" :show-file-list="false" :on-change="onFileChange">
          <div class="upload-tip">拖拽 SVG 到此处，或<em>点击选择文件</em></div>
        </el-upload>
        <template v-if="checkResult">
          <el-alert
            class="mt"
            :type="checkResult.ok ? 'success' : 'error'"
            :closable="false"
            :title="checkResult.ok ? '校验通过，可以进入下一步' : '存在错误级问题，请按清单修正后重新上传'"
          />
          <div v-for="(issue, i) in checkResult.issues" :key="i" class="issue">
            <el-tag size="small" :type="levelType[issue.level]">{{ levelLabel[issue.level] }}</el-tag>
            <span class="issue-msg">{{ issue.message }}</span>
          </div>
        </template>
      </div>

      <!-- 第 5 步 -->
      <div v-else>
        <div class="final-row">
          <div v-if="checkResult?.normalized" class="final-thumb" v-html="checkResult.normalized" />
          <el-form label-width="90px" class="final-form">
            <el-form-item label="符号名称">
              <el-input v-model="meta.name" :placeholder="finalName" style="width: 240px" />
            </el-form-item>
            <el-form-item label="分类">
              <el-tag>{{ CATEGORY_LABELS[need.category] }}</el-tag>
              <span class="hint-inline">（取自第 1 步）</span>
            </el-form-item>
            <el-form-item label="标签">
              <el-input v-model="meta.tags" placeholder="选填，空格分隔，如：气象 1:25万" style="width: 320px" />
            </el-form-item>
            <el-form-item label="来源">
              <el-select v-model="meta.source" style="width: 220px">
                <el-option v-for="(label, value) in SOURCE_LABELS" :key="value" :value="value" :label="label" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>

    <div class="footer mt">
      <el-button :disabled="step === 0" @click="prev">上一步</el-button>
      <el-button v-if="step < STEPS.length - 1" type="primary" :disabled="!canNext" @click="next">
        下一步
      </el-button>
      <el-button v-else type="primary" @click="addToLibrary">完成入库</el-button>
      <span v-if="step === 3 && !checkResult?.ok" class="hint-inline">上传并通过校验后可继续</span>
    </div>

    <el-card shadow="never" class="mt">
      <template #header>
        <div class="lib-header">
          <span>符号库（{{ symbols.length }}）</span>
          <span>
            <el-switch v-model="darkPreview" active-text="深色底预览" class="mr" />
            <el-upload accept=".json" :auto-upload="false" :show-file-list="false" :on-change="onImportFile" class="lib-upload">
              <el-button size="small">导入 JSON</el-button>
            </el-upload>
            <el-button size="small" :disabled="!symbols.length" @click="downloadJson">导出 JSON</el-button>
          </span>
        </div>
      </template>
      <el-empty v-if="!symbols.length" description="符号库为空，跟随上方向导完成一次设计即可入库" :image-size="80" />
      <div v-else class="symbol-grid" :class="{ dark: darkPreview }">
        <div v-for="s in symbols" :key="s.id" class="symbol-card">
          <div class="symbol-thumb" v-html="s.svg" />
          <div class="symbol-name">{{ s.name }}</div>
          <div class="symbol-meta">
            <el-tag size="small">{{ CATEGORY_LABELS[s.category] }}</el-tag>
            <el-tag size="small" type="info">{{ SOURCE_LABELS[s.source] }}</el-tag>
          </div>
          <el-button size="small" type="danger" text @click="remove(s.id)">删除</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
}
.mt {
  margin-top: 16px;
}
.mr {
  margin-right: 12px;
}
.hint {
  margin-top: 0;
  color: var(--el-text-color-secondary);
}
.hint-inline {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.guide {
  margin-top: 0;
  padding-left: 20px;
  line-height: 1.9;
}
.check-item {
  display: flex;
}
.upload-tip {
  padding: 24px 0;
}
.issue {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.footer {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}
.final-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.final-thumb {
  width: 96px;
  height: 96px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.final-thumb :deep(svg) {
  max-width: 72px;
  max-height: 72px;
}
.final-form {
  flex: 1;
}
.lib-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.lib-upload {
  display: inline-block;
  margin-right: 8px;
}
.symbol-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}
.symbol-grid.dark .symbol-thumb {
  background: #1d1e1f;
}
.symbol-card {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 8px;
  text-align: center;
}
.symbol-thumb {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #f2f8f4;
}
.symbol-thumb :deep(svg) {
  max-width: 56px;
  max-height: 56px;
}
.symbol-name {
  margin-top: 6px;
  font-weight: 600;
}
.symbol-meta {
  margin: 6px 0;
  display: flex;
  gap: 4px;
  justify-content: center;
}

/* 移动端（spec/04 §9）：入库预览上下排、按钮换行 */
@media (max-width: 768px) {
  .final-row {
    flex-direction: column;
  }
  .footer {
    flex-wrap: wrap;
  }
  .lib-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
