"use client";

import { useEffect, useState } from "react";
import type { ImportedMetricSnapshot } from "@/lib/import-parser";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  importedMetricsUpdatedEvent,
  projectImportedMetricsStorageKey,
} from "@/lib/import-storage";

const dataTypeLabels = {
  content: "内容数据",
  sales: "销售数据",
  leads: "线索数据",
} as const;

function readImportedMetrics(projectId: string) {
  const storageKey = projectImportedMetricsStorageKey(projectId);
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as ImportedMetricSnapshot[];
  } catch {
    window.localStorage.removeItem(storageKey);
    return [];
  }
}

export function ImportedMetricsPanel({ projectId }: { projectId: string }) {
  const [snapshots, setSnapshots] = useState<ImportedMetricSnapshot[]>([]);

  useEffect(() => {
    const load = () => setSnapshots(readImportedMetrics(projectId));
    const timer = window.setTimeout(load, 0);

    window.addEventListener(importedMetricsUpdatedEvent, load);
    window.addEventListener("storage", load);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(importedMetricsUpdatedEvent, load);
      window.removeEventListener("storage", load);
    };
  }, [projectId]);

  if (!snapshots.length) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center">
        <p className="text-base font-semibold text-slate-950">暂无导入数据</p>
        <p className="mt-1 text-sm text-slate-500">
          上传 CSV 或 Excel 后，这里会展示当前店铺最近一次解析出的基础指标。
        </p>
      </section>
    );
  }

  const latest = snapshots[0];

  return (
    <section className="rounded-lg border border-teal-100 bg-teal-50/40 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            最近导入数据
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {latest.fileName}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {dataTypeLabels[latest.dataType]} · {latest.rowCount} 行 ·{" "}
            {latest.importedAt}
          </p>
        </div>
        <span className="w-fit rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
          已解析
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {latest.summary.content ? (
          <>
            <Metric label="曝光" value={formatNumber(latest.summary.content.impressions)} />
            <Metric label="点赞" value={formatNumber(latest.summary.content.likes)} />
            <Metric label="收藏" value={formatNumber(latest.summary.content.saves)} />
            <Metric label="评论" value={formatNumber(latest.summary.content.comments)} />
            <Metric label="线索数" value={formatNumber(latest.summary.content.leads)} />
          </>
        ) : null}
        {latest.summary.sales ? (
          <>
            <Metric label="订单数" value={formatNumber(latest.summary.sales.orders)} />
            <Metric label="销售额" value={formatCurrency(latest.summary.sales.revenue)} />
            <Metric
              label="客单价"
              value={formatCurrency(latest.summary.sales.averageOrderValue)}
            />
            <Metric
              label="主要渠道"
              value={latest.summary.sales.channels[0]?.name ?? "未填写"}
              helper={`${latest.summary.sales.channels[0]?.value ?? 0} 单`}
            />
          </>
        ) : null}
        {latest.summary.leads ? (
          <>
            <Metric
              label="主要来源"
              value={latest.summary.leads.sources[0]?.name ?? "未填写"}
              helper={`${latest.summary.leads.sources[0]?.value ?? 0} 条`}
            />
            <Metric
              label="主要意向"
              value={latest.summary.leads.intents[0]?.name ?? "未填写"}
              helper={`${latest.summary.leads.intents[0]?.value ?? 0} 条`}
            />
            <Metric
              label="跟进状态"
              value={latest.summary.leads.statuses[0]?.name ?? "未填写"}
              helper={`${latest.summary.leads.statuses[0]?.value ?? 0} 条`}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold text-slate-950">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}
