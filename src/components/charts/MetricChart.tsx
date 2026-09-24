import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useServerStore } from "../../store/useServerStore";
import type { ServerNode } from "../../types";
import { MetricKey, METRIC_CONFIG, SERIES_COLORS } from "../../constants/chartConfig";

// ─── Cấu hình Highcharts dùng múi giờ local (thay vì UTC mặc định)
Highcharts.setOptions({
  time: {
    useUTC: false,
  } as any,
});

interface MetricChartProps {
  metricKey: MetricKey;
  servers: ServerNode[];
  isDark: boolean;
  textColor: string;
  gridLineColor: string;
  bgColor: string;
}

export const MetricChart: React.FC<MetricChartProps> = React.memo(
  ({
    metricKey,
    servers,
    isDark,
    textColor,
    gridLineColor,
    bgColor,
  }) => {
    // Tách việc lấy history vào bên trong để tránh render lại toàn bộ component cha
    const histories = useServerStore((state) => state.serverHistories);
    const metricConf = METRIC_CONFIG[metricKey];

    const options: Highcharts.Options = useMemo(() => {
      const series: Highcharts.SeriesSplineOptions[] = servers.map(
        (server, idx) => {
          const history = histories[server.id] ?? [];
          return {
            type: "spline",
            name: server.name,
            color: SERIES_COLORS[idx % SERIES_COLORS.length],
            lineWidth: 2,
            data: history.map((pt) => [pt.timestamp, pt[metricKey]]),
            marker: {
              enabled: false,
              states: { hover: { enabled: true, radius: 4 } },
            },
          };
        },
      );

      return {
        chart: {
          type: "spline",
          backgroundColor: bgColor,
          style: { fontFamily: "inherit" },
          animation: { duration: 300 },
          height: 280,
        },
        title: {
          text: `So sánh ${metricConf.label}`,
          style: { color: textColor, fontWeight: "600", fontSize: "14px" },
        },
        credits: { enabled: false },
        xAxis: {
          type: "datetime",
          labels: { style: { color: textColor }, format: "{value:%H:%M:%S}" },
          lineColor: gridLineColor,
          tickColor: gridLineColor,
        },
        yAxis: {
          title: {
            text: `${metricConf.label} (${metricConf.unit})`,
            style: { color: textColor },
          },
          labels: {
            style: { color: textColor },
            format: `{value} ${metricConf.unit}`,
          },
          gridLineColor,
          min: 0,
          ...(metricConf.yMax ? { max: metricConf.yMax } : {}),
        },
        tooltip: {
          shared: true,
          xDateFormat: "%H:%M:%S",
          valueSuffix: ` ${metricConf.unit}`,
          backgroundColor: isDark
            ? "rgba(15,23,42,0.92)"
            : "rgba(255,255,255,0.95)",
          borderColor: gridLineColor,
          style: { color: textColor },
        },
        legend: {
          itemStyle: { color: textColor, fontWeight: "normal" },
          itemHoverStyle: { color: isDark ? "#fff" : "#000" },
        },
        plotOptions: {
          spline: { connectNulls: false },
        },
        series,
      };
    }, [
      servers,
      histories,
      metricKey,
      isDark,
      bgColor,
      textColor,
      gridLineColor,
      metricConf,
    ]);

    return <HighchartsReact highcharts={Highcharts} options={options} />;
  },
);
