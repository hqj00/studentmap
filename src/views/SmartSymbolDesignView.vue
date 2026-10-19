<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { SymbolCategory } from '@/modules/symbol/types'
import { CATEGORY_LABELS } from '@/modules/symbol/types'
import { checkAndNormalizeSvg, type SvgCheckResult } from '@/modules/symbol/standardize'
import { useSymbolLibrary } from '@/modules/symbol/library'
import { fetchIconSvg, iconSvgUrl, iconfontSearchUrl, searchIcons, toQuery } from '@/modules/symbol/iconify'

const { add } = useSymbolLibrary()

// spec/05 §3：描述 → 关键词转换 → Iconify 搜索 → 网格 → 点选 → 校验 → 入库
const description = ref('')
const searching = ref(false)
const searched = ref(false)
const usedQuery = ref('')
const candidates = ref<string[]>([])
const errorMsg = ref('')

const QUICK_WORDS = ['加油站', '医院', '学校', '车站', '公园', '餐厅', '停车场', '博物馆']

async function search(text?: string) {
  const desc = (text ?? description.value).trim()
  if (!desc) return
  description.value = desc
  searching.value = true
  errorMsg.value = ''
  searched.value = false
  try {
    const { query } = toQuery(desc)
    usedQuery.value = query
    candidates.value = await searchIcons(query)
    searched.value = true
  } catch (e) {
    errorMsg.value = `搜索失败：${e instanceof Error ? e.message : String(e)}（可检查网络后重试）`
    candidates.value = []
  } finally {
    searching.value = false
  }
}

// 选中与入库
const selected = ref<string | null>(null)
const meta = reactive({ name: '', category: 'point' as SymbolCategory, tags: '' })
const checkResult = ref<SvgCheckResult | null>(null)
const adding = ref(false)

async function pick(name: string) {
  selected.value = name
  checkResult.value = null
  if (!meta.name) meta.name = description.value
  adding.value = true
  try {
    const svg = await fetchIconSvg(name)
    checkResult.value = checkAndNormalizeSvg(svg)
  } catch (e) {
    checkResult.value = {
      ok: false,
      issues: [{ level: 'error', message: `下载 SVG 失败：${e instanceof Error ? e.message : String(e)}` }],
    }
  } finally {
    adding.value = false
  }
}

function confirmAdd() {
  if (!selected.value || !checkResult.value?.ok || !checkResult.value.normalized) return
  add({
    name: meta.name.trim() || selected.value.split(':')[1] || '未命名符号',
    category: meta.category,
    tags: meta.tags.split(/[,，\s]+/).filter(Boolean),
    svg: checkResult.value.normalized,
    source: 'iconify',
  })
  ElMessage.success(`「${meta.name.trim() || selected.value}」已入库，可在「符号设计向导」页底部符号库查看`)
  selected.value = null
  checkResult.value = null
  meta.name = ''
  meta.tags = ''
}

function openIconfont() {
  window.open(iconfontSearchUrl(description.value.trim() || usedQuery.value), '_blank', 'noopener')
}
</script>

