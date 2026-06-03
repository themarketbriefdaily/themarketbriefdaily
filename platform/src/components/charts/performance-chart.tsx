"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface PerfPoint {
  label: string;
  strategy: number;
  benchmark: number;
}

export function PerformanceChart({
  data,
  benchmarkLabel = "Benchmark",
}: {
  data: PerfPoint[];
  benchmarkLabel?: string;
}) {
  const all = data.flatMap((d) => [d.strategy, d.benchmark]);
  const min = Math.floor(Math.min(...all) / 5) * 5;
  const max = Math.ceil(Math.max(...all) / 5) * 5;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="perfStrategy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8a35a" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#c8a35a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d8" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#5a5a5a" }}
            axisLine={{ stroke: "#e3e0d8" }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            domain={[min, max]}
            tick={{ fontSize: 11, fill: "#5a5a5a" }}
            tickFormatter={(v) => `£${v}`}
            axisLine={false}
            tickLine={false}
            width={46}
          />
          <Tooltip
            formatter={(value) => `£${Number(value).toFixed(1)}`}
            contentStyle={{ borderRadius: 12, border: "1px solid #e3e0d8", fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="plainline" />
          <Area
            type="monotone"
            dataKey="benchmark"
            name={benchmarkLabel}
            stroke="#8a8a85"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            fill="none"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="strategy"
            name="MBD-QUANT"
            stroke="#0a0a0a"
            strokeWidth={2.5}
            fill="url(#perfStrategy)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
