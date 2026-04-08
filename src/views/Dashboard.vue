<template>
  <div class="dashboard">
    <!-- Stats Cards -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card running">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.running }}</div>
              <div class="stat-label">运行中</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card paused">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><VideoPause /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.paused }}</div>
              <div class="stat-label">已暂停</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card pending">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">创建中</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card failed">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.failed }}</div>
              <div class="stat-label">失败</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Quick Actions -->
    <el-row :gutter="20" class="actions-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/sandboxes/create')">
              <el-icon><Plus /></el-icon>
              创建沙箱
            </el-button>
            <el-button @click="$router.push('/sandboxes/batch-create')">
              <el-icon><DocumentAdd /></el-icon>
              批量创建
            </el-button>
            <el-button @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新列表
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Recent Sandboxes -->
    <el-row :gutter="20" class="recent-section">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近沙箱</span>
              <el-button link type="primary" @click="$router.push('/sandboxes')">
                查看全部
              </el-button>
            </div>
          </template>
          <SandboxTable
            :sandboxes="recentSandboxes"
            :loading="loading"
            :show-pagination="false"
            @detail="handleDetail"
            @pause="handlePause"
            @resume="handleResume"
            @delete="handleDelete"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import {
  VideoPlay,
  VideoPause,
  Loading,
  Warning,
  Plus,
  DocumentAdd,
  Refresh,
} from '@element-plus/icons-vue';
import { useSandboxStore, useNotificationStore } from '@/stores';
import { usePolling } from '@/composables/usePolling';
import SandboxTable from '@/components/sandbox/SandboxTable.vue';

const router = useRouter();
const sandboxStore = useSandboxStore();
const notification = useNotificationStore();

const stats = computed(() => ({
  running: sandboxStore.runningCount,
  paused: sandboxStore.pausedCount,
  pending: sandboxStore.pendingCount,
  failed: sandboxStore.failedCount,
}));

const recentSandboxes = computed(() => sandboxStore.sandboxes.slice(0, 10));

const loading = computed(() => sandboxStore.loading);

// Refresh data every 30 seconds
const { isPolling, start: startPolling, stop: stopPolling } = usePolling(
  () => sandboxStore.fetchSandboxes({ pageSize: 100 }),
  { interval: 30000, immediate: true }
);

const handleRefresh = () => {
  sandboxStore.fetchSandboxes({ pageSize: 100 });
};

const handleDetail = (id: string) => {
  router.push(`/sandboxes/${id}`);
};

const handlePause = async (id: string) => {
  try {
    await sandboxStore.pauseSandbox(id);
    notification.success('操作成功', `沙箱 ${id} 已暂停`);
    handleRefresh();
  } catch {
    notification.error('操作失败', `暂停沙箱 ${id} 失败`);
  }
};

const handleResume = async (id: string) => {
  try {
    await sandboxStore.resumeSandbox(id);
    notification.success('操作成功', `沙箱 ${id} 已恢复`);
    handleRefresh();
  } catch {
    notification.error('操作失败', `恢复沙箱 ${id} 失败`);
  }
};

const handleDelete = async (id: string) => {
  try {
    await sandboxStore.deleteSandbox(id);
    notification.success('删除成功', `沙箱 ${id} 已删除`);
    handleRefresh();
  } catch {
    notification.error('删除失败', `删除沙箱 ${id} 失败`);
  }
};

onMounted(() => {
  handleRefresh();
});
</script>

<style scoped lang="scss">
.dashboard {
  .stats-row {
    margin-bottom: 20px;

    .el-col {
      margin-bottom: 20px;
    }
  }

  .stat-card {
    :deep(.el-card__body) {
      padding: 20px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #fff;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 600;
      color: #303133;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
    }

    &.running .stat-icon {
      background: linear-gradient(135deg, #67c23a, #85ce61);
    }

    &.paused .stat-icon {
      background: linear-gradient(135deg, #409eff, #66b1ff);
    }

    &.pending .stat-icon {
      background: linear-gradient(135deg, #e6a23c, #ebb563);
    }

    &.failed .stat-icon {
      background: linear-gradient(135deg, #f56c6c, #f78989);
    }
  }

  .actions-row {
    margin-bottom: 20px;
  }

  .quick-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .recent-section {
    :deep(.el-card__body) {
      padding: 0;
    }
  }
}
</style>
