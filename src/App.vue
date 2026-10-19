<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <el-container class="app-shell">
    <el-header class="app-header">
      <div class="brand">
        <span class="brand-mark">图</span>
        <span class="app-title">学生端 · 地图投影与符号设计</span>
      </div>
      <el-menu mode="horizontal" :default-active="route.path" router class="app-menu">
        <el-menu-item index="/projection">地图投影推荐</el-menu-item>
        <el-menu-item index="/smart-symbols">智能符号设计</el-menu-item>
        <el-menu-item index="/symbols">符号设计向导</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 32px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #dcefe3;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}
.brand-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2e825b, #63bd8f);
  color: #fff;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.app-title {
  font-weight: 700;
  color: #1f7a4d;
}
.app-menu {
  flex: 1;
  border-bottom: none;
  background: transparent;
}

/* 移动端（spec/04 §9）：收窄页头，隐藏文字标题保留标识，菜单项紧凑避免折叠 */
@media (max-width: 640px) {
  .app-header {
    gap: 12px;
    padding: 0 12px;
  }
  .app-title {
    display: none;
  }
  .app-menu {
    min-width: 0;
  }
  .app-menu :deep(.el-menu-item) {
    padding: 0 10px;
    font-size: 13px;
  }
}
</style>
