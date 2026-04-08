<template>
  <div class="resource-panel">
    <el-row :gutter="20">
      <!-- CPU Usage -->
      <el-col :span="12">
        <el-card shadow="hover" class="metric-card">
          <template #header>
            <div class="card-header">
              <el-icon><Cpu /></el-icon>
              <span>CPU使用率</span>
            </div>
          </template>
          <div v-if="loading" class="loading-container">
            <el-icon class="is-loading" :size="40"><Loading /></el-icon>
          </div>
          <CpuGauge
            v-else
            :value="cpuUsage"
            :cores="metrics?.cpu_count || 1"
          />
        </el-card>
      </el-col>

      <!-- Memory Usage -->
      <el-col :span="12">
        <el-card shadow="hover" class="metric-card">
          <template #header>
            <div class="card-header">
              <el-icon><Memo /></el-icon>
              <span>内存使用率</span>
            </div>
          </template>
          <div v-if="loading" class="loading-container">
            <el-icon class="is-loading" :size="40"><Loading /></el-icon>
          </div>
          <MemoryGauge
            v-else
            :used="metrics?.mem_used_mib || 0"
            :total="metrics?.mem_total_mib || 1"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Historical Chart -->
    <el-card shadow="hover" class="chart-card">
      <template #header>
        <div class="card-header">
          <span>资源使用历史（最近5分钟）</span>
          <div class="connection-status">
            <el-tag :type="connected ? 'success' : 'danger'" size="small">
              {{ connected ? '已连接' : '未连接' }}
            </el-tag>
          </div>
        </div>
      </template>
      <MetricsChart :data="history" :loading="loading" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { Cpu, Memo, Loading } from '@element-plus/icons-vue';
import { useMetricsStore } from '@/stores';
import CpuGauge from './CpuGauge.vue';
import MemoryGauge from './MemoryGauge.vue';
import MetricsChart from './MetricsChart.vue';

const metricsStore = useMetricsStore();

const props = defineProps<{
  sandboxId: string;
}>();

const loading = computed(() => !metricsStore.currentMetrics && !metricsStore.error);
const connected = computed(() => metricsStore.isConnected);
const metrics = computed(() => metricsStore.currentMetrics);
const history = computed(() => metricsStore.metricsHistory);

const cpuUsage = computed(() => metricsStore.cpuUsagePercent);

onMounted(() => {
  if (props.sandboxId) {
    metricsStore.subscribe(props.sandboxId);
  }
});

onUnmounted(() => {
  metricsStore.stopSubscription();
});

// Re-subscribe if sandboxId changes
watch(() => props.sandboxId, (newId) => {
  if (newId) {
    metricsStore.subscribe(newId);
  }
});
</script>

<style scoped lang="scss">
.resource-panel {
  .metric-card {
    text-align: center;

    :deep(.el-card__header) {
      padding: 12px 16px;
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      font-size: 18px;
      color: #409eff;
    }

    .connection-status {
      margin-left: auto;
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .chart-card {
    margin-top: 20px;

    :deep(.el-card__header) {
      padding: 12px 16px;
    }
  }
}
</style>
