// ============================================================
// ADSUN Dashboard — sortFieldRegistry.ts
// Tự động phát hiện field số có thể sort từ một endpoint đã normalize
// Không quét raw JSON — chỉ quét dữ liệu sau normalizeServerData()
// ============================================================

import type { Endpoint } from "../types";

// ─── 1. Denylist: field kiểu number nhưng KHÔNG có ý nghĩa để sort ──
const SORT_FIELD_DENYLIST = new Set<keyof Endpoint>([
  // Không có field nào thuộc Endpoint interface cần deny hiện tại,
  // nhưng sẵn sàng mở rộng nếu thêm field dạng timestamp/flag
]);

// ─── 2. Fields mà "thấp = xấu" → sort tăng dần để đẩy xấu nhất lên đầu ──
// Các field còn lại mặc định sort giảm dần (cao = đáng chú ý nhất)
const ASCENDING_BY_DEFAULT = new Set<keyof Endpoint>([
  "successRate",
]);

// ─── 3. Label override: tên viết tắt/thuật ngữ cần giữ nguyên format ──
const LABEL_OVERRIDES: Partial<Record<keyof Endpoint, string>> = {
  latencyCurrentAvgMs:    "Latency avg (ms)",
  maxLatencyMs: "Latency max (ms)",
  rps:          "RPS",
  errorRate5xx:    "Error Rate (%)",
  successRate:  "Success Rate (%)",
};

// ─── Kiểu trả về ──────────────────────────────────────────────────────
export interface SortFieldDef {
  field: keyof Endpoint;
  label: string;
  defaultDir: "asc" | "desc";
}

/**
 * Chuyển camelCase → "Tiêu Đề Chuỗi"
 * Ví dụ: "maxLatencyMs" → "Max Latency Ms"
 */
function camelToLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/**
 * Quét 1 endpoint đã normalize để tự động sinh danh sách field có thể sort.
 *
 * Quy tắc:
 *  - Chỉ giữ field có typeof === 'number'
 *  - Loại bỏ field trong SORT_FIELD_DENYLIST
 *  - Label ưu tiên LABEL_OVERRIDES, fallback camelToLabel()
 *  - Direction ưu tiên ASCENDING_BY_DEFAULT, fallback 'desc'
 *
 * @param sample - Một endpoint object đã qua normalizeServerData()
 * @returns Danh sách SortFieldDef[] sẵn sàng đổ vào dropdown
 */
export function detectSortableFields(sample: Endpoint | null): SortFieldDef[] {
  if (!sample) return [];

  return (Object.keys(sample) as (keyof Endpoint)[])
    .filter((key) => {
      // Chỉ giữ field kiểu number
      if (typeof sample[key] !== "number") return false;
      // Loại bỏ field trong denylist
      if (SORT_FIELD_DENYLIST.has(key)) return false;
      return true;
    })
    .map((key) => ({
      field: key,
      label: LABEL_OVERRIDES[key] ?? camelToLabel(key as string),
      defaultDir: ASCENDING_BY_DEFAULT.has(key) ? "asc" : "desc",
    }));
}


