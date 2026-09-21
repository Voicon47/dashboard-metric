import ApiService from "./baseApi";
import type { QueueMetrics } from "../types";

export const queueApi = {
  /**
   * Lấy dữ liệu queue từ {origin}/api/Manager/Queues
   * baseUrl ví dụ: "https://host/api/metrics" → origin = "https://host"
   */
  getQueues: async (baseUrl: string, token?: string): Promise<QueueMetrics> => {
    const origin = new URL(baseUrl).origin;
    const url = `${origin}/api/Manager/Queues`;
    const response = await ApiService.GET(url, token, 5000);
    return response.data as QueueMetrics;
  },
};
