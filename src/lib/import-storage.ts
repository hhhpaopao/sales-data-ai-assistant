import {
  importedMetricsStorageKey,
  uploadHistoryStorageKey,
} from "./accounts";

export function projectUploadHistoryStorageKey(projectId: string) {
  return `${uploadHistoryStorageKey}:${projectId}`;
}

export function projectImportedMetricsStorageKey(projectId: string) {
  return `${importedMetricsStorageKey}:${projectId}`;
}

export const importedMetricsUpdatedEvent = "sales-ai-imported-metrics-updated";
