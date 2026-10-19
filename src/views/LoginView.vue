<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuth } from '@/modules/cloud/auth'
import { cloudProvider } from '@/modules/cloud/client'

const { user, cloudEnabled, ensureInit, login, register, logout, sendEmailCode } = useAuth()
const router = useRouter()
onMounted(ensureInit)

const PROVIDER_LABELS = {
  'class-server': '班级服务器',
  cloudbase: 'CloudBase 云端',
  local: '纯本地',
} as const

const isClassServer = computed(() => cloudProvider.value === 'class-server')
const isCloudbase = computed(() => cloudProvider.value === 'cloudbase')

const mode = ref<'login' | 'register'>('login')
// 班级服务器用用户名；CloudBase 用邮箱（官方不允许用户名+密码直接注册，spec/06 §3）
const form = reactive({ account: '', password: '', emailCode: '' })
const busy = ref(false)
const sendingCode = ref(false)
const codeSent = ref(false)

async function onSendCode() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.account)) {
    ElMessage.warning('请输入正确的邮箱地址')
    return
  }
  sendingCode.value = true
  try {
    await sendEmailCode(form.account.trim())
    codeSent.value = true
    ElMessage.success('验证码已发送到邮箱，请查收（含垃圾邮件）')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e))
  } finally {
    sendingCode.value = false
  }
}

async function submit() {
  if (!form.account.trim() || !form.password) {
    ElMessage.warning(isCloudbase.value ? '请输入邮箱和密码' : '请输入用户名和密码')
    return
  }
  busy.value = true
  try {
    if (mode.value === 'register') {
      await register(form.account.trim(), form.password, form.emailCode.trim() || undefined)
      ElMessage.success('注册成功，已自动登录；符号库已与云端同步')
    } else {
      await login(form.account.trim(), form.password)
      ElMessage.success('登录成功，符号库已与云端同步')
    }
    router.push('/symbols')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e))
  } finally {
    busy.value = false
  }
}

async function onLogout() {
  await logout()
  ElMessage.success('已退出登录，符号库保留在本机')
}
</script>

<template>
  <div class="page">
    <div class="page-hero">
      <h2>登录云账号</h2>
      <p>登录后符号库存到你自己的账号下，换电脑也能取回；不登录则保持本机本地模式</p>
    </div>

    <el-alert
      v-if="!cloudEnabled"
      type="warning"
      :closable="false"
      title="当前为纯本地模式（未探测到班级服务器、未配置云端环境），教师部署后此处即可注册/登录"
    />

    <el-card v-else-if="user" shadow="never" class="account-card">
      <template #header>当前账号</template>
      <p>已登录：<b>{{ user.username }}</b> <el-tag size="small" type="success">{{ PROVIDER_LABELS[cloudProvider] }}</el-tag></p>
      <p class="hint">你的符号库已绑定到该账号，改动会自动同步。</p>
      <el-button type="primary" @click="router.push('/symbols')">去符号库</el-button>
      <el-button @click="onLogout">退出登录</el-button>
    </el-card>

    <el-card v-else shadow="never" class="account-card">
      <el-tabs v-model="mode">
        <el-tab-pane label="登录" name="login" />
        <el-tab-pane label="注册" name="register" />
      </el-tabs>
      <el-form label-width="80px" @submit.prevent="submit">
        <el-form-item :label="isCloudbase ? '邮箱' : '用户名'">
          <el-input
            v-model="form.account"
            :placeholder="isCloudbase ? '如：xxx@qq.com' : '建议使用学号或姓名拼音'"
            autocomplete="username"
          />
        </el-form-item>

        <!-- CloudBase 注册：邮箱验证码（spec/06 §3） -->
        <el-form-item v-if="isCloudbase && mode === 'register'" label="验证码">
          <div class="code-row">
            <el-input v-model="form.emailCode" placeholder="邮箱收到的验证码" class="code-input" />
            <el-button :loading="sendingCode" @click="onSendCode">
              {{ codeSent ? '重新发送' : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="至少 6 位"
            autocomplete="current-password"
            @keyup.enter="submit"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="busy" @click="submit">
            {{ mode === 'login' ? '登录' : '注册并登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <p class="hint">
        第一次使用：点上方「注册」自助创建账号，无需老师创建。密码只存加盐哈希，任何人（含教师端）都看不到明文。
        <span v-if="isCloudbase">注册需邮箱收验证码；之后用邮箱 + 密码登录。</span>
      </p>
      <p class="hint provider-hint">当前后端：{{ PROVIDER_LABELS[cloudProvider] }}</p>
    </el-card>
  </div>
</template>

<style scoped>
.page {
  max-width: 480px;
  margin: 0 auto;
}
.account-card {
  margin-top: 16px;
}
.hint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.code-row {
  display: flex;
  gap: 8px;
  width: 100%;
}
.code-input {
  flex: 1;
}
.provider-hint {
  margin-bottom: 0;
  text-align: right;
  font-size: 12px;
}
</style>
