<template>
  <el-tag :type="tagType" :effect="effect" :size="size">
    <el-icon v-if="showIcon" class="status-icon">
      <component :is="statusIcon" />
    </el-icon>
    {{ label }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SandboxState } from '@/api/types';
import { STATE_COLORS, STATE_LABELS } from '@/utils/constants';
import {
  Loading,
  CircleCheck,
  VideoPause,
  CircleClose,
  Remove,
  Warning,
} from '@element-plus/icons-vue';

const props = defineProps<{
  state: SandboxState;
  size?: 'large' | 'default' | 'small';
  showIcon?: boolean;
}>();

const effect = computed(() => {
  return props.state === 'Running' ? 'dark' : 'light';
});

const tagType = computed(() => {
  return STATE_COLORS[props.state] as '' | 'success' | 'warning' | 'info' | 'danger';
});

const label = computed(() => STATE_LABELS[props.state] || props.state);

const statusIcon = computed(() => {
  const icons: Record<SandboxState, typeof Loading> = {
    Pending: Loading,
    Running: CircleCheck,
    Pausing: Loading,
    Paused: VideoPause,
    Stopping: Loading,
    Terminated: Remove,
    Failed: CircleClose,
  };
  return icons[props.state] || Warning;
});
</script>

<style scoped lang="scss">
.status-icon {
  margin-right: 4px;
  animation: spin 1s linear infinite;

  :deep(.el-tag--success &) {
    animation: none;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
