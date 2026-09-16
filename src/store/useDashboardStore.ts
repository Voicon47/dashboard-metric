import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DashboardState,
  Endpoint,
  ServerMetrics,
  ServerNode,
  ServerStatus,
  DashboardSettings,
} from "../types";
import { serverApi } from "../api/serverApi";

interface DashBoardStore extends DashboardState {
  addServer: (sever: ServerNode) => void;
  editServer: (sever: ServerNode) => void;
  deleteServer: (id: string) => void;
  updateServerStatus: (id: string, status: ServerStatus) => void;
  updateServerData: (
    id: string,
    metrics: Partial<ServerMetrics>,
    endpoints: Endpoint[],
  ) => void;
  forceSync: () => Promise<void>;
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  setEditingNode: (id: string | null) => void;
  setSelectionNode: (id: string | null) => void;
  setPollingInterval: (interval: number) => void;
  setLastSyncAt: (timestamp: number) => void;
  updateSettings: (settings: DashboardSettings) => void;
}

export const useDashboardStore = create<DashBoardStore>()(
  persist(
    (set, get) => ({
      servers: [],
      modals: {
        addEdit: false,
        detail: false,
        prometheus: false,
        settings: false,
      },
      editingNodeId: null,
      selectedNodeId: null,
      pollingInterval: 15,
      lastSyncAt: Date.now(),
      settings: {
        theme: "light",
        thresholds: {
          cpuWarning: 60,
          cpuDegraded: 85,
          latencyWarning: 300,
          latencyDegraded: 1000,
          error5xxWarning: 1,
          error5xxDegraded: 5,
        },
      },

      addServer: (server) =>
        set((state) => ({
          servers: [...state.servers, server],
        })),

      editServer: (server) =>
        set((state) => ({
          servers: state.servers.map((s) => (s.id === server.id ? server : s)),
        })),

      deleteServer: (id) =>
        set((state) => ({
          servers: state.servers.filter((s) => s.id !== id),
        })),

      // Cập nhật trạng thái server
      updateServerStatus: (id, status) =>
        set((state) => ({
          servers: state.servers.map((s) => {
            if (s.id !== id) return s;
            return {
              ...s,
              status,
            };
          }),
        })),

      // Cập nhật đầy đủ metrics + endpoints từ getMetrics()
      updateServerData: (id, metrics, endpoints) =>
        set((state) => ({
          servers: state.servers.map((s) => {
            if (s.id !== id) return s;

            // Tính trạng thái tự động dựa trên dữ liệu thật
            const cpu = metrics.cpuPercent ?? s.metrics.cpuPercent;
            const latency =
              metrics.latencyCurrentAvgMs ?? s.metrics.latencyCurrentAvgMs;
            const errorRate5xx = metrics.errorRate5xx ?? s.metrics.errorRate5xx;
            const thresholds = get().settings.thresholds;
            const newStatus: ServerStatus =
              cpu >= thresholds.cpuDegraded ||
              latency >= thresholds.latencyDegraded ||
              errorRate5xx >= thresholds.error5xxDegraded
                ? "degraded"
                : "online";

            return {
              ...s,
              status: newStatus,
              metrics: { ...s.metrics, ...metrics },
              // Chỉ ghi đè endpoints nếu API trả về có dữ liệu
              endpoints: endpoints.length > 0 ? endpoints : s.endpoints,
              lastSyncAt: Date.now(),
            };
          }),
        })),

      // Gọi getMetrics thật thay vì chỉ ping
      forceSync: async () => {
        const { servers, updateServerData, updateServerStatus, setLastSyncAt } =
          get();
        if (servers.length === 0) return;

        const promises = servers.map(async (server) => {
          try {
            const { metrics, endpoints } = await serverApi.getMetrics(
              server.baseUrl,
              server.accessToken,
            );
            updateServerData(server.id, metrics, endpoints);
          } catch (error) {
            // Nếu lỗi (offline / không parse được) → đánh dấu offline
            updateServerStatus(server.id, "offline");
          }
        });

        await Promise.allSettled(promises);
        setLastSyncAt(Date.now());
      },

      setPollingInterval: (interval) =>
        set({
          pollingInterval: interval,
        }),

      setLastSyncAt: (timestamp) =>
        set({
          lastSyncAt: timestamp,
        }),

      openModal: (modalName) =>
        set((state) => ({
          modals: { ...state.modals, [modalName]: true },
        })),

      closeModal: (modalName) =>
        set((state) => ({ modals: { ...state.modals, [modalName]: false } })),

      setEditingNode: (id) => set({ editingNodeId: id }),
      setSelectionNode: (id) => set({ selectedNodeId: id }),
      updateSettings: (settings) => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(settings.theme);
        set({ settings });
      },
    }),
    {
      name: "adsun-dashboard",
    },
  ),
);
