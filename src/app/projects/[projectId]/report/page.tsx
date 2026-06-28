import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { ReportContent } from "@/components/report/report-content";
import { SectionHeader } from "@/components/section-header";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getProject } from "@/lib/mock-data";
import { requireLocalSession } from "@/lib/server-session";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  await requireLocalSession();

  const { projectId } = await params;
  const project = getProject(projectId);

  return (
    <AppShell projectId={project.id}>
      <div className="mx-auto max-w-6xl space-y-6">
        <SectionHeader
          eyebrow="Weekly Report"
          title={`${project.name} · 每周报告`}
          description="给老板看的版本：少讲过程，多讲结果、问题和下周动作。"
          action={
            <Link
              href={`/projects/${project.id}/upload`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              补充新数据
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="本周销售额"
            value={formatCurrency(project.metrics.revenue)}
            helper={`${project.metrics.orders} 单`}
            meta="结果"
            tone="good"
          />
          <MetricCard
            label="线索"
            value={`${project.metrics.leads} 条`}
            helper="按优先级安排跟进"
            meta="动作"
          />
          <MetricCard
            label="内容互动率"
            value={formatPercent(project.metrics.engagementRate)}
            helper="用于判断选题是否有效"
            meta="内容"
          />
        </div>
        <ReportContent projectId={project.id} report={project.report} />
      </div>
    </AppShell>
  );
}
