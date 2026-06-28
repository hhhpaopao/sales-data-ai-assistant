import { AppShell } from "@/components/app-shell";
import { ProjectCard } from "@/components/dashboard/project-card";
import { SectionHeader } from "@/components/section-header";
import { projects } from "@/lib/mock-data";
import { requireLocalSession } from "@/lib/server-session";

export default async function DashboardPage() {
  await requireLocalSession();

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeader
          eyebrow="Workspace"
          title="店铺空间"
          description="每个空间对应一个店铺或账号。先选择要分析的业务，再进入上传、看板、诊断和周报。"
          action={
            <button className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">
              新建店铺
            </button>
          }
        />

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {["全部", "建议复盘", "等待导入", "已完成导入"].map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600"
                >
                  {item}
                </span>
              ))}
            </div>
            <span className="text-sm text-slate-500">
              共 {projects.length} 个店铺空间
            </span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
