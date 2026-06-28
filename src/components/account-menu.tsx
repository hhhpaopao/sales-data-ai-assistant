"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { sessionStorageKey } from "@/lib/accounts";
import { sessionCookieName } from "@/lib/session-cookie";

type LocalSession = {
  email: string;
  name: string;
  role: "admin" | "user";
};

export function AccountMenu() {
  const router = useRouter();
  const [session, setSession] = useState<LocalSession | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(sessionStorageKey);
      if (!stored) return;

      try {
        setSession(JSON.parse(stored) as LocalSession);
      } catch {
        window.localStorage.removeItem(sessionStorageKey);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function signOut() {
    window.localStorage.removeItem(sessionStorageKey);
    document.cookie = `${sessionCookieName}=; path=/; max-age=0; samesite=lax`;
    router.push("/login");
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        登录
      </Link>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      {session.role === "admin" ? (
        <Link
          href="/admin/users"
          className="hidden items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-100 sm:inline-flex"
        >
          <ShieldCheck className="h-4 w-4" />
          用户管理
        </Link>
      ) : null}
      <div className="hidden min-w-0 text-right sm:block">
        <p className="truncate text-sm font-medium text-slate-950">{session.name}</p>
        <p className="truncate text-xs text-slate-500">{session.email}</p>
      </div>
      <button
        type="button"
        onClick={signOut}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <LogOut className="h-4 w-4" />
        退出
      </button>
    </div>
  );
}
