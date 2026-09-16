// ============================================================
// ADSUN Dashboard — ServerDetailModal.tsx
// Full metrics for selected node: Gauges, Endpoints, Ping
// ============================================================

import React, { useState } from "react";
import {
  Server,
  Wifi,
  Clock,
  Network,
  HardDrive,
  TrendingDown,
  Activity,
  RefreshCw,
  MapPin,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { MetricGauge } from "../primitives/MetricGauge";
import { StatusDot } from "../primitives/StatusDot";
import { useToast } from "../../hooks/useToast";
import {
  formatPercent,
  formatMs,
  formatRps,
  formatUptime,
  formatBandwidth,
  formatDateTime,
} from "../../utils/formatters";
import { getMetricTextClass } from "../../utils/statusColor";
import { LATENCY_THRESHOLD } from "../../constants";
import type { Endpoint, ServerNode } from "../../types";
import { cn } from "../../lib/utils";

function EndpointRow({ endpoint }: { endpoint: Endpoint }) {
  const methodVariant: Record<
    string,
    "get" | "post" | "put" | "patch" | "delete"
  > = {
    GET: "get",
    POST: "post",
    PUT: "put",
    PATCH: "patch",
    DELETE: "delete",
  };

  return (
    <TableRow>
      <TableCell>
        <Badge
          variant={methodVariant[endpoint.method] ?? "default"}
          className="text-[10px] font-mono"
        >
          {endpoint.method}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-xs text-foreground">
        {endpoint.path}
      </TableCell>
      <TableCell
        className={cn(
          "text-xs font-mono font-bold",
          getMetricTextClass(
            endpoint.latencyCurrentAvgMs,
            LATENCY_THRESHOLD.warning,
            LATENCY_THRESHOLD.critical,
          ),
        )}
      >
        {formatMs(endpoint.latencyCurrentAvgMs)}
      </TableCell>
      <TableCell className="text-xs font-mono">
        {formatRps(endpoint.rps)}/s
      </TableCell>
      <TableCell>
        <StatusDot status={endpoint.status} size="sm" showLabel />
      </TableCell>
      <TableCell
        className={cn(
          "text-xs font-mono",
          getMetricTextClass(endpoint.errorRate5xx, 2, 5),
        )}
      >
        {endpoint.errorRate5xx.toFixed(2)}%
      </TableCell>
    </TableRow>
  );
}

export function ServerDetailModal() {
  const dispatch = (action: any) => {};
  const modals = { detail: false };
  const server = null as ServerNode | null;
  const toast = useToast();
  const [pinging, setPinging] = useState(false);

  const onClose = () => dispatch({ type: "CLOSE_MODAL", payload: "detail" });

  const handlePing = async () => {
    if (!server) return;
    setPinging(true);
    await new Promise((r) => setTimeout(r, 600));
    const simLatency = Math.round(
      server.metrics.latencyCurrentAvgMs * (0.9 + Math.random() * 0.25),
    );
    toast.ping(server.name, simLatency);
    setPinging(false);
  };

  if (!server) return null;

  const m = server.metrics;

  return (
    <Dialog open={modals.detail} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/30">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="font-mono text-xl">
                  {server.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {/* {server.region} */}
                  <span>·</span>
                  <Globe className="h-3 w-3" />
                  {/* {server.ip}:{server.port} */}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusDot status={server.status} showLabel />
              {/* <Badge
                variant={server.role as "primary" | "replica" | "edge" | "cdn"}
              >
                {server.role}
              </Badge> */}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-2 space-y-6">
          {/* ─── Gauges Row ─────────────────────────────────────── */}
          <div className="flex justify-around py-4 rounded-xl bg-muted/20 border border-border">
            <MetricGauge value={m.cpuPercent} label="CPU" size={110} />
          </div>

          {/* ─── Metrics Grid ────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: <Wifi className="h-4 w-4" />,
                label: "Avg Latency",
                value: formatMs(m.latencyCurrentAvgMs),
                className: getMetricTextClass(
                  m.latencyCurrentAvgMs,
                  LATENCY_THRESHOLD.warning,
                  LATENCY_THRESHOLD.critical,
                ),
              },
              {
                icon: <Wifi className="h-4 w-4" />,
                label: "Min Latency",
                value: formatMs(m.minLatencyMs),
                className: "text-emerald-500",
              },
              {
                icon: <Network className="h-4 w-4" />,
                label: "RPS",
                value: formatRps(m.rps),
                className: "text-foreground",
              },
              {
                icon: <Network className="h-4 w-4" />,
                label: "Total Reqs",
                value: m.totalRequests >= 1000 ? `${(m.totalRequests / 1000).toFixed(1)}k` : `${m.totalRequests}`,
                className: "text-muted-foreground",
              },
              {
                icon: <TrendingDown className="h-4 w-4" />,
                label: "Error Rate 5xx",
                value: `${m.errorRate5xx.toFixed(2)}%`,
                className: getMetricTextClass(m.errorRate5xx, 2, 5),
              },
              {
                icon: <Activity className="h-4 w-4" />,
                label: "Bandwidth",
                value: m.bandwidthMbps !== undefined ? formatBandwidth(m.bandwidthMbps) : "N/A",
                className: "text-foreground",
              },
              {
                icon: <Clock className="h-4 w-4" />,
                label: "Uptime",
                value: m.uptimeSeconds !== undefined ? formatUptime(m.uptimeSeconds) : "N/A",
                className: m.uptimeSeconds !== undefined ? "text-green-400" : "text-muted-foreground",
              },
              {
                icon: <HardDrive className="h-4 w-4" />,
                label: "Disk",
                value: m.diskPercent !== undefined ? formatPercent(m.diskPercent) : "N/A",
                className: m.diskPercent !== undefined ? getMetricTextClass(m.diskPercent, 75, 90) : "text-muted-foreground",
              },
              {
                icon: <Activity className="h-4 w-4" />,
                label: "RAM",
                value: m.ramGB !== undefined ? `${m.ramGB.toFixed(1)} GB` : "N/A",
                className: "text-foreground",
              },
              {
                icon: <Activity className="h-4 w-4" />,
                label: "Heap Mem",
                value: m.managedHeapMb !== undefined ? `${m.managedHeapMb.toFixed(1)} MB` : "N/A",
                className: "text-muted-foreground",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-lg bg-muted/20 border border-border/50"
              >
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                  {stat.icon}
                  <span className="text-[10px] uppercase tracking-wider font-semibold">
                    {stat.label}
                  </span>
                </div>
                <p
                  className={cn("font-mono font-bold text-lg", stat.className)}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* ─── Endpoints Table ─────────────────────────────────── */}
          {server.endpoints.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Endpoints ({server.endpoints.length})
              </h3>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/20">
                      <TableHead className="py-2 text-[10px]">Method</TableHead>
                      <TableHead className="py-2 text-[10px]">Path</TableHead>
                      <TableHead className="py-2 text-[10px]">
                        Latency
                      </TableHead>
                      <TableHead className="py-2 text-[10px]">RPS</TableHead>
                      <TableHead className="py-2 text-[10px]">Status</TableHead>
                      <TableHead className="py-2 text-[10px]">Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {server.endpoints.map((ep) => (
                      <EndpointRow key={ep.id} endpoint={ep} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ─── Last Sync ───────────────────────────────────────── */}
          <p className="text-xs text-muted-foreground text-right">
            Last sync: {formatDateTime(server.lastSyncAt)}
          </p>
        </div>

        {/* ─── Footer Actions ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePing}
            disabled={pinging}
            id="detail-ping-btn"
            className="gap-2"
          >
            {pinging ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wifi className="h-3.5 w-3.5" />
            )}
            {pinging ? "Pinging..." : `Ping ${server.name}`}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



