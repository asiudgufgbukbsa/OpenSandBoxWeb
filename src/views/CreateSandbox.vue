<template>
  <div class="create-sandbox">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-page-header @back="$router.back()">
            <template #content>
              <span class="title">创建沙箱</span>
            </template>
          </el-page-header>
        </div>
      </template>

      <CreateForm :loading="loading" @submit="handleSubmit" @reset="handleReset" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSandboxStore, useNotificationStore } from '@/stores';
import type { CreateSandboxRequest } from '@/api/types';
import CreateForm from '@/components/sandbox/CreateForm.vue';

const router = useRouter();
const sandboxStore = useSandboxStore();
const notification = useNotificationStore();

const loading = ref(false);

const handleSubmit = async (data: CreateSandboxRequest) => {
  loading.value = true;
  try {
    const sandbox = await sandboxStore.createSandbox(data);
    notification.success('创建成功', `沙箱 ${sandbox.id} 已创建`);
    router.push(`/sandboxes/${sandbox.id}`);
  } catch {
    notification.error('创建失败', '创建沙箱失败，请检查配置');
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  // Form reset is handled by the component
};
</script>

<style scoped lang="scss">
.create-sandbox {
  .card-header {
    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }
}
</style>
