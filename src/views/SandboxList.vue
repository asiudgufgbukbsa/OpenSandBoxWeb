<template>
  <div class="sandbox-list">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>沙箱列表</span>
          <el-button type="primary" @click="$router.push('/sandboxes/create')">
            <el-icon><Plus /></el-icon>
            创建沙箱
          </el-button>
        </div>
      </template>

      <!-- Filters -->
      <SandboxFilters
        v-model="filterState"
        @filter="handleFilter"
      />

      <!-- Table -->
      <SandboxTable
        :sandboxes="sandboxStore.sandboxes"
        :loading="sandboxStore.loading"
        :total="sandboxStore.total"
        :page="sandboxStore.page"
        :page-size="sandboxStore.pageSize"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        @detail="handleDetail"
        @pause="handlePause"
        @resume="handleResume"
        @delete="handleDelete"
        @selection-change="handleSelectionChange"
      />
    </el-card>

    <!-- Batch Actions Bar -->
    <transition name="slide-up">
      <div v-if="selectedSandboxes.length > 0" class="batch-actions-bar">
        <span>已选择 {{ selectedSandboxes.length }} 个沙箱</span>
        <el-button type="danger" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { useSandboxStore, useNotificationStore } from '@/stores';
import { usePolling } from '@/composables/usePolling';
import type { Sandbox, SandboxState } from '@/api/types';
import SandboxFilters from '@/components/sandbox/SandboxFilters.vue';
import SandboxTable from '@/components/sandbox/SandboxTable.vue';

const router = useRouter();
const sandboxStore = useSandboxStore();
const notification = useNotificationStore();

const filterState = ref<{
  state?: SandboxState;
  search?: string;
}>({});

const selectedSandboxes = ref<Sandbox[]>([]);

// Auto refresh every 30 seconds
const { start: startPolling, stop: stopPolling } = usePolling(
  () => sandboxStore.fetchSandboxes(),
  { interval: 30000, immediate: false }
);

const handleFilter = (filters: typeof filterState.value) => {
  sandboxStore.setFilters(filters);
  sandboxStore.setPage(1);
  sandboxStore.fetchSandboxes();
};

const handlePageChange = (page: number) => {
  sandboxStore.setPage(page);
  sandboxStore.fetchSandboxes();
};

const handlePageSizeChange = (size: number) => {
  sandboxStore.setPageSize(size);
  sandboxStore.setPage(1);
  sandboxStore.fetchSandboxes();
};

const handleDetail = (id: string) => {
  router.push(`/sandboxes/${id}`);
};

const handlePause = async (id: string) => {
  try {
    await sandboxStore.pauseSandbox(id);
    notification.success('操作成功', `沙箱已暂停`);
    sandboxStore.fetchSandboxes();
  } catch {
    notification.error('操作失败', '暂停沙箱失败');
  }
};

const handleResume = async (id: string) => {
  try {
    await sandboxStore.resumeSandbox(id);
    notification.success('操作成功', `沙箱已恢复`);
    sandboxStore.fetchSandboxes();
  } catch {
    notification.error('操作失败', '恢复沙箱失败');
  }
};

const handleDelete = async (id: string) => {
  try {
    await sandboxStore.deleteSandbox(id);
    notification.success('删除成功', '沙箱已删除');
    sandboxStore.fetchSandboxes();
  } catch {
    notification.error('删除失败', '删除沙箱失败');
  }
};

const handleSelectionChange = (selection: Sandbox[]) => {
  selectedSandboxes.value = selection;
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedSandboxes.value.length} 个沙箱吗？`,
      '批量删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const ids = selectedSandboxes.value.map((s) => s.id);
    await Promise.all(ids.map((id) => sandboxStore.deleteSandbox(id)));
    notification.success('删除成功', `已删除 ${ids.length} 个沙箱`);
    selectedSandboxes.value = [];
    sandboxStore.fetchSandboxes();
  } catch {
    // User cancelled or error
  }
};

onMounted(() => {
  sandboxStore.fetchSandboxes();
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped lang="scss">
.sandbox-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .batch-actions-bar {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 100;
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.3s ease;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
}
</style>
