"use client";

import { useEffect, useState } from "react";
import { WeeklyReport } from "@/components/report/weekly-report";
import { buildImportedWeeklyReport } from "@/lib/import-insights";
import type { ImportedMetricSnapshot } from "@/lib/import-parser";
import {
  importedMetricsUpdatedEvent,
  projectImportedMetricsStorageKey,
} from "@/lib/import-storage";

function readLatestImport(projectId: string) {
  const storageKey = projectImportedMetricsStorageKey(projectId);
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return null;

  try {
    const snapshots = JSON.parse(stored) as ImportedMetricSnapshot[];
    return snapshots[0] ?? null;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function ImportedWeeklyReportPanel({ projectId }: { projectId: string }) {
  const [snapshot, setSnapshot] = useState<ImportedMetricSnapshot | null>(null);
  const [aiReport, setAiReport] =
    useState<ReturnType<typeof buildImportedWeeklyReport> | null>(null);
  const [source, setSource] = useState<"ai" | "local">("local");

  useEffect(() => {
    const load = () => setSnapshot(readLatestImport(projectId));
    const timer = window.setTimeout(load, 0);

    window.addEventListener(importedMetricsUpdatedEvent, load);
    window.addEventListener("storage", load);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(importedMetricsUpdatedEvent, load);
      window.removeEventListener("storage", load);
    };
  }, [projectId]);

  if (!snapshot) return null;

  const currentReport = aiReport ?? buildImportedWeeklyReport(snapshot);

  async function generateWithAi() {
    const currentSnapshot = snapshot;
    setSource("local");
    setAiReport(null);

    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshot: currentSnapshot,
        }),
      });
      const data = (await response.json()) as {
        report?: ReturnType<typeof buildImportedWeeklyReport>;
        source?: "ai" | "local";
      };

      if (data.report) {
        setAiReport(data.report);
        setSource(data.source ?? "local");
      }
    } catch {
      setAiReport(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
          基于最近导入
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">
          {snapshot.fileName}
        </h2>
        <p className="mt-1 text-base leading-7 text-slate-600">
          {source === "ai"
            ? "以下周报由管理员配置的 AI 接口生成。"
            : "以下周报由本地规则生成；管理员配置 AI 接口后可切换为模型输出。"}
        </p>
        <button
          type="button"
          onClick={generateWithAi}
          className="mt-3 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
        >
          重新生成周报
        </button>
      </div>
      <WeeklyReport report={currentReport} />
    </section>
  );
}
