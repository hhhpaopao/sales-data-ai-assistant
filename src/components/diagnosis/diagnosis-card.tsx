import { CheckCircle2, Database, ListChecks } from "lucide-react";
import type { DiagnosisBlock } from "@/lib/types";

type DiagnosisCardProps = {
  block: DiagnosisBlock;
};

export function DiagnosisCard({ block }: DiagnosisCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            诊断模块
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {block.title}
          </h2>
        </div>
      </div>
      <div className="mt-5 space-y-4 text-base leading-7">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            结论
          </p>
          <p className="mt-1 text-slate-700">{block.finding}</p>
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Database className="h-4 w-4 text-sky-600" />
            数据依据
          </p>
          <p className="mt-1 text-slate-600">{block.evidence}</p>
        </div>
        <div className="rounded-lg border border-teal-100 bg-teal-50/70 p-4 text-teal-950">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ListChecks className="h-4 w-4" />
            建议动作
          </p>
          <p className="mt-1">{block.action}</p>
        </div>
      </div>
    </article>
  );
}
