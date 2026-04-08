<template>
  <el-aside :width="isCollapsed ? '64px' : '220px'" class="app-sidebar">
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapsed"
      :router="true"
      class="sidebar-menu"
    >
      <el-menu-item index="/dashboard">
        <el-icon><Odometer /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>

      <el-menu-item index="/sandboxes">
        <el-icon><List /></el-icon>
        <template #title>沙箱列表</template>
      </el-menu-item>

      <el-menu-item index="/sandboxes/create">
        <el-icon><Plus /></el-icon>
        <template #title>创建沙箱</template>
      </el-menu-item>

      <el-menu-item index="/sandboxes/batch-create">
        <el-icon><DocumentAdd /></el-icon>
        <template #title>批量创建</template>
      </el-menu-item>

      <el-divider />

      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <template #title>设置</template>
      </el-menu-item>
    </el-menu>

    <div class="collapse-trigger" @click="isCollapsed = !isCollapsed">
      <el-icon :size="18">
        <Fold v-if="!isCollapsed" />
        <Expand v-else />
      </el-icon>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  Odometer,
  List,
  Plus,
  DocumentAdd,
  Setting,
  Fold,
  Expand,
} from '@element-plus/icons-vue';

const route = useRoute();
const isCollapsed = ref(false);

const activeMenu = computed(() => {
  // Handle nested routes
  if (route.path.startsWith('/sandboxes/') && route.params.id) {
    return route.path;
  }
  return route.path;
});
</script>

<style scoped lang="scss">
.app-sidebar {
  background: #fff;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
}

.collapse-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  cursor: pointer;
  border-top: 1px solid #e6e6e6;
  color: #909399;
  transition: all 0.3s;

  &:hover {
    color: #409eff;
    background: #f5f7fa;
  }
}
</style>
