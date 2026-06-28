import { AdminAiSettingsPanel } from "@/components/admin-ai-settings-panel";
import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { requireLocalSession } from "@/lib/server-session";

export default async function AdminAiSettingsPage() {
  await requireLocalSession("admin");

  return (
    <AppShell requiredRole="admin">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeader
          title="管理员 · AI 接口配置"
          description="配置兼容 OpenAI Chat Completions 的接口，用于 AI 诊断和每周报告生成。"
        />
        <AdminAiSettingsPanel />
      </div>
    </AppShell>
  );
}
