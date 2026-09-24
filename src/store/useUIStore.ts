import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DashboardSettings,
  ModalState,
  TelemetryMatrixFilter,
  ServerColumnsFilter,
} from "../types";

export const defaultMatrixFilter: TelemetryMatrixFilter = {
  serverIds: [],
  hiddenMetricKeys: [],
};

export const defaultColumnsFilter: ServerColumnsFilter = {
  serverIds: [],
  serverStatus: [],
  endpointMethod: [],
};

export interface UIStoreState {
  modals: ModalState;
  editingNodeId: string | null;
  selectedNodeId: string | null;
  pollingInterval: number;
  lastSyncAt: number;
  settings: DashboardSettings;
  matrixFilter: TelemetryMatrixFilter;
  columnsFilter: ServerColumnsFilter;
  visibleChartMetrics: string[];

  openModal: (modalName: keyof ModalState) => void;
  closeModal: (modalName: keyof ModalState) => void;
  setEditingNode: (id: string | null) => void;
  setSelectionNode: (id: string | null) => void;
  setPollingInterval: (interval: number) => void;
  setLastSyncAt: (timestamp: number) => void;
  updateSettings: (settings: DashboardSettings) => void;
  setMatrixFilter: (
    filter:
      | Partial<TelemetryMatrixFilter>
      | ((prev: TelemetryMatrixFilter) => TelemetryMatrixFilter)
  ) => void;
  setColumnsFilter: (
    filter:
      | Partial<ServerColumnsFilter>
      | ((prev: ServerColumnsFilter) => ServerColumnsFilter)
  ) => void;
  setVisibleChartMetrics: (metrics: string[] | ((prev: string[]) => string[])) => void;
  resetMatrixFilter: () => void;
  resetColumnsFilter: () => void;
}

export const useUIStore = create<UIStoreState>()(
  persist(
    (set) => ({
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
          queueWarning: 50,
          queueDegraded: 300,
        },
      },
      matrixFilter: defaultMatrixFilter,
      columnsFilter: defaultColumnsFilter,
      visibleChartMetrics: ["cpu", "rps", "ram", "latency"],

      openModal: (modalName) =>
        set((state) => ({
          modals: { ...state.modals, [modalName]: true },
        })),

      closeModal: (modalName) =>
        set((state) => ({ modals: { ...state.modals, [modalName]: false } })),

      setEditingNode: (id) => set({ editingNodeId: id }),
      setSelectionNode: (id) => set({ selectedNodeId: id }),
      setPollingInterval: (interval) => set({ pollingInterval: interval }),
      setLastSyncAt: (timestamp) => set({ lastSyncAt: timestamp }),
      updateSettings: (settings) => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(settings.theme);
        set({ settings });
      },

      setMatrixFilter: (filter) =>
        set((state) => ({
          matrixFilter:
            typeof filter === "function"
              ? filter(state.matrixFilter)
              : { ...state.matrixFilter, ...filter },
        })),

      setColumnsFilter: (filter) =>
        set((state) => ({
          columnsFilter:
            typeof filter === "function"
              ? filter(state.columnsFilter)
              : { ...state.columnsFilter, ...filter },
        })),

      setVisibleChartMetrics: (metrics) =>
        set((state) => ({
          visibleChartMetrics:
            typeof metrics === "function"
              ? metrics(state.visibleChartMetrics)
              : metrics,
        })),

      resetMatrixFilter: () => set({ matrixFilter: defaultMatrixFilter }),
      resetColumnsFilter: () => set({ columnsFilter: defaultColumnsFilter }),
    }),
    {
      name: "adsun-ui-store",
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        settings: {
          ...currentState.settings,
          ...persistedState?.settings,
          thresholds: {
            ...currentState.settings.thresholds,
            ...persistedState?.settings?.thresholds,
          },
        },
      }),
      partialize: (state) => ({
        // Chỉ lưu những config người dùng cài đặt, KHÔNG lưu trạng thái modal/editing đang mở
        settings: state.settings,
        matrixFilter: state.matrixFilter,
        columnsFilter: state.columnsFilter,
        visibleChartMetrics: state.visibleChartMetrics,
        pollingInterval: state.pollingInterval,
      }),
    },
  ),
);
