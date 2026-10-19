<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuth } from '@/modules/cloud/auth'

const { user, cloudEnabled, ensureInit, login, register, logout } = useAuth()
const router = useRouter()
onMounted(ensureInit)

const mode = ref<'login' | 'register'>('login')
const form = reactive({ username: '', password: '' })
const busy = ref(false)

async function submit() {
  if (!form.username.trim() || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  busy.value = true
  try {
    if (mode.value === 'register') {
      await register(form.username.trim(), form.password)
      ElMessage.success('注册成功，已自动登录；符号库已与云端同步')
    } else {
      await login(form.username.trim(), form.password)
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
      <p>登录后符号库存到你自己的云端账号下，换电脑也能取回；不登录则保持本机本地模式</p>
    </div>

    <el-alert
      v-if="!cloudEnabled"
      type="warning"
      :closable="false"
      title="当前部署未配置云端环境（VITE_TCB_ENV），为纯本地模式；教师部署时配置后此处即可注册/登录"
    />

    <el-card v-else-if="user" shadow="never" class="account-card">
      <template #header>当前账号</template>
      <p>已登录：<b>{{ user.username }}</b></p>
      <p class="hint">你的符号库已绑定到该账号，改动会自动同步到云端。</p>
      <el-button type="primary" @click="router.push('/symbols')">去符号库</el-button>
      <el-button @click="onLogout">退出登录</el-button>
    </el-card>

    <el-card v-else shadow="never" class="account-card">
      <el-tabs v-model="mode">
        <el-tab-pane label="登录" name="login" />
        <el-tab-pane label="注册" name="register" />
      </el-tabs>
      <el-form label-width="80px" @submit.prevent="submit">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="建议使用学号或姓名拼音" autocomplete="username" />
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
      <p class="hint">第一次使用：点上方「注册」，自己设用户名和密码即可，无需老师创建账号。密码仅用于云端认证（腾讯云开发 CloudBase），任何人（含教师端）都无法查看你的密码。</p>
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
</style>
