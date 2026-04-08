<template>
  <div class="sandbox-actions">
    <el-button
      v-if="sandbox.status.state === 'Running'"
      type="warning"
      size="small"
      :loading="loading === 'pause'"
      @click="$emit('pause', sandbox.id)"
    >
      <el-icon><VideoPause /></el-icon>
      暂停
    </el-button>

    <el-button
      v-if="sandbox.status.state === 'Paused'"
      type="success"
      size="small"
      :loading="loading === 'resume'"
      @click="$emit('resume', sandbox.id)"
    >
      <el-icon><VideoPlay /></el-icon>
      恢复
    </el-button>

    <el-button
      type="primary"
      size="small"
      plain
      @click="$emit('detail', sandbox.id)"
    >
      <el-icon><View /></el-icon>
      详情
    </el-button>

    <el-popconfirm
      title="确定要删除此沙箱吗？"
      confirm-button-text="删除"
      cancel-button-text="取消"
      @confirm="$emit('delete', sandbox.id)"
    >
      <template #reference>
        <el-button
          type="danger"
          size="small"
          :loading="loading === 'delete'"
          :disabled="sandbox.status.state === 'Stopping'"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </template>
    </el-popconfirm>
  </div>
</template>

<script setup lang="ts">
import type { Sandbox } from '@/api/types';
import { VideoPause, VideoPlay, View, Delete } from '@element-plus/icons-vue';

defineProps<{
  sandbox: Sandbox;
  loading?: string | null;
}>();

defineEmits<{
  (e: 'pause', id: string): void;
  (e: 'resume', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'detail', id: string): void;
}>();
</script>

<style scoped lang="scss">
.sandbox-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
