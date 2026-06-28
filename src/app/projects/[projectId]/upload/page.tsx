import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { UploadPanel } from "@/components/upload-panel";
import { getProject } from "@/lib/mock-data";
import { requireLocalSession } from "@/lib/server-session";

export default async function UploadPage({
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
          eyebrow="Import"
          title={`${project.name} · 数据上传`}
          description="先上传表格，再确认字段。本地版先完成上传、识别和入看板的操作体验。"
          action={
            <Link
              href={`/projects/${project.id}/analytics`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              查看数据看板
            </Link>
          }
        />
        <UploadPanel projectId={project.id} />
      </div>
    </AppShell>
  );
}
