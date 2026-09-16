// ============================================================
// ADSUN Dashboard — serverApi.ts
// API layer: HTTP calls + delegate parse sang normalizeMetrics
// ============================================================

import ApiService from "./baseApi";
import type { ServerMetrics, Endpoint } from "../types";
import {
  normalizeServerData,
  type RawMetricsResponse,
} from "../utils/normalizeMetrics";

export const serverApi = {
  /**
   * Ping: Gọi API đến Node, đo RTT. Ném lỗi nếu server offline hoặc trả về HTML.
   */
  ping: async (baseUrl: string, token?: string): Promise<number> => {
    const startTime = performance.now();
    const response = await ApiService.GET(baseUrl, token);
    const contentType = response?.headers?.["content-type"];
    if (contentType && contentType.includes("text/html")) {
      throw new Error(
        "Invalid endpoint: Server trả về HTML thay vì dữ liệu API",
      );
    }
    return Math.round(performance.now() - startTime);
  },

  /**
   * getMetrics: Lấy đầy đủ metrics + endpoints từ API.
   * Raw JSON → normalizeServerData() → dữ liệu phẳng, type-safe.
   */
  getMetrics: async (
    baseUrl: string,
    token?: string,
  ): Promise<{ metrics: Partial<ServerMetrics>; endpoints: Endpoint[] }> => {
    const response = await ApiService.GET(baseUrl, token);

    const contentType = response?.headers?.["content-type"];
    if (contentType && contentType.includes("text/html")) {
      throw new Error(
        "Invalid endpoint: Server trả về HTML thay vì dữ liệu API",
      );
    }

    const data: RawMetricsResponse = response.data;

    // Delegate toàn bộ logic parse sang normalizeServerData
    const { metrics, endpoints } = normalizeServerData(data);
    console.log("Metrics ", metrics);
    console.log("Endpoint ", endpoints);
    return { metrics, endpoints };
  },
};
