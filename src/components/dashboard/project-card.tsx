import Link from "next/link";
import { ArrowRight, BarChart3, Clock3, MessageSquareText } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { Project } from "@/lib/types";
import { StatusBadge } from "../status-badge";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}/analytics`}
      className="group block rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_16px_38px_rgba(15,23,42,0.10)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-semibold text-slate-950">
              {project.name}
            </h2>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {project.channel} · {project.category}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-2 text-slate-400 transition group-hover:border-teal-200 group-hover:text-teal-700">
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">本周销售额</p>
          <p className="mt-1 text-xl font-semibold text-slate-950">
            {formatCurrency(project.metrics.revenue)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">内容互动率</p>
          <p className="mt-1 text-xl font-semibold text-slate-950">
            {formatPercent(project.metrics.engagementRate)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-slate-400" />
          {project.metrics.leads} 条线索待分析
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-slate-400" />
          {project.metrics.contentCount} 条内容参与统计
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-slate-400" />
          最近更新：{project.updatedAt}
        </div>
      </div>
    </Link>
  );
}
