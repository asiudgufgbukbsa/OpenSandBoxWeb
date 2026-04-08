import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '仪表盘' },
  },
  {
    path: '/sandboxes',
    name: 'SandboxList',
    component: () => import('@/views/SandboxList.vue'),
    meta: { title: '沙箱列表' },
  },
  {
    path: '/sandboxes/create',
    name: 'CreateSandbox',
    component: () => import('@/views/CreateSandbox.vue'),
    meta: { title: '创建沙箱' },
  },
  {
    path: '/sandboxes/batch-create',
    name: 'BatchCreate',
    component: () => import('@/views/BatchCreate.vue'),
    meta: { title: '批量创建' },
  },
  {
    path: '/sandboxes/:id',
    name: 'SandboxDetail',
    component: () => import('@/views/SandboxDetail.vue'),
    meta: { title: '沙箱详情' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { title: '设置' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guards for page title
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'OpenSandbox'} | OpenSandbox Admin`;
  next();
});

export default router;
