<template>
  <div class="sandbox-detail" v-loading="loading">
    <template v-if="sandbox">
      <!-- Header -->
      <el-page-header @back="$router.back()">
        <template #content>
          <div class="detail-header">
            <span class="sandbox-title">
              {{ sandbox.metadata?.name || truncateId(sandbox.id, 12) }}
            </span>
            <StatusBadge :state="sandbox.status.state" show-icon class="status-badge" />
          </div>
        </template>
        <template #extra>
          <div class="header-actions">
            <el-button
              v-if="sandbox.status.state === 'Running'"
              type="warning"
              @click="handlePause"
            >
              <el-icon><VideoPause /></el-icon>
              暂停
            </el-button>
            <el-button
              v-if="sandbox.status.state === 'Paused'"
              type="success"
              @click="handleResume"
            >
              <el-icon><VideoPlay /></el-icon>
              恢复
            </el-button>
            <el-popconfirm
              title="确定要删除此沙箱吗？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              @confirm="handleDelete"
            >
              <template #reference>
                <el-button type="danger">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-page-header>

      <!-- Info Cards -->
      <el-row :gutter="20" class="info-section">
        <el-col :xs="24" :lg="16">
          <el-card shadow="hover">
            <template #header>
              <span>沙箱信息</span>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="ID">
                <div class="id-cell">
                  <span>{{ sandbox.id }}</span>
                  <el-button size="small" link @click="copyToClipboard(sandbox.id)">
                    <el-icon><DocumentCopy /></el-icon>
                    复制
                  </el-button>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="镜像">
                {{ sandbox.image?.uri || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <StatusBadge :state="sandbox.status.state" />
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDate(sandbox.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="过期时间">
                <template v-if="sandbox.expiresAt">
                  <el-countdown
                    v-if="!isExpired(sandbox.expiresAt)"
                    :value="new Date(sandbox.expiresAt)"
                    format="HH:mm:ss"
                    :value-style="{ fontSize: '14px' }"
                  />
                  <el-tag v-else type="danger" size="small">已过期</el-tag>
                </template>
                <span v-else>永不过期</span>
              </el-descriptions-item>
              <el-descriptions-item label="状态信息">
                {{ sandbox.status.message || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="入口命令" :span="2">
                <code>{{ sandbox.entrypoint?.join(' ') || '-' }}</code>
              </el-descriptions-item>
              <el-descriptions-item label="资源限制">
                <div v-if="sandbox.resourceLimits">
                  <span v-if="sandbox.resourceLimits.cpu">CPU: {{ sandbox.resourceLimits.cpu }}</span>
                  <span v-if="sandbox.resourceLimits.memory" style="margin-left: 12px">
                    内存: {{ sandbox.resourceLimits.memory }}
                  </span>
                </div>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="超时时间">
                {{ sandbox.timeout ? formatDuration(sandbox.timeout) : '默认' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="8">
          <!-- TTL Extension -->
          <el-card shadow="hover" v-if="sandbox.expiresAt" class="ttl-card">
            <template #header>
              <span>续期</span>
            </template>
            <el-form @submit.prevent="handleRenewTTL">
              <el-form-item label="延长时间">
                <el-select v-model="ttlExtension" style="width: 100%">
                  <el-option label="10分钟" :value="600" />
                  <el-option label="30分钟" :value="1800" />
                  <el-option label="1小时" :value="3600" />
                  <el-option label="2小时" :value="7200" />
                </el-select>
              </el-form-item>
              <el-button type="primary" native-type="submit" :loading="renewLoading">
                续期
              </el-button>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <!-- Metrics (if running) -->
      <el-row :gutter="20" v-if="sandbox.status.state === 'Running'" class="metrics-section">
        <el-col :span="24">
          <el-card shadow="hover">
            <template #header>
              <span>资源监控</span>
            </template>
            <ResourcePanel :sandbox-id="sandbox.id" />
          </el-card>
        </el-col>
      </el-row>

      <!-- Environment & Metadata -->
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover">
            <template #header>
              <span>环境变量</span>
            </template>
            <el-empty v-if="!sandbox.env || Object.keys(sandbox.env).length === 0" description="无环境变量" />
            <el-descriptions v-else :column="1" border size="small">
              <el-descriptions-item
                v-for="(value, key) in sandbox.env"
                :key="key"
                :label="key"
              >
                <code>{{ value }}</code>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="12">
          <el-card shadow="hover">
            <template #header>
              <span>元数据</span>
            </template>
            <el-empty v-if="!sandbox.metadata || Object.keys(sandbox.metadata).length === 0" description="无元数据" />
            <el-descriptions v-else :column="1" border size="small">
              <el-descriptions-item
                v-for="(value, key) in sandbox.metadata"
                :key="key"
                :label="key"
              >
                {{ value }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- Not Found -->
    <el-empty v-else-if="!loading" description="沙箱不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  VideoPause,
  VideoPlay,
  Delete,
  DocumentCopy,
} from '@element-plus/icons-vue';
import { useSandboxStore, useNotificationStore } from '@/stores';
import { formatDate, isExpired, truncateId, copyToClipboard, formatDuration } from '@/utils/format';
import StatusBadge from '@/components/common/StatusBadge.vue';
import ResourcePanel from '@/components/metrics/ResourcePanel.vue';

const route = useRoute();
const router = useRouter();
const sandboxStore = useSandboxStore();
const notification = useNotificationStore();

const sandbox = computed(() => sandboxStore.currentSandbox);
const loading = computed(() => sandboxStore.loading);

const ttlExtension = ref(3600);
const renewLoading = ref(false);

const sandboxId = computed(() => route.params.id as string);

const fetchSandbox = async () => {
  if (sandboxId.value) {
    await sandboxStore.fetchSandbox(sandboxId.value);
  }
};

const handlePause = async () => {
  if (!sandboxId.value) return;
  try {
    await sandboxStore.pauseSandbox(sandboxId.value);
    notification.success('操作成功', '沙箱已暂停');
    fetchSandbox();
  } catch {
    notification.error('操作失败', '暂停沙箱失败');
  }
};

const handleResume = async () => {
  if (!sandboxId.value) return;
  try {
    await sandboxStore.resumeSandbox(sandboxId.value);
    notification.success('操作成功', '沙箱已恢复');
    fetchSandbox();
  } catch {
    notification.error('操作失败', '恢复沙箱失败');
  }
};

const handleDelete = async () => {
  if (!sandboxId.value) return;
  try {
    await sandboxStore.deleteSandbox(sandboxId.value);
    notification.success('删除成功', '沙箱已删除');
    router.push('/sandboxes');
  } catch {
    notification.error('删除失败', '删除沙箱失败');
  }
};

const handleRenewTTL = async () => {
  if (!sandboxId.value || !sandbox.value?.expiresAt) return;

  renewLoading.value = true;
  try {
    const currentExpiry = new Date(sandbox.value.expiresAt);
    const newExpiry = new Date(currentExpiry.getTime() + ttlExtension.value * 1000);
    await sandboxStore.renewExpiration(
      sandboxId.value,
      newExpiry.toISOString()
    );
    notification.success('续期成功', `已延长 ${formatDuration(ttlExtension.value)}`);
    fetchSandbox();
  } catch {
    notification.error('续期失败', '延长过期时间失败');
  } finally {
    renewLoading.value = false;
  }
};

onMounted(() => {
  fetchSandbox();
});

onUnmounted(() => {
  sandboxStore.clearCurrentSandbox();
});

// Auto refresh when sandbox is running
watch(
  () => sandbox.value?.status.state,
  (state) => {
    if (state === 'Running' || state === 'Pending' || state === 'Pausing' || state === 'Stopping') {
      const interval = setInterval(fetchSandbox, 5000);
      return () => clearInterval(interval);
    }
  }
);
</script>

<style scoped lang="scss">
.sandbox-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .sandbox-title {
      font-size: 18px;
      font-weight: 600;
    }

    .status-badge {
      margin-left: 8px;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .info-section {
    margin-top: 20px;
  }

  .id-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: monospace;
  }

  code {
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 13px;
  }

  .ttl-card {
    margin-bottom: 20px;
  }

  .metrics-section {
    margin-top: 20px;
  }

  :deep(.el-card) {
    margin-bottom: 20px;
  }

  :deep(.el-descriptions__label) {
    width: 100px;
  }
}
</style>
