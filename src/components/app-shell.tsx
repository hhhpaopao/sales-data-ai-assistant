import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Upload,
  WandSparkles,
} from "lucide-react";
import { projects } from "@/lib/mock-data";
import { AccountMenu } from "./account-menu";
import { AuthGate } from "./auth-gate";

const navItems = [
  { href: "/dashboard", label: "店铺空间", icon: LayoutDashboard },
  { href: "/admin/users", label: "用户管理", icon: ShieldCheck },
  { href: "/admin/ai-settings", label: "AI 配置", icon: Settings2 },
];

const projectItems = [
  { slug: "upload", label: "数据上传", icon: Upload },
  { slug: "analytics", label: "数据看板", icon: BarChart3 },
  { slug: "diagnosis", label: "AI 诊断", icon: WandSparkles },
  { slug: "report", label: "周报", icon: FileText },
];

type AppShellProps = {
  children: React.ReactNode;
  projectId?: string;
  requiredRole?: "admin";
};

export function AppShell({ children, projectId, requiredRole }: AppShellProps) {
  const currentProject =
    projects.find((project) => project.id === projectId) ?? projects[0];

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-slate-200/80 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-base font-semibold text-white shadow-sm">
            商
          </div>
          <div className="ml-3 min-w-0">
            <p className="truncate text-base font-semibold text-slate-950">
              经营分析助手
            </p>
            <p className="text-sm text-slate-500">内容 / 线索 / 销售</p>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            >
              <item.icon className="h-4 w-4 text-slate-500" />
              {item.label}
            </Link>
          ))}
        </nav>

        {projectId ? (
          <div className="border-t border-slate-200/80 px-3 py-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              当前店铺
            </p>
            <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/60 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-base font-semibold text-slate-950">
                  {currentProject.name}
                </p>
                <span className="h-2 w-2 rounded-full bg-teal-600" />
              </div>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                {currentProject.channel}
              </p>
            </div>
            <div className="mt-4 space-y-1">
              {projectItems.map((item) => (
                <Link
                  key={item.slug}
                  href={`/projects/${currentProject.id}/${item.slug}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:translate-x-0.5 hover:bg-teal-50 hover:text-teal-800"
                >
                  <item.icon className="h-4 w-4 text-slate-500" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200/80 p-4">
          <div className="rounded-lg border border-teal-900 bg-slate-950 p-3 text-white shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4 text-teal-300" />
              经营工作台
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              上传表格，5 分钟看清本周经营重点。
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-950">
                小商家内容/销售数据 AI 分析助手
              </p>
              <p className="hidden text-sm text-slate-500 sm:block">
                上传表格，生成看板、诊断和周报
              </p>
            </div>
            <AccountMenu />
          </div>
          {projectId ? (
            <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:px-6 lg:hidden">
              {projectItems.map((item) => (
                <Link
                  key={item.slug}
                  href={`/projects/${currentProject.id}/${item.slug}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                >
                  <item.icon className="h-4 w-4 text-slate-500" />
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <AuthGate requiredRole={requiredRole}>{children}</AuthGate>
        </main>
      </div>
    </div>
  );
}
