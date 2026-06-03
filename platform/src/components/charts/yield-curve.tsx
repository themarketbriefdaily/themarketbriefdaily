"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface CurvePoint {
  tenor: string;
  yield: number;
}

export function YieldCurveChart({ data }: { data: CurvePoint[] }) {
  const min = Math.min(...data.map((d) => d.yield));
  const max = Math.max(...data.map((d) => d.yield));
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8a35a" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#c8a35a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e0d8" vertical={false} />
          <XAxis
            dataKey="tenor"
            tick={{ fontSize: 12, fill: "#5a5a5a" }}
            axisLine={{ stroke: "#e3e0d8" }}
            tickLine={false}
          />
          <YAxis
            domain={[Math.floor(min * 10) / 10 - 0.1, Math.ceil(max * 10) / 10 + 0.1]}
            tick={{ fontSize: 12, fill: "#5a5a5a" }}
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(2)}%`, "Yield"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e3e0d8",
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="yield"
            stroke="#0a0a0a"
            strokeWidth={2}
            fill="url(#curveFill)"
            dot={{ r: 3, fill: "#0a0a0a" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
