import { useMemo } from "react";
import type { Endpoint } from "../types";

export function useEndpointTopMetrics(endpoints: Endpoint[]) {
  // 1. Top Latency
  const topLatency = useMemo(() => {
    return [...endpoints]
      .sort((a, b) => (b.latencyCurrentAvgMs ?? 0) - (a.latencyCurrentAvgMs ?? 0))
      .slice(0, 5);
  }, [endpoints]);

  // 2. Top RPS
  const topRps = useMemo(() => {
    return [...endpoints].sort((a, b) => b.rps - a.rps).slice(0, 5);
  }, [endpoints]);

  // 3. Top 4xx
  const top4xx = useMemo(() => {
    return [...endpoints]
      .sort((a, b) => (b.errorRate4xx ?? 0) - (a.errorRate4xx ?? 0))
      .slice(0, 5);
  }, [endpoints]);

  // 4. Top 5xx
  const top5xx = useMemo(() => {
    return [...endpoints]
      .sort((a, b) => (b.errorRate5xx ?? 0) - (a.errorRate5xx ?? 0))
      .slice(0, 5);
  }, [endpoints]);

  // 5. Fast Path (Lowest latency)
  const topFast = useMemo(() => {
    return [...endpoints]
      .sort((a, b) => (a.latencyCurrentAvgMs ?? 0) - (b.latencyCurrentAvgMs ?? 0))
      .slice(0, 5);
  }, [endpoints]);

  return {
    topLatency,
    topRps,
    top4xx,
    top5xx,
    topFast,
  };
}
