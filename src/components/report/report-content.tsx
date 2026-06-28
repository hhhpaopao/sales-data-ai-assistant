"use client";

import { useEffect, useState } from "react";
import { ImportedWeeklyReportPanel } from "@/components/report/imported-weekly-report-panel";
import { WeeklyReport } from "@/components/report/weekly-report";
import {
  importedMetricsUpdatedEvent,
  projectImportedMetricsStorageKey,
} from "@/lib/import-storage";
import type { ImportedMetricSnapshot } from "@/lib/import-parser";
import type { WeeklyReport as WeeklyReportType } from "@/lib/types";

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

export function ReportContent({
  projectId,
  report,
}: {
  projectId: string;
  report: WeeklyReportType;
}) {
  const [hasImport, setHasImport] = useState(false);

  useEffect(() => {
    const load = () => setHasImport(Boolean(readLatestImport(projectId)));
    const timer = window.setTimeout(load, 0);

    window.addEventListener(importedMetricsUpdatedEvent, load);
    window.addEventListener("storage", load);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(importedMetricsUpdatedEvent, load);
      window.removeEventListener("storage", load);
    };
  }, [projectId]);

  if (hasImport) {
    return <ImportedWeeklyReportPanel projectId={projectId} />;
  }

  return <WeeklyReport report={report} />;
}
