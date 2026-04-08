<template>
  <div class="sandbox-filters">
    <el-form :inline="true" :model="filterForm" @submit.prevent="handleFilter">
      <el-form-item label="状态">
        <el-select
          v-model="filterForm.state"
          placeholder="全部状态"
          clearable
          @change="handleFilter"
        >
          <el-option
            v-for="state in SANDBOX_STATES"
            :key="state"
            :label="STATE_LABELS[state]"
            :value="state"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="搜索">
        <el-input
          v-model="filterForm.search"
          placeholder="搜索ID或名称"
          clearable
          @keyup.enter="handleFilter"
          @clear="handleFilter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleFilter">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { SandboxState } from '@/api/types';
import { SANDBOX_STATES, STATE_LABELS } from '@/utils/constants';
import { Search, Refresh } from '@element-plus/icons-vue';

const props = defineProps<{
  modelValue?: {
    state?: SandboxState;
    search?: string;
  };
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof filterForm): void;
  (e: 'filter', value: typeof filterForm): void;
}>();

const filterForm = reactive({
  state: props.modelValue?.state || undefined as SandboxState | undefined,
  search: props.modelValue?.search || '',
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      filterForm.state = val.state;
      filterForm.search = val.search || '';
    }
  }
);

const handleFilter = () => {
  emit('update:modelValue', { ...filterForm });
  emit('filter', { ...filterForm });
};

const handleReset = () => {
  filterForm.state = undefined;
  filterForm.search = '';
  handleFilter();
};
</script>

<style scoped lang="scss">
.sandbox-filters {
  padding: 16px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 16px;

  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
