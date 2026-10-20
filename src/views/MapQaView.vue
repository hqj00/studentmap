<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { answerLocally, askByAI, type QaMessage } from '@/modules/qa/qaClient'
import { aiAvailable } from '@/modules/projection/aiClient'

interface ChatItem extends QaMessage {
  /** 回答来源（spec/07 §3.1）：AI 助教 / 离线知识库 */
  source?: 'ai' | 'local'
}

const SUGGESTIONS = [
  '什么是地图投影？为什么会有变形？',
  '等角、等积、等距投影有什么区别？',
  '中国全图常用什么投影？参数怎么设？',
  '为什么世界地图上的格陵兰看起来和非洲差不多大？',
  'Tissot 变形椭圆怎么看？',
  '墨卡托投影适合做什么图？',
  '大比例尺地形图为什么用高斯-克吕格投影？',
  'WGS84 和 CGCS2000 是什么关系？',
]

const messages = ref<ChatItem[]>([])
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
  messages.value.push({ role: 'user', content: question })
  loading.value = true
  await scrollToBottom()
  try {
    if (!aiAvailable) {
      // 未配置 AI 代理：直接走离线知识库，不发注定失败的请求
      messages.value.push({ role: 'assistant', content: answerLocally(question), source: 'local' })
      return
    }
    // 只发用户/助手对话历史，不带 source 等本地字段
    const history: QaMessage[] = messages.value.map(({ role, content }) => ({ role, content }))
    const answer = await askByAI(history)
    messages.value.push({ role: 'assistant', content: answer, source: 'ai' })
  } catch {
    // spec/07 §3.3：AI 不可用自动降级为离线知识库，并如实标注来源
    messages.value.push({ role: 'assistant', content: answerLocally(question), source: 'local' })
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

function onEnter(e: KeyboardEvent) {
  if (e.shiftKey) return // Shift+Enter 换行
  e.preventDefault()
  send()
}

function clear() {
  messages.value = []
  ElMessage.success('对话已清空')
}
</script>

<template>
  <div class="page">
    <div class="page-hero">
      <h2>地图学问答</h2>
      <p>{{ aiAvailable ? 'AI 助教回答地图学问题（投影、坐标系、比例尺、符号、制图综合）；AI 不可用时自动切换站内离线知识库' : '站内离线知识库回答常用地图学问题（投影、坐标系、比例尺、符号、制图综合）' }}</p>
    </div>

    <el-card shadow="never" class="chat-card">
      <div ref="listEl" class="chat-list">
        <div v-if="messages.length === 0" class="chat-empty">
          <p>你好，我是地图学助教。可以从下面的常见问题开始，或直接输入你的问题。</p>
        </div>
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="chat-row"
          :class="m.role"
        >
          <div class="bubble">
            <p class="bubble-text">{{ m.content }}</p>
            <p v-if="m.role === 'assistant'" class="bubble-meta">
              <el-tag size="small" :type="m.source === 'ai' ? 'success' : 'info'">
                {{ m.source === 'ai' ? 'AI 助教（AI 生成，供学习参考）' : '离线知识库' }}
              </el-tag>
            </p>
          </div>
        </div>
        <div v-if="loading" class="chat-row assistant">
          <div class="bubble thinking">助教思考中…（慢模型首字可能需 1 分钟以上）</div>
        </div>
      </div>

      <div class="suggestions">
        <el-tag
          v-for="s in SUGGESTIONS"
          :key="s"
          class="suggestion"
          effect="plain"
          @click="send(s)"
        >
          {{ s }}
        </el-tag>
      </div>

      <div class="composer">
        <el-input
          v-model="input"
          type="textarea"
          :rows="2"
          resize="none"
          placeholder="输入地图学相关问题，Enter 发送，Shift+Enter 换行"
          @keydown.enter="onEnter"
        />
        <div class="composer-btns">
          <el-button size="small" text :disabled="messages.length === 0" @click="clear">清空对话</el-button>
          <el-button type="primary" :loading="loading" :disabled="!input.trim()" @click="send()">发送</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
}
.chat-card {
  margin-top: 16px;
}
.chat-list {
  height: 52vh;
  min-height: 320px;
  overflow-y: auto;
  padding: 4px 2px;
}
.chat-empty {
  color: var(--el-text-color-secondary);
  text-align: center;
  padding: 32px 16px 16px;
  font-size: 14px;
}
.chat-row {
  display: flex;
  margin: 10px 0;
}
.chat-row.user {
  justify-content: flex-end;
}
.bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 12px;
  line-height: 1.8;
  font-size: 14px;
}
.chat-row.user .bubble {
  background: #2e825b;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.chat-row.assistant .bubble {
  background: #f0f8f3;
  border: 1px solid #dcefe3;
  border-bottom-left-radius: 4px;
}
.bubble-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.bubble-meta {
  margin: 8px 0 0;
}
.thinking {
  color: var(--el-text-color-secondary);
}
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 12px;
  padding-top: 12px;
  border-top: 1px dashed #dcefe3;
}
.suggestion {
  cursor: pointer;
  white-space: normal;
  height: auto;
  padding: 4px 10px;
  line-height: 1.5;
}
.suggestion:hover {
  color: #1f7a4d;
  border-color: #8fceb0;
}
.composer-btns {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

@media (max-width: 640px) {
  .bubble {
    max-width: 92%;
  }
}
</style>
