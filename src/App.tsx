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
        {/* Bar 2: Critical Alert Banner */}
        {/* <AlertBanner /> */}

        {/* Section 1 & 2: Danh Sách Máy Chủ + Bảng So Sánh Tổng Quan (Cùng 1 hàng) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4 items-stretch">
          {/* Section 1: Cấu hình & Kết nối Server Telemetry */}
          <div className="xl:col-span-5 2xl:col-span-4 min-w-0">
            <ServerConfigTable />
          </div>

          {/* Section 2: Bảng So Sánh Tổng Quan (System Telemetry Matrix) */}
          <div className="xl:col-span-7 2xl:col-span-8 min-w-0">
            <TelemetryMatrix />
          </div>
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
