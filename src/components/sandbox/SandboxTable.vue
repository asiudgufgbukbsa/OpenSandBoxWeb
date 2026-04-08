<template>
  <div class="sandbox-table">
    <el-table
      :data="sandboxes"
      v-loading="loading"
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />

      <el-table-column label="ID" prop="id" width="280">
        <template #default="{ row }">
          <el-link
            type="primary"
            @click="$emit('detail', row.id)"
          >
            {{ truncateId(row.id, 12) }}
          </el-link>
        </template>
      </el-table-column>

      <el-table-column label="镜像" prop="image.uri" min-width="180">
        <template #default="{ row }">
          <el-tooltip :content="row.image?.uri || '-'" placement="top">
            <span class="truncate">{{ row.image?.uri || '-' }}</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column label="名称" prop="metadata.name" width="120">
        <template #default="{ row }">
          {{ row.metadata?.name || '-' }}
        </template>
      </el-table-column>

      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <StatusBadge :state="row.status.state" show-icon />
        </template>
      </el-table-column>

      <el-table-column label="资源" width="140">
        <template #default="{ row }">
          <div v-if="row.resourceLimits" class="resource-info">
            <span v-if="row.resourceLimits.cpu">CPU: {{ row.resourceLimits.cpu }}</span>
            <span v-if="row.resourceLimits.memory">内存: {{ row.resourceLimits.memory }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" prop="createdAt" width="170">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="过期时间" width="140">
        <template #default="{ row }">
          <template v-if="row.expiresAt">
            <el-countdown
              v-if="!isExpired(row.expiresAt)"
              :value="new Date(row.expiresAt)"
              format="HH:mm:ss"
              :value-style="{ fontSize: '12px' }"
            />
            <el-tag v-else type="danger" size="small">已过期</el-tag>
          </template>
          <span v-else class="text-muted">永不过期</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <SandboxActions
            :sandbox="row"
            :loading="actionLoading[row.id]"
            @pause="handlePause"
            @resume="handleResume"
            @delete="handleDelete"
            @detail="$emit('detail', $event)"
          />
        </template>
      </el-table-column>
    </el-table>

    <div v-if="showPagination" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Sandbox } from '@/api/types';
import { formatDate, isExpired, truncateId } from '@/utils/format';
import StatusBadge from '@/components/common/StatusBadge.vue';
import SandboxActions from './SandboxActions.vue';

const props = withDefaults(
  defineProps<{
    sandboxes: Sandbox[];
    loading?: boolean;
    total?: number;
    page?: number;
    pageSize?: number;
    showPagination?: boolean;
  }>(),
  {
    loading: false,
    total: 0,
    page: 1,
    pageSize: 20,
    showPagination: true,
  }
);

const emit = defineEmits<{
  (e: 'update:page', value: number): void;
  (e: 'update:pageSize', value: number): void;
  (e: 'selection-change', value: Sandbox[]): void;
  (e: 'pause', id: string): void;
  (e: 'resume', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'detail', id: string): void;
  (e: 'page-change', page: number): void;
}>();

const currentPage = ref(props.page);
const pageSize = ref(props.pageSize);
const selectedItems = ref<Sandbox[]>([]);
const actionLoading = ref<Record<string, string | null>>({});

watch(
  () => props.page,
  (val) => {
    currentPage.value = val;
  }
);

watch(
  () => props.pageSize,
  (val) => {
    pageSize.value = val;
  }
);

const handleSelectionChange = (selection: Sandbox[]) => {
  selectedItems.value = selection;
  emit('selection-change', selection);
};

const handleSizeChange = (size: number) => {
  emit('update:pageSize', size);
};

const handlePageChange = (page: number) => {
  emit('update:page', page);
  emit('page-change', page);
};

const handlePause = async (id: string) => {
  actionLoading.value[id] = 'pause';
  try {
    emit('pause', id);
  } finally {
    setTimeout(() => {
      actionLoading.value[id] = null;
    }, 1000);
  }
};

const handleResume = async (id: string) => {
  actionLoading.value[id] = 'resume';
  try {
    emit('resume', id);
  } finally {
    setTimeout(() => {
      actionLoading.value[id] = null;
    }, 1000);
  }
};

const handleDelete = (id: string) => {
  emit('delete', id);
};
</script>

<style scoped lang="scss">
.sandbox-table {
  .truncate {
    display: inline-block;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .resource-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
    color: #606266;
  }

  .text-muted {
    color: #909399;
    font-size: 12px;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>
