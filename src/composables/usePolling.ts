import { ref, onMounted, onUnmounted } from 'vue';

interface PollingOptions {
  interval: number;  // milliseconds
  immediate?: boolean;
  enabled?: boolean;
}

export function usePolling(
  callback: () => Promise<void> | void,
  options: PollingOptions
) {
  const { interval, immediate = true, enabled = true } = options;

  const isPolling = ref(enabled);
  const error = ref<Error | null>(null);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const start = () => {
    if (intervalId) return;

    isPolling.value = true;

    const poll = async () => {
      try {
        error.value = null;
        await callback();
      } catch (e) {
        error.value = e as Error;
        console.error('Polling error:', e);
      }
    };

    if (immediate) {
      poll();
    }

    intervalId = setInterval(poll, interval);
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isPolling.value = false;
  };

  const toggle = () => {
    if (isPolling.value) {
      stop();
    } else {
      start();
    }
  };

  onMounted(() => {
    if (enabled) {
      start();
    }
  });

  onUnmounted(() => {
    stop();
  });

  return {
    isPolling,
    error,
    start,
    stop,
    toggle,
  };
}
