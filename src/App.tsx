// ============================================================
// ADSUN Media Metrics Dashboard — App.tsx
// Root application layout matching reference image
// ============================================================

import React, { useEffect, useRef, useState } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ServerConfigTable } from "./components/table/ServerConfigTable";
import { TelemetryMatrix } from "./components/dashboard/TelemetryMatrix";
import { ServerColumnsMatrix } from "./components/dashboard/ServerColumnsMatrix";
import { ServerDetailModal } from "./components/modals/ServerDetailModal";
import { AddEditServerModal } from "./components/modals/AddEditServerModal";
import { GlobalSettingsModal } from "./components/modals/GlobalSettingsModal";
// import { PrometheusExporterModal } from "./components/modals/PrometheusExporterModal";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./components/ui/resizable";
import { useUIStore } from "./store/useUIStore";
import { useServerStore } from "./store/useServerStore";
import { serverApi } from "./api/serverApi";
// ─── Inner App (has access to DashboardContext) ──────────────
function DashboardApp() {
  const pollingInterval = useUIStore((state) => state.pollingInterval);
  const theme = useUIStore((state) => state.settings?.theme || "light");
  const forceSync = useServerStore((state) => state.forceSync);

  useEffect(() => {
    if (!pollingInterval || pollingInterval <= 0) return;
    forceSync();
    const intervalId = setInterval(forceSync, pollingInterval * 1000);
    return () => clearInterval(intervalId);
  }, [pollingInterval, forceSync]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-[#3b4151] dark:bg-[#0b0e17] dark:text-slate-100 font-sans antialiased selection:bg-emerald-600 selection:text-white transition-colors duration-200">
      {/* ─── Bar 1: Sticky Top Header ───────────────────────── */}
      <Header />

      {/* ─── Main Content ───────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1780px] mx-auto px-3 sm:px-5 py-3">
        {/* Section 1 & 2: Resizable Horizontal Split (ServerConfigTable + TelemetryMatrix) */}
        <div className="mb-4">
          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId="adsun-table-matrix-split"
            className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/30 dark:bg-[#0c101d]/30 shadow-xs min-h-[460px] items-stretch"
          >
            {/* Left Panel: ServerConfigTable */}
            <ResizablePanel defaultSize={35} minSize={20} maxSize={55} className="min-w-0">
              <div className="h-full p-2">
                <ServerConfigTable />
              </div>
            </ResizablePanel>

            {/* Vertical Drag Handle */}
            <ResizableHandle withHandle />

            {/* Right Panel: TelemetryMatrix */}
            <ResizablePanel defaultSize={65} minSize={45} className="min-w-0">
              <div className="h-full p-2">
                <TelemetryMatrix />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Section 3: Khu Vực Endpoint Theo Từng Server [CORE PIPELINE] */}
        <ServerColumnsMatrix />
      </main>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <Footer />

      {/* ─── Modals ─────────────────────────────────────────── */}
      <ServerDetailModal />
      <AddEditServerModal />
      <GlobalSettingsModal />
      {/* <PrometheusExporterModal /> */}

      {/* ─── Toast System ───────────────────────────────────── */}
      <Toaster />
    </div>
  );
}

// ─── Root App with Providers ─────────────────────────────────
export default function App() {
  return (
    <TooltipProvider delayDuration={150}>
      <DashboardApp />
    </TooltipProvider>
  );
}
