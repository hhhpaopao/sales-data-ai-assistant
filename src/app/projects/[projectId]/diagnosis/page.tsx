import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DiagnosisContent } from "@/components/diagnosis/diagnosis-content";
import { SectionHeader } from "@/components/section-header";
import { getProject } from "@/lib/mock-data";
import { requireLocalSession } from "@/lib/server-session";

export default async function DiagnosisPage({
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
          eyebrow="AI Insight"
          title={`${project.name} · AI 诊断`}
          description="当前本地版使用样例诊断结论。接入 OpenAI 后会基于聚合指标生成并保存结果。"
          action={
            <Link
              href={`/projects/${project.id}/report`}
              className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              查看周报
            </Link>
          }
        />
        <DiagnosisContent projectId={project.id} diagnosis={project.diagnosis} />
      </div>
    </AppShell>
  );
}
