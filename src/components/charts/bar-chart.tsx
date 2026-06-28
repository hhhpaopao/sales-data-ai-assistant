"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProductItem } from "@/lib/types";

type BarChartProps = {
  data: ProductItem[];
};

export function ProductBarChart({ data }: BarChartProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-950">商品销售排行</p>
        <p className="mt-1 text-sm text-slate-500">按销售额排序，快速判断承接产品。</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} layout="vertical" margin={{ left: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis
              type="category"
              dataKey="name"
              width={92}
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <Tooltip />
            <Bar dataKey="revenue" name="销售额" fill="#0f766e" radius={[0, 6, 6, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
