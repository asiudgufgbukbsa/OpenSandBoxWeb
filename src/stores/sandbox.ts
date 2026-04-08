import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { sandboxApi } from '@/api/sandbox';
import type {
  Sandbox,
  CreateSandboxRequest,
  ListSandboxesParams,
  SandboxState,
} from '@/api/types';

export const useSandboxStore = defineStore('sandbox', () => {
  // State
  const sandboxes = ref<Sandbox[]>([]);
  const currentSandbox = ref<Sandbox | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(20);

  // Filters
  const filters = ref<{
    state?: SandboxState;
    search?: string;
  }>({});

  // Computed
  const runningCount = computed(() =>
    sandboxes.value.filter((s) => s.status.state === 'Running').length
  );

  const pausedCount = computed(() =>
    sandboxes.value.filter((s) => s.status.state === 'Paused').length
  );

  const pendingCount = computed(() =>
    sandboxes.value.filter((s) => s.status.state === 'Pending').length
  );

  const failedCount = computed(() =>
    sandboxes.value.filter((s) => s.status.state === 'Failed').length
  );

  // Actions
  async function fetchSandboxes(params?: Partial<ListSandboxesParams>) {
    loading.value = true;
    error.value = null;
    try {
      const response = await sandboxApi.list({
        ...filters.value,
        page: page.value,
        pageSize: pageSize.value,
        ...params,
      });
      sandboxes.value = response.items;
      total.value = response.pagination.totalItems;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSandbox(id: string) {
    loading.value = true;
    error.value = null;
    try {
      currentSandbox.value = await sandboxApi.get(id);
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createSandbox(data: CreateSandboxRequest) {
    loading.value = true;
    error.value = null;
    try {
      const response = await sandboxApi.create(data);
      // Refetch to get full sandbox info
      const newSandbox = await sandboxApi.get(response.id);
      sandboxes.value.unshift(newSandbox);
      total.value++;
      return newSandbox;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteSandbox(id: string) {
    try {
      await sandboxApi.delete(id);
      sandboxes.value = sandboxes.value.filter((s) => s.id !== id);
      total.value--;
      if (currentSandbox.value?.id === id) {
        currentSandbox.value = null;
      }
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function pauseSandbox(id: string) {
    try {
      await sandboxApi.pause(id);
      // Optimistically update status
      const sandbox = sandboxes.value.find((s) => s.id === id);
      if (sandbox) {
        sandbox.status.state = 'Pausing';
      }
      if (currentSandbox.value?.id === id) {
        currentSandbox.value.status.state = 'Pausing';
      }
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function resumeSandbox(id: string) {
    try {
      await sandboxApi.resume(id);
      // Optimistically update status
      const sandbox = sandboxes.value.find((s) => s.id === id);
      if (sandbox) {
        sandbox.status.state = 'Running';
      }
      if (currentSandbox.value?.id === id) {
        currentSandbox.value.status.state = 'Running';
      }
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function renewExpiration(id: string, expiresAt: string) {
    try {
      const response = await sandboxApi.renewExpiration(id, { expiresAt });
      // Update sandbox in list
      const sandbox = sandboxes.value.find((s) => s.id === id);
      if (sandbox) {
        sandbox.expiresAt = response.expiresAt;
      }
      if (currentSandbox.value?.id === id) {
        currentSandbox.value.expiresAt = response.expiresAt;
      }
      return response;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  function updateSandboxInList(sandbox: Sandbox) {
    const index = sandboxes.value.findIndex((s) => s.id === sandbox.id);
    if (index !== -1) {
      sandboxes.value[index] = sandbox;
    }
  }

  function setFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters };
  }

  function setPage(newPage: number) {
    page.value = newPage;
  }

  function setPageSize(newSize: number) {
    pageSize.value = newSize;
  }

  function clearCurrentSandbox() {
    currentSandbox.value = null;
  }

  return {
    // State
    sandboxes,
    currentSandbox,
    loading,
    error,
    total,
    page,
    pageSize,
    filters,
    // Computed
    runningCount,
    pausedCount,
    pendingCount,
    failedCount,
    // Actions
    fetchSandboxes,
    fetchSandbox,
    createSandbox,
    deleteSandbox,
    pauseSandbox,
    resumeSandbox,
    renewExpiration,
    updateSandboxInList,
    setFilters,
    setPage,
    setPageSize,
    clearCurrentSandbox,
  };
});
