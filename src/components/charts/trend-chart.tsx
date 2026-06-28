"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/types";

type TrendChartProps = {
  data: TrendPoint[];
};

export function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">近 7 天经营变化</p>
          <p className="mt-1 text-sm text-slate-500">
            内容浏览、销售额与线索数同步观察。
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-md bg-teal-50 px-2 py-1 text-teal-700">内容浏览</span>
          <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">销售额</span>
          <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-700">线索数</span>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Line
              name="内容浏览"
              type="monotone"
              dataKey="views"
              stroke="#0f766e"
              strokeWidth={2.4}
              dot={false}
            />
            <Line
              name="销售额"
              type="monotone"
              dataKey="sales"
              stroke="#2563eb"
              strokeWidth={2.4}
              dot={false}
            />
            <Line
              name="线索数"
              type="monotone"
              dataKey="leads"
              stroke="#d97706"
              strokeWidth={2.4}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
