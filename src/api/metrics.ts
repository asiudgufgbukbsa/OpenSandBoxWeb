import { lifecycleApi } from './index';
import type { Metrics, SSEMetricsEvent, Endpoint } from './types';

export const metricsApi = {
  /**
   * Get execd endpoint for a sandbox
   * Execd runs inside each sandbox on port 44772, but external access
   * requires getting the dynamic endpoint from Lifecycle API
   */
  async getExecdEndpoint(sandboxId: string): Promise<string> {
    const response = await lifecycleApi.get<Endpoint>(
      `/sandboxes/${sandboxId}/endpoints/44772`
    );
    return response.data.endpoint;
  },

  /**
   * Get current metrics snapshot for a sandbox
   */
  async getSnapshot(sandboxId: string): Promise<Metrics> {
    const endpoint = await this.getExecdEndpoint(sandboxId);
    const response = await fetch(`http://${endpoint}/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Create SSE connection for real-time metrics
   * Returns cleanup function
   */
  subscribeToMetrics(
    sandboxId: string,
    onEvent: (event: SSEMetricsEvent) => void
  ): () => void {
    let eventSource: EventSource | null = null;
    let cleanup: (() => void) | null = null;

    // First get the endpoint, then establish SSE connection
    this.getExecdEndpoint(sandboxId)
      .then((endpoint) => {
        eventSource = new EventSource(`http://${endpoint}/metrics/watch`);

        eventSource.onopen = () => {
          onEvent({ type: 'connected' });
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as Metrics;
            onEvent({ type: 'metrics', data });
          } catch (error) {
            console.error('Failed to parse metrics:', error);
          }
        };

        eventSource.onerror = () => {
          onEvent({ type: 'error', error: 'Connection failed' });
        };
      })
      .catch((error) => {
        onEvent({ type: 'error', error: error.message || 'Failed to get endpoint' });
      });

    // Return cleanup function
    cleanup = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };

    return cleanup || (() => {});
  },
};
