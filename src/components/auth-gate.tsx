"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sessionStorageKey, type LocalSession } from "@/lib/accounts";

type AuthGateProps = {
  children: React.ReactNode;
  requiredRole?: "admin";
};

export function AuthGate({ children, requiredRole }: AuthGateProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed">("checking");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(sessionStorageKey);

      if (!stored) {
        router.replace("/login");
        return;
      }

      try {
        const session = JSON.parse(stored) as LocalSession;

        if (requiredRole === "admin" && session.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setStatus("allowed");
      } catch {
        window.localStorage.removeItem(sessionStorageKey);
        router.replace("/login");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [requiredRole, router]);

  if (status !== "allowed") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto h-2 w-24 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-teal-600" />
          </div>
          <p className="mt-4 text-base font-medium text-slate-950">
            正在确认账号权限
          </p>
          <p className="mt-1 text-sm text-slate-500">请稍候，马上进入工作台。</p>
        </div>
      </div>
    );
  }

  return children;
}
