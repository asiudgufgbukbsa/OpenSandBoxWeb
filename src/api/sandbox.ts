import { lifecycleApi } from './index';
import type {
  Sandbox,
  CreateSandboxRequest,
  CreateSandboxResponse,
  ListSandboxesParams,
  ListSandboxesResponse,
  RenewExpirationRequest,
  RenewExpirationResponse,
  Endpoint,
} from './types';

export const sandboxApi = {
  /**
   * Create a new sandbox from a container image
   */
  async create(data: CreateSandboxRequest): Promise<CreateSandboxResponse> {
    const response = await lifecycleApi.post<CreateSandboxResponse>('/sandboxes', data);
    return response.data;
  },

  /**
   * List sandboxes with optional filtering and pagination
   */
  async list(params?: ListSandboxesParams): Promise<ListSandboxesResponse> {
    const queryParams = new URLSearchParams();

    if (params?.state) {
      if (Array.isArray(params.state)) {
        params.state.forEach((s) => queryParams.append('state', s));
      } else {
        queryParams.append('state', params.state);
      }
    }

    if (params?.metadata) {
      queryParams.append('metadata', params.metadata);
    }

    if (params?.page) {
      queryParams.append('page', String(params.page));
    }

    if (params?.pageSize) {
      queryParams.append('pageSize', String(params.pageSize));
    }

    const response = await lifecycleApi.get<ListSandboxesResponse>(
      `/sandboxes?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get a single sandbox by ID
   */
  async get(sandboxId: string): Promise<Sandbox> {
    const response = await lifecycleApi.get<Sandbox>(`/sandboxes/${sandboxId}`);
    return response.data;
  },

  /**
   * Delete a sandbox
   */
  async delete(sandboxId: string): Promise<void> {
    await lifecycleApi.delete(`/sandboxes/${sandboxId}`);
  },

  /**
   * Pause a running sandbox
   */
  async pause(sandboxId: string): Promise<void> {
    await lifecycleApi.post(`/sandboxes/${sandboxId}/pause`);
  },

  /**
   * Resume a paused sandbox
   */
  async resume(sandboxId: string): Promise<void> {
    await lifecycleApi.post(`/sandboxes/${sandboxId}/resume`);
  },

  /**
   * Renew sandbox expiration time
   */
  async renewExpiration(
    sandboxId: string,
    data: RenewExpirationRequest
  ): Promise<RenewExpirationResponse> {
    const response = await lifecycleApi.post<RenewExpirationResponse>(
      `/sandboxes/${sandboxId}/renew-expiration`,
      data
    );
    return response.data;
  },

  /**
   * Get sandbox endpoint for a specific port
   */
  async getEndpoint(sandboxId: string, port: number): Promise<Endpoint> {
    const response = await lifecycleApi.get<Endpoint>(
      `/sandboxes/${sandboxId}/endpoints/${port}`
    );
    return response.data;
  },

  /**
   * Batch create multiple sandboxes with concurrency control
   */
  async batchCreate(
    items: CreateSandboxRequest[],
    options?: { concurrency?: number; onProgress?: (completed: number, total: number) => void }
  ): Promise<{
    successful: CreateSandboxResponse[];
    failed: { request: CreateSandboxRequest; error: string }[];
  }> {
    const concurrency = options?.concurrency || 3;
    const successful: CreateSandboxResponse[] = [];
    const failed: { request: CreateSandboxRequest; error: string }[] = [];
    let completed = 0;

    // Process in batches with limited concurrency
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const results = await Promise.allSettled(
        batch.map((item) => this.create(item))
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          const error = result as PromiseRejectedResult;
          failed.push({
            request: batch[index],
            error: error.reason?.response?.data?.message || error.reason?.message || 'Unknown error',
          });
        }
        completed++;
        options?.onProgress?.(completed, items.length);
      });
    }

    return { successful, failed };
  },
};
