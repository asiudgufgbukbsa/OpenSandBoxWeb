import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { metricsApi } from '@/api/metrics';
import type { Metrics, MetricsHistoryPoint } from '@/api/types';

export const useMetricsStore = defineStore('metrics', () => {
  // State
  const currentMetrics = ref<Metrics | null>(null);
  const metricsHistory = ref<MetricsHistoryPoint[]>([]);
  const isConnected = ref(false);
  const error = ref<string | null>(null);
  const currentSandboxId = ref<string | null>(null);

  // Max history length (5 minutes at 1s intervals)
  const MAX_HISTORY = 300;

  // Cleanup function holder
  let cleanupFn: (() => void) | null = null;

  // Computed
  const cpuUsagePercent = computed(() => currentMetrics.value?.cpu_used_pct ?? 0);

  const memoryUsagePercent = computed(() => {
    if (!currentMetrics.value) return 0;
    const { mem_used_mib, mem_total_mib } = currentMetrics.value;
    return (mem_used_mib / mem_total_mib) * 100;
  });

  const formattedMemory = computed(() => {
    if (!currentMetrics.value) return { used: '0', total: '0' };
    return {
      used: `${currentMetrics.value.mem_used_mib.toFixed(1)} MiB`,
      total: `${currentMetrics.value.mem_total_mib.toFixed(1)} MiB`,
    };
  });

  // Actions
  async function fetchSnapshot(sandboxId: string) {
    try {
      const metrics = await metricsApi.getSnapshot(sandboxId);
      currentMetrics.value = metrics;
      addToHistory(metrics);
    } catch (e: any) {
      error.value = e.message;
    }
  }

  function subscribe(sandboxId: string) {
    // Don't resubscribe if same sandbox
    if (currentSandboxId.value === sandboxId && isConnected.value) {
      return;
    }

    // Unsubscribe from any existing subscription
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }

    // Reset state
    metricsHistory.value = [];
    error.value = null;
    isConnected.value = false;
    currentSandboxId.value = sandboxId;

    cleanupFn = metricsApi.subscribeToMetrics(sandboxId, (event) => {
      switch (event.type) {
        case 'connected':
          isConnected.value = true;
          error.value = null;
          break;
        case 'metrics':
          if (event.data) {
            currentMetrics.value = event.data;
            addToHistory(event.data);
          }
          break;
        case 'error':
          isConnected.value = false;
          error.value = event.error || null;
          break;
      }
    });
  }

  function stopSubscription() {
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }
    isConnected.value = false;
    currentSandboxId.value = null;
  }

  function addToHistory(metrics: Metrics) {
    metricsHistory.value.push({
      timestamp: metrics.timestamp,
      cpu: metrics.cpu_used_pct,
      memory: (metrics.mem_used_mib / metrics.mem_total_mib) * 100,
    });
    if (metricsHistory.value.length > MAX_HISTORY) {
      metricsHistory.value.shift();
    }
  }

  function clearHistory() {
    metricsHistory.value = [];
  }

  return {
    // State
    currentMetrics,
    metricsHistory,
    isConnected,
    error,
    currentSandboxId,
    // Computed
    cpuUsagePercent,
    memoryUsagePercent,
    formattedMemory,
    // Actions
    fetchSnapshot,
    subscribe,
    stopSubscription,
    clearHistory,
  };
});
