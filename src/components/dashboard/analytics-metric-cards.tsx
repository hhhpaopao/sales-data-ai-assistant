"use client";

import { useEffect, useMemo, useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import {
  importedMetricsUpdatedEvent,
  projectImportedMetricsStorageKey,
} from "@/lib/import-storage";
import type { ImportedMetricSnapshot } from "@/lib/import-parser";
import type { Project } from "@/lib/types";

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

function buildImportedCards(snapshot: ImportedMetricSnapshot) {
  if (snapshot.summary.sales) {
    const sales = snapshot.summary.sales;

    return [
      {
        label: "本次销售额",
        value: formatCurrency(sales.revenue),
        helper: `${formatNumber(sales.orders)} 单，来自最近导入订单`,
        meta: "已导入",
        tone: "good" as const,
      },
      {
        label: "客单价",
        value: formatCurrency(sales.averageOrderValue),
        helper: "销售额 / 订单数",
        meta: "销售",
      },
      {
        label: "主要渠道",
        value: sales.channels[0]?.name ?? "未填写",
        helper: `${sales.channels[0]?.value ?? 0} 单`,
        meta: "渠道",
      },
      {
        label: "导入行数",
        value: `${snapshot.rowCount} 行`,
        helper: snapshot.fileName,
        meta: "来源",
      },
    ];
  }

  if (snapshot.summary.content) {
    const content = snapshot.summary.content;
    const interactions = content.likes + content.saves + content.comments;
    const leadRate = content.impressions
      ? (content.leads / content.impressions) * 100
      : 0;

    return [
      {
        label: "本次曝光",
        value: formatNumber(content.impressions),
        helper: `${snapshot.rowCount} 条内容`,
        meta: "已导入",
        tone: "good" as const,
      },
      {
        label: "内容互动",
        value: formatNumber(interactions),
        helper: "点赞 + 收藏 + 评论",
        meta: "内容",
      },
      {
        label: "线索数",
        value: `${formatNumber(content.leads)} 条`,
        helper: `线索率约 ${formatPercent(leadRate)}`,
        meta: "转化",
      },
      {
        label: "导入行数",
        value: `${snapshot.rowCount} 行`,
        helper: snapshot.fileName,
        meta: "来源",
      },
    ];
  }

  const leads = snapshot.summary.leads;

  return [
    {
      label: "本次线索",
      value: `${snapshot.rowCount} 条`,
      helper: "来自最近导入线索表",
      meta: "已导入",
      tone: "good" as const,
    },
    {
      label: "主要来源",
      value: leads?.sources[0]?.name ?? "未填写",
      helper: `${leads?.sources[0]?.value ?? 0} 条`,
      meta: "来源",
    },
    {
      label: "主要意向",
      value: leads?.intents[0]?.name ?? "未填写",
      helper: `${leads?.intents[0]?.value ?? 0} 条`,
      meta: "意向",
    },
    {
      label: "跟进状态",
      value: leads?.statuses[0]?.name ?? "未填写",
      helper: `${leads?.statuses[0]?.value ?? 0} 条`,
      meta: "动作",
    },
  ];
}

export function AnalyticsMetricCards({
  project,
}: {
  project: Project;
}) {
  const [snapshot, setSnapshot] = useState<ImportedMetricSnapshot | null>(null);

  useEffect(() => {
    const load = () => setSnapshot(readLatestImport(project.id));
    const timer = window.setTimeout(load, 0);

    window.addEventListener(importedMetricsUpdatedEvent, load);
    window.addEventListener("storage", load);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(importedMetricsUpdatedEvent, load);
      window.removeEventListener("storage", load);
    };
  }, [project.id]);

  const cards = useMemo(() => {
    if (snapshot) return buildImportedCards(snapshot);

    return [
      {
        label: "本周销售额",
        value: formatCurrency(project.metrics.revenue),
        helper: `${project.metrics.orders} 单，关注高客单商品`,
        meta: "+12%",
        tone: "good" as const,
      },
      {
        label: "新增线索",
        value: `${project.metrics.leads} 条`,
        helper: "优先跟进已明确预算或场景的客户",
        meta: "待跟进",
      },
      {
        label: "内容互动率",
        value: formatPercent(project.metrics.engagementRate),
        helper: `${project.metrics.contentCount} 条内容参与统计`,
        meta: "内容",
      },
      {
        label: "销售转化率",
        value: formatPercent(project.metrics.conversionRate),
        helper: "本地样例口径：订单数 / 线索与访问",
        meta: "样例",
        tone: "warn" as const,
      },
    ];
  }, [project, snapshot]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MetricCard
          key={card.label}
          label={card.label}
          value={card.value}
          helper={card.helper}
          meta={card.meta}
          tone={card.tone}
        />
      ))}
    </div>
  );
}
