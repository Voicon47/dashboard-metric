import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Endpoint,
  ServerMetrics,
  ServerNode,
  ServerStatus,
  QueueMetrics,
} from "../types";
import { serverApi } from "../api/serverApi";
import { queueApi } from "../api/queueApi";
import { calculateServerStatus } from "../utils/statusUtils";
import { useUIStore } from "./useUIStore";

export interface ServerStoreState {
  servers: ServerNode[];
  addServer: (sever: ServerNode) => void;
  editServer: (sever: ServerNode) => void;
  deleteServer: (id: string) => void;
  updateServerStatus: (id: string, status: ServerStatus) => void;
  updateServerData: (
    id: string,
    metrics: Partial<ServerMetrics>,
    endpoints: Endpoint[],
  ) => void;
  updateServerQueues: (id: string, queues: QueueMetrics | null) => void;
  forceSync: () => Promise<void>;
}

export const useServerStore = create<ServerStoreState>()(
  persist(
    (set, get) => ({
      servers: [],

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

      updateServerData: (id, metrics, endpoints) =>
        set((state) => ({
          servers: state.servers.map((s) => {
            if (s.id !== id) return s;

            const cpu = metrics.cpuPercent ?? s.metrics.cpuPercent;
            const latency =
              metrics.latencyCurrentAvgMs ?? s.metrics.latencyCurrentAvgMs;
            const errorRate5xx = metrics.errorRate5xx ?? s.metrics.errorRate5xx;
            const thresholds = useUIStore.getState().settings.thresholds;
            
            const newStatus = calculateServerStatus(
              { cpuPercent: cpu, latencyCurrentAvgMs: latency, errorRate5xx },
              thresholds,
              s.status
            );

            return {
              ...s,
              status: newStatus,
              metrics: { ...s.metrics, ...metrics },
              endpoints: endpoints.length > 0 ? endpoints : s.endpoints,
              lastSyncAt: Date.now(),
            };
          }),
        })),
      
      updateServerQueues: (id, queues) =>
        set((state) => ({
          servers: state.servers.map((s) =>
            s.id === id ? { ...s, queues } : s
          ),
        })),

      forceSync: async () => {
        const { servers, updateServerData, updateServerStatus, updateServerQueues } = get();
        if (servers.length === 0) return;
        const CHUNK_SIZE = 5;
        for (let i = 0; i < servers.length; i += CHUNK_SIZE) {
          const chunk = servers.slice(i, i + CHUNK_SIZE);
          const promises = chunk.map(async (server) => {
            const [metricsResult, queuesResult] = await Promise.allSettled([
              serverApi.getMetrics(server.baseUrl, server.accessToken),
              queueApi.getQueues(server.baseUrl, server.accessToken),
            ]);

            if (metricsResult.status === "fulfilled") {
              updateServerData(
                server.id,
                metricsResult.value.metrics,
                metricsResult.value.endpoints
              );
            } else {
              updateServerStatus(server.id, "offline");
            }

            updateServerQueues(
              server.id,
              queuesResult.status === "fulfilled" ? queuesResult.value : null
            );
          });
          
          await Promise.allSettled(promises);
        }

        useUIStore.getState().setLastSyncAt(Date.now());
      },
    }),
    {
      name: "adsun-server-store",
    },
  ),
);
