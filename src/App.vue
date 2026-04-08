<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <AppSidebar />
      <div class="main-container">
        <AppHeader />
        <main class="main-content">
          <router-view />
        </main>
      </div>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
</script>

<style lang="scss">
@import '@/styles/global.scss';

.app-container {
  display: flex;
  min-height: 100vh;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
}
</style>
