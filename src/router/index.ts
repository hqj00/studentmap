import { createRouter, createWebHashHistory } from 'vue-router'

// hash 路由（/#/projection）：任何静态托管/子路径都无需回退配置（spec/04 §7）
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/projection' },
    {
      path: '/projection',
      component: () => import('@/views/ProjectionRecommendView.vue'),
      meta: { title: '地图投影推荐' },
    },
    {
      path: '/smart-symbols',
      component: () => import('@/views/SmartSymbolDesignView.vue'),
      meta: { title: '智能符号设计' },
    },
    {
      path: '/symbols',
      component: () => import('@/views/SymbolDesignView.vue'),
      meta: { title: '符号设计向导' },
    },
  ],
})
