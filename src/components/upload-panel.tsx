"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, UploadCloud } from "lucide-react";
import {
  importedMetricsUpdatedEvent,
  projectImportedMetricsStorageKey,
  projectUploadHistoryStorageKey,
} from "@/lib/import-storage";
import {
  aggregateImport,
  detectDataType,
  parseCsv,
  parseExcel,
  type ImportDataType,
  type ImportedMetricSnapshot,
  type TabularParseResult,
} from "@/lib/import-parser";
import { formatCurrency, formatNumber } from "@/lib/format";

type UploadState = "idle" | "parsing" | "needs-type" | "done" | "error";

type UploadRecord = {
  id: string;
  fileName: string;
  importedAt: string;
  rowCount: number;
  dataType: ImportDataType;
  status: "已完成";
};

const dataTypeLabels: Record<ImportDataType, string> = {
  content: "内容数据",
  sales: "销售数据",
  leads: "线索数据",
};

function readUploadHistory(projectId: string) {
  const storageKey = projectUploadHistoryStorageKey(projectId);
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as UploadRecord[];
  } catch {
    window.localStorage.removeItem(storageKey);
    return [];
  }
}

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

export function UploadPanel({ projectId }: { projectId: string }) {
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState("");
  const [history, setHistory] = useState<UploadRecord[]>([]);
  const [detectedType, setDetectedType] = useState<ImportDataType | "unknown">(
    "unknown",
  );
  const [selectedType, setSelectedType] = useState<ImportDataType>("content");
  const [pendingParsed, setPendingParsed] = useState<TabularParseResult | null>(
    null,
  );
  const [error, setError] = useState("");
  const [latestSnapshot, setLatestSnapshot] =
    useState<ImportedMetricSnapshot | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setHistory(readUploadHistory(projectId)),
      0,
    );

    return () => window.clearTimeout(timer);
  }, [projectId]);

  function persistSnapshot(snapshot: ImportedMetricSnapshot) {
    const record: UploadRecord = {
      id: snapshot.id,
      fileName: snapshot.fileName,
      importedAt: snapshot.importedAt,
      rowCount: snapshot.rowCount,
      dataType: snapshot.dataType,
      status: "已完成",
    };
    const nextHistory = [record, ...readUploadHistory(projectId)].slice(0, 6);
    const nextMetrics = [snapshot, ...readImportedMetrics(projectId)].slice(0, 10);

    setHistory(nextHistory);
    setLatestSnapshot(snapshot);
    window.localStorage.setItem(
      projectUploadHistoryStorageKey(projectId),
      JSON.stringify(nextHistory),
    );
    window.localStorage.setItem(
      projectImportedMetricsStorageKey(projectId),
      JSON.stringify(nextMetrics),
    );
    window.dispatchEvent(new Event(importedMetricsUpdatedEvent));
  }

  function finishImport(
    type: ImportDataType,
    parsed = pendingParsed,
    currentFileName = fileName,
  ) {
    if (!parsed?.headers.length || !parsed.rows.length) {
      setError("没有识别到有效表头和数据行。");
      setState("error");
      return;
    }

    const snapshot = aggregateImport(currentFileName, parsed, type);
    persistSnapshot(snapshot);
    setSelectedType(type);
    setState("done");
  }

  async function handleFile(file?: File) {
    if (!file) return;

    setError("");
    setLatestSnapshot(null);
    setPendingParsed(null);
    setFileName(file.name);

    const lowerName = file.name.toLowerCase();
    const isCsv = lowerName.endsWith(".csv");
    const isExcel = lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls");

    if (!isCsv && !isExcel) {
      setError("请上传 CSV、XLSX 或 XLS 文件。");
      setState("error");
      return;
    }

    setState("parsing");

    let parsed: TabularParseResult;
    try {
      parsed = isCsv
        ? parseCsv(await file.text())
        : await parseExcel(await file.arrayBuffer());
    } catch {
      setError("文件解析失败，请检查表格是否损坏，或先另存为 CSV 后重试。");
      setState("error");
      return;
    }

    if (!parsed.headers.length || !parsed.rows.length) {
      setError("没有识别到有效表头和数据行。");
      setState("error");
      return;
    }

    const type = detectDataType(parsed.headers);
    setDetectedType(type);
    setPendingParsed(parsed);

    if (type === "unknown") {
      setState("needs-type");
      return;
    }

    finishImport(type, parsed, file.name);
  }

  const content = latestSnapshot?.summary.content;
  const sales = latestSnapshot?.summary.sales;
  const leads = latestSnapshot?.summary.leads;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex flex-wrap gap-2">
          {(["content", "sales", "leads"] as ImportDataType[]).map((item) => (
            <span
              key={item}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600"
            >
              {dataTypeLabels[item]}
            </span>
          ))}
        </div>
        <label
          className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-teal-300 bg-teal-50/40 px-6 py-12 text-center hover:border-teal-500 hover:bg-teal-50"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFile(event.dataTransfer.files[0]);
          }}
        >
          <span className="motion-scan-soft pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm ring-1 ring-teal-100">
            <UploadCloud className="h-7 w-7" />
          </div>
          <span className="mt-4 text-xl font-semibold text-slate-950">
            上传 CSV 或 Excel
          </span>
          <span className="mt-2 max-w-md text-base leading-7 text-slate-500">
            自动识别内容、销售或线索数据，解析后会把指标写入当前浏览器并同步到数据看板。
          </span>
          <span className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            选择文件
          </span>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>

        {state !== "idle" ? (
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 border-b border-slate-200 p-4">
              <FileSpreadsheet className="h-5 w-5 text-teal-700" />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-950">
                  {fileName}
                </p>
                <p className="text-sm text-slate-500">
                  {state === "parsing"
                    ? "正在解析文件"
                    : state === "needs-type"
                      ? "需要选择数据类型"
                      : state === "done"
                        ? "导入完成"
                        : "导入失败"}
                </p>
              </div>
            </div>
            <div className="p-4">
              {state === "parsing" ? (
                <div className="space-y-3">
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 w-2/3 rounded-full bg-teal-600" />
                  </div>
                  <p className="text-base text-slate-500">
                    正在读取表头、识别数据类型并计算基础指标。
                  </p>
                </div>
              ) : null}

              {state === "needs-type" ? (
                <div className="space-y-4">
                  <p className="text-base text-slate-600">
                    未能自动判断数据类型，请选择后继续导入。
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(["content", "sales", "leads"] as ImportDataType[]).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedType(type)}
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                            selectedType === type
                              ? "border-teal-300 bg-teal-50 text-teal-800"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {dataTypeLabels[type]}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => finishImport(selectedType)}
                    className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
                  >
                    确认导入
                  </button>
                </div>
              ) : null}

              {state === "done" && latestSnapshot ? (
                <div>
                  <p className="text-base font-medium text-slate-950">
                    已识别为{dataTypeLabels[latestSnapshot.dataType]}，共{" "}
                    {latestSnapshot.rowCount} 行
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    自动识别结果：
                    {detectedType === "unknown"
                      ? "手动选择"
                      : dataTypeLabels[detectedType]}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {content ? (
                      <>
                        <SummaryItem label="曝光" value={formatNumber(content.impressions)} />
                        <SummaryItem label="点赞" value={formatNumber(content.likes)} />
                        <SummaryItem label="收藏" value={formatNumber(content.saves)} />
                        <SummaryItem label="评论" value={formatNumber(content.comments)} />
                        <SummaryItem label="线索数" value={formatNumber(content.leads)} />
                      </>
                    ) : null}
                    {sales ? (
                      <>
                        <SummaryItem label="订单数" value={formatNumber(sales.orders)} />
                        <SummaryItem label="销售额" value={formatCurrency(sales.revenue)} />
                        <SummaryItem
                          label="客单价"
                          value={formatCurrency(sales.averageOrderValue)}
                        />
                        <SummaryItem
                          label="渠道数"
                          value={`${sales.channels.length} 个`}
                        />
                      </>
                    ) : null}
                    {leads ? (
                      <>
                        <SummaryItem label="来源数" value={`${leads.sources.length} 个`} />
                        <SummaryItem label="意向等级" value={`${leads.intents.length} 类`} />
                        <SummaryItem
                          label="跟进状态"
                          value={`${leads.statuses.length} 类`}
                        />
                      </>
                    ) : null}
                  </div>
                  <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3 text-base text-teal-950">
                    指标已写入当前店铺看板。打开数据看板即可查看最新结果。
                  </div>
                </div>
              ) : null}

              {state === "error" ? (
                <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-base text-red-700">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-xl font-semibold text-slate-950">导入历史</h2>
          <p className="mt-1 text-base text-slate-500">
            最近上传的文件会保存在当前浏览器，刷新后仍可查看。
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {history.length ? (
            history.map((record) => (
              <div
                key={record.id}
                className="grid gap-2 px-5 py-4 text-sm text-slate-700 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center"
              >
                <span className="truncate font-medium text-slate-950">
                  {record.fileName}
                </span>
                <span>{dataTypeLabels[record.dataType]}</span>
                <span>{record.rowCount} 行</span>
                <span>{record.importedAt}</span>
                <span className="w-fit rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {record.status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <p className="mt-3 text-base font-medium text-slate-950">
                暂无导入记录
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                上传一个 .csv、.xlsx 或 .xls 文件后，这里会出现记录。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}
