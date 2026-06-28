import Link from "next/link";
import { CalendarDays, Filter } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AnalyticsMetricCards } from "@/components/dashboard/analytics-metric-cards";
import { ProductBarChart } from "@/components/charts/bar-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { ContentPerformance } from "@/components/dashboard/content-performance";
import { ImportedMetricsPanel } from "@/components/dashboard/imported-metrics-panel";
import { LeadPriorityTable } from "@/components/dashboard/lead-priority-table";
import { SalesSummary } from "@/components/dashboard/sales-summary";
import { SectionHeader } from "@/components/section-header";
import { formatNumber } from "@/lib/format";
import { getProject } from "@/lib/mock-data";
import { requireLocalSession } from "@/lib/server-session";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  await requireLocalSession();

  const { projectId } = await params;
  const project = getProject(projectId);

  return (
    <AppShell projectId={project.id}>
      <div className="mx-auto max-w-7xl space-y-7">
        <SectionHeader
          eyebrow="Analytics"
          title={`${project.name} · 数据看板`}
          description="优先看本周是否增长、哪个内容有效、哪些线索值得跟。看板保持运营密度，结论和数字放在第一层。"
          action={
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                <CalendarDays className="h-4 w-4" />
                近 7 天
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                <Filter className="h-4 w-4" />
                全部渠道
              </button>
              <Link
                href={`/projects/${project.id}/diagnosis`}
                className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
              >
                生成 AI 诊断
              </Link>
            </div>
          }
        />

        <AnalyticsMetricCards project={project} />

        <ImportedMetricsPanel projectId={project.id} />

        <section className="space-y-4">
          <SectionHeader
            title="经营趋势"
            description="把内容浏览、销售额和线索放在同一张图里，先找异常和峰值。"
          />
          <TrendChart data={project.trend} />
        </section>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="min-w-0 space-y-4">
            <SectionHeader title="Top 内容" />
            <ContentPerformance items={project.content} />
          </section>
          <section className="min-w-0 space-y-4">
            <SectionHeader title="商品销售" />
            <ProductBarChart data={project.products} />
            <SalesSummary products={project.products} />
          </section>
        </div>

        <section className="space-y-4">
          <SectionHeader
            title="客户跟进优先级"
            description={`当前共 ${formatNumber(project.metrics.leads)} 条线索，表格优先展示最值得跟进的客户。`}
          />
          <LeadPriorityTable leads={project.leads} />
        </section>
      </div>
    </AppShell>
  );
}
