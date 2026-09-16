// ============================================================
// ADSUN Dashboard — Header.tsx
// Top navigation bar with balanced layout & theme toggle
// ============================================================

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  ChevronDown,
  Columns3,
  User,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { POLLING_INTERVALS } from "../../constants";
import { useDashboardStore } from "../../store/useDashboardStore";

const BTN_BASE =
  "flex items-center gap-1.5 bg-slate-100 dark:bg-[#141b2d] hover:bg-slate-200 dark:hover:bg-[#1a233a] border border-slate-300 dark:border-[#23314e] text-xs text-slate-700 dark:text-slate-200 rounded transition-colors font-medium cursor-pointer";
const ICON_BTN = `${BTN_BASE} p-1.5 shadow-2xs`;

export function Header() {
  // Lấy dữ liệu từ store
  const servers = useDashboardStore((state) => state.servers);
  const lastSyncAt = useDashboardStore((state) => state.lastSyncAt);
  const pollingInterval = useDashboardStore((state) => state.pollingInterval);
  const setPollingInterval = useDashboardStore(
    (state) => state.setPollingInterval,
  );
  // const setLastSyncAt = useDashboardStore((state) => state.setLastSyncAt);
  const settings = useDashboardStore((state) => state.settings);
  const updateSettings = useDashboardStore((state) => state.updateSettings);
  const theme = settings?.theme || "light";
  const [secondsAgo, setSecondsAgo] = useState(0);
  const forceSync = useDashboardStore((state) => state.forceSync);
  const openModal = useDashboardStore((state) => state.openModal);

  // Gắn trực tiếp vào nút bấm
  const handleRefresh = () => {
    forceSync();
  };

  // Update relative time since last sync
  useEffect(() => {
    // Tính toán ngay lúc bắt đầu effect
    setSecondsAgo(Math.max(0, Math.floor((Date.now() - lastSyncAt) / 1000)));

    const timer = setInterval(() => {
      setSecondsAgo(Math.max(0, Math.floor((Date.now() - lastSyncAt) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastSyncAt]);

  const totalServers = servers.length;
  const activeServers = servers.filter(
    (s: any) => s.status !== "offline",
  ).length;

  const toggleTheme = () => {
    updateSettings({
      ...settings,
      theme: theme === "dark" ? "light" : "dark",
    });
  };

  return (
    <header className="sticky top-0 z-40 h-12 px-3 sm:px-6 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1b253b] bg-white dark:bg-[#0b0f19] shadow-xs transition-colors">
      {/* ─── 1. Left: Brand & Live Status ─────────────────────── */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#49cc90] text-white dark:bg-[#2563eb] font-extrabold text-[11px] px-2 py-0.5 rounded tracking-wider select-none shadow-xs">
            ADSUN
          </span>
          <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight whitespace-nowrap">
            Metrics Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-1.5 bg-[#eef8f3] dark:bg-[#131d2e] border border-[#a3e5c9] dark:border-[#1e2f47] text-[#10663e] dark:text-slate-300 rounded-full px-2.5 py-0.5 text-xs shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#49cc90] dark:bg-emerald-400 shadow-[0_0_6px_rgba(73,204,144,0.8)] animate-pulse flex-shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap text-[11.5px]">
            {activeServers}/{totalServers} servers active
          </span>
          <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">
            •
          </span>
          <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px] hidden sm:inline whitespace-nowrap">
            updated {secondsAgo}s ago
          </span>
        </div>
      </div>

      {/* ─── 2. Right: Controls ────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Polling Interval Dropdown */}
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`${BTN_BASE} px-2.5 py-1`}
                id="header-interval-trigger"
              >
                <span>{pollingInterval}s</span>
                <ChevronDown className="h-3 w-3 text-slate-500 dark:text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-[#1e293b] text-slate-800 dark:text-slate-200"
            >
              <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Sync Interval
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-[#1e293b]" />
              {POLLING_INTERVALS.map((sec) => (
                <DropdownMenuItem
                  key={sec}
                  onClick={() => setPollingInterval(sec)}
                  className="text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex justify-between"
                >
                  <span>{sec}s</span>
                  {pollingInterval === sec && (
                    <span className="text-[#49cc90] dark:text-blue-400 font-semibold">
                      [Active]
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Refresh Now */}
        <button
          onClick={handleRefresh}
          className={`${BTN_BASE} px-2.5 py-1`}
          title="Refresh telemetry immediately"
          id="header-refresh-btn"
        >
          <RefreshCw className="h-3 w-3 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">Refresh now</span>
        </button>

        {/* Settings Toggle */}
        <button
          onClick={() => openModal("settings")}
          className={ICON_BTN}
          title="Tùy chỉnh Cảnh báo (Threshold)"
        >
          <Settings className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

        {/* Theme Toggle (Sun / Moon) */}
        <button
          onClick={toggleTheme}
          className={ICON_BTN}
          title={
            theme === "dark"
              ? "Chuyển sang giao diện Sáng (Swagger UI)"
              : "Chuyển sang giao diện Tối"
          }
          id="theme-toggle-btn"
        >
          {theme === "dark" ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
}
