import ApiService from "./baseApi";
import type { QueueMetrics } from "../types";
import { getBaseUrl } from "../utils/urlFormatter";

export const queueApi = {
  /**
   * Lấy dữ liệu queue từ {origin}/api/Manager/Queues
   * baseUrl ví dụ: "https://host/api/metrics" → origin = "https://host"
   */
  getQueues: async (baseUrl: string, token?: string): Promise<QueueMetrics> => {
    const origin = getBaseUrl(baseUrl);
    const url = `${origin}/api/Manager/Queues`;
    const response = await ApiService.GET(url, token, 5000);
    return response.data as QueueMetrics;
  },
};
