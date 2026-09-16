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
import { useDashboardStore } from "./store/useDashboardStore";
import { serverApi } from "./api/serverApi";
// ─── Inner App (has access to DashboardContext) ──────────────
function DashboardApp() {
  const servers = useDashboardStore((state) => state.servers);
  const pollingInterval = useDashboardStore((state) => state.pollingInterval);
  const forceSync = useDashboardStore((state) => state.forceSync);
  const theme = useDashboardStore((state) => state.settings?.theme || "light");

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

        {/* Section 1: Cấu hình & Kết nối Server Telemetry (6/6 Nodes) */}
        <ServerConfigTable />

        {/* Section 2: Bảng So Sánh Tổng Quan (System Telemetry Matrix) */}
        <TelemetryMatrix />

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
  return <DashboardApp />;
}
