"use client";

import { useEffect, useState } from "react";
import { DiagnosisCard } from "@/components/diagnosis/diagnosis-card";
import { ImportedDiagnosisPanel } from "@/components/diagnosis/imported-diagnosis-panel";
import {
  importedMetricsUpdatedEvent,
  projectImportedMetricsStorageKey,
} from "@/lib/import-storage";
import type { ImportedMetricSnapshot } from "@/lib/import-parser";
import type { DiagnosisBlock } from "@/lib/types";

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

export function DiagnosisContent({
  projectId,
  diagnosis,
}: {
  projectId: string;
  diagnosis: DiagnosisBlock[];
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
    return <ImportedDiagnosisPanel projectId={projectId} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {diagnosis.map((block) => (
        <DiagnosisCard key={block.title} block={block} />
      ))}
    </div>
  );
}
