<template>
  <el-header class="app-header">
    <div class="header-left">
      <div class="logo" @click="$router.push('/')">
        <el-icon :size="28"><Box /></el-icon>
        <span class="logo-text">OpenSandbox Admin</span>
      </div>
    </div>

    <div class="header-right">
      <el-tooltip content="刷新列表" placement="bottom">
        <el-button :icon="Refresh" circle @click="handleRefresh" />
      </el-tooltip>

      <el-tooltip content="设置" placement="bottom">
        <el-button :icon="Setting" circle @click="$router.push('/settings')" />
      </el-tooltip>

      <el-dropdown trigger="click">
        <el-button :icon="User" circle />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$router.push('/settings')">
              <el-icon><Setting /></el-icon>
              设置
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSandboxStore } from '@/stores';
import { Box, Refresh, Setting, User, SwitchButton } from '@element-plus/icons-vue';
import { clearApiKey } from '@/api';

const router = useRouter();
const sandboxStore = useSandboxStore();

const handleRefresh = () => {
  sandboxStore.fetchSandboxes();
};

const handleLogout = () => {
  clearApiKey();
  router.push('/settings');
};
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #409eff;

  .logo-text {
    font-size: 18px;
    font-weight: 600;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
