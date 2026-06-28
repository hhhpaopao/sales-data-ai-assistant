import { AdminUsersPanel } from "@/components/admin-users-panel";
import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { requireLocalSession } from "@/lib/server-session";

export default async function AdminUsersPage() {
  await requireLocalSession("admin");

  return (
    <AppShell requiredRole="admin">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeader
          title="管理员 · 用户管理"
          description="本地账号版本用于个人试用和内部管理，后续可平滑替换为 Clerk + Supabase。"
        />
        <AdminUsersPanel />
      </div>
    </AppShell>
  );
}