<template>
  <div class="page">
    <div class="page-hero">
      <h2>智能符号设计</h2>
      <p>描述你要的地图符号，直接搜索现成矢量图标，点选即可入库——无需五步向导</p>
    </div>

    <el-card shadow="never">
      <template #header>① 描述并搜索</template>
      <div class="search-row">
        <el-input
          v-model="description"
          placeholder="如：我需要一个加油站的点状符号"
          clearable
          class="search-input"
          @keyup.enter="search()"
        />
        <el-button type="primary" :loading="searching" @click="search()">搜索符号</el-button>
        <el-button text type="primary" @click="openIconfont">去 iconfont 搜索 ↗</el-button>
      </div>
      <div class="quick-words">
        <span class="quick-label">常见地物：</span>
        <el-tag
          v-for="w in QUICK_WORDS"
          :key="w"
          class="quick-tag"
          @click="search(w)"
        >{{ w }}</el-tag>
      </div>
      <el-alert type="info" :closable="false" class="mt"
        title="素材许可：搜索结果来自 Iconify 聚合的开源图标集（Apache-2.0 / MIT / CC BY 4.0 等），课程作业使用请注明来源；需要 iconfont 素材可点右侧直达链接，再走「符号设计向导」精修入库。" />
    </el-card>

    <el-alert v-if="errorMsg" type="error" :closable="false" class="mt" :title="errorMsg" />

    <el-card v-if="searched || candidates.length" shadow="never" class="mt">
      <template #header>
        ② 候选符号（检索词：{{ usedQuery }}，{{ candidates.length }} 个）
      </template>
      <el-empty
        v-if="searched && !candidates.length"
        description="没有找到相符的符号，换个地物名词试试；或点「去 iconfont 搜索」"
        :image-size="80"
      />
      <div v-else class="cand-grid">
        <div
          v-for="name in candidates"
          :key="name"
          class="cand-card"
          :class="{ active: selected === name }"
          @click="pick(name)"
        >
          <img :src="iconSvgUrl(name)" :alt="name" loading="lazy" class="cand-img" />
          <div class="cand-name">{{ name.split(':')[1] }}</div>
        </div>
      </div>
    </el-card>

    <el-card v-if="selected" shadow="never" class="mt">
      <template #header>③ 确认入库</template>
      <div v-if="adding" class="hint">正在下载并校验 SVG…</div>
      <template v-else-if="checkResult">
        <el-alert
          :type="checkResult.ok ? 'success' : 'error'"
          :closable="false"
          :title="checkResult.ok ? '规范化校验通过' : '校验未通过，不能入库'"
        />
        <div v-for="(issue, i) in checkResult.issues" :key="i" class="issue">
          <el-tag size="small" :type="issue.level === 'error' ? 'error' : issue.level === 'warning' ? 'warning' : 'info'">
            {{ issue.level === 'error' ? '错误' : issue.level === 'warning' ? '警告' : '建议' }}
          </el-tag>
          <span class="issue-msg">{{ issue.message }}</span>
        </div>
        <div v-if="checkResult.ok" class="confirm-row">
          <div class="confirm-thumb"><img :src="iconSvgUrl(selected!)" alt="preview" /></div>
          <el-form label-width="90px" class="confirm-form">
            <el-form-item label="符号名称">
              <el-input v-model="meta.name" :placeholder="selected!.split(':')[1]" style="width: 240px" />
            </el-form-item>
            <el-form-item label="分类">
              <el-radio-group v-model="meta.category">
                <el-radio v-for="(label, value) in CATEGORY_LABELS" :key="value" :value="value">{{ label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="标签">
              <el-input v-model="meta.tags" placeholder="选填，空格分隔" style="width: 320px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="confirmAdd">确认入库</el-button>
              <el-button @click="selected = null">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>
    </el-card>
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
.search-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.search-input {
  max-width: 480px;
}
.quick-words {
  margin-top: 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.quick-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.quick-tag {
  cursor: pointer;
}
.hint {
  color: var(--el-text-color-secondary);
}
.cand-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 10px;
}
.cand-card {
  border: 1px solid var(--app-border-green, #e0efe5);
  border-radius: 8px;
  padding: 10px 6px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cand-card:hover {
  border-color: var(--el-color-primary);
}
.cand-card.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
}
.cand-img {
  width: 36px;
  height: 36px;
}
.cand-name {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.issue {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.issue-msg {
  font-size: 13px;
}
.confirm-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-top: 12px;
}
.confirm-thumb {
  width: 96px;
  height: 96px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f3faf6;
}
.confirm-thumb img {
  width: 64px;
  height: 64px;
}
.confirm-form {
  flex: 1;
}

/* 移动端（spec/04 §9）：搜索行换行、控件全宽、网格更密 */
@media (max-width: 768px) {
  .search-row {
    flex-wrap: wrap;
  }
  .search-input {
    max-width: none;
    width: 100%;
  }
  .cand-grid {
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  }
  .confirm-row {
    flex-direction: column;
  }
}
</style>
