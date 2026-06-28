import { ClipboardCheck } from "lucide-react";
import type { WeeklyReport as WeeklyReportType } from "@/lib/types";

type WeeklyReportProps = {
  report: WeeklyReportType;
};

const sections = [
  { key: "result", title: "本周结果", tone: "bg-emerald-50 text-emerald-700" },
  { key: "problems", title: "主要问题", tone: "bg-red-50 text-red-700" },
  { key: "opportunities", title: "机会点", tone: "bg-sky-50 text-sky-700" },
  { key: "nextActions", title: "下周动作", tone: "bg-amber-50 text-amber-700" },
] as const;

export function WeeklyReport({ report }: WeeklyReportProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-200 bg-slate-950 p-5 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500/15 text-teal-100 ring-1 ring-white/15">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">老板周报</h2>
              <p className="mt-1 text-base text-slate-300">
                用经营语言总结结果、问题、机会和动作。
              </p>
            </div>
          </div>
          <span className="rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-200">
            本地生成
          </span>
        </div>
      </div>
      <div className="grid gap-0 md:grid-cols-2">
        {sections.map((section) => (
          <section key={section.key} className="border-b border-slate-200 p-5 md:border-r">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${section.tone}`} />
              <h3 className="text-lg font-semibold text-slate-950">
                {section.title}
              </h3>
            </div>
            <ul className="mt-4 space-y-3">
              {report[section.key].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-base leading-7 text-slate-700"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
