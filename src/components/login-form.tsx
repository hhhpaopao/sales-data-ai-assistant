"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  ScanLine,
  Sparkles,
} from "lucide-react";
import {
  accountStorageKey,
  defaultAccounts,
  sessionStorageKey,
  type LocalAccount,
} from "@/lib/accounts";
import { encodeSessionCookie, sessionCookieName } from "@/lib/session-cookie";

function readAccounts() {
  const stored = window.localStorage.getItem(accountStorageKey);

  if (!stored) {
    window.localStorage.setItem(accountStorageKey, JSON.stringify(defaultAccounts));
    return defaultAccounts;
  }

  try {
    return JSON.parse(stored) as LocalAccount[];
  } catch {
    window.localStorage.setItem(accountStorageKey, JSON.stringify(defaultAccounts));
    return defaultAccounts;
  }
}

type PresetAccount = {
  label: string;
  email: string;
  password: string;
  note: string;
};

const presets: PresetAccount[] = [
  {
    label: "管理员账号",
    email: "admin@salesai.local",
    password: "Admin123!",
    note: "可进入用户管理",
  },
  {
    label: "测试账号",
    email: "test@salesai.local",
    password: "Test123!",
    note: "查看普通店铺工作台",
  },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(presets[0].email);
  const [password, setPassword] = useState(presets[0].password);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );
  const [error, setError] = useState("");

  const activePreset = useMemo(
    () => presets.find((preset) => preset.email === email),
    [email],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accounts = readAccounts();
    const account = accounts.find((item) => item.email === email);

    if (!account || account.password !== password) {
      setError("账号或密码不正确。");
      return;
    }

    if (account.status !== "active") {
      setError("该账号已被管理员停用。");
      return;
    }

    const nextSession = {
      email: account.email,
      name: account.name,
      role: account.role,
      signedInAt: new Date().toISOString(),
    };

    window.localStorage.setItem(sessionStorageKey, JSON.stringify(nextSession));
    document.cookie = `${sessionCookieName}=${encodeSessionCookie(
      nextSession,
    )}; path=/; max-age=604800; samesite=lax`;
    router.push(account.role === "admin" ? "/admin/users" : "/dashboard");
  }

  function applyPreset(preset: PresetAccount) {
    setEmail(preset.email);
    setPassword(preset.password);
    setError("");
  }

  return (
    <div className="grid min-h-screen bg-[#f6f8fb] lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden border-r border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdfa_46%,#eff6ff_100%)] p-10 lg:block">
        <div className="absolute -right-24 top-28 h-64 w-64 rounded-full bg-teal-200/35 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute inset-x-10 top-8 flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-semibold text-slate-500">
          <span>Sales AI workspace</span>
          <span>local preview</span>
        </div>

        <div className="relative z-10 flex h-full flex-col pt-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
              <ScanLine className="h-4 w-4" />
              经营数据入口
            </div>
            <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight text-slate-950">
              上传表格，5 分钟看清本周经营重点。
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
              把内容、订单和线索数据放进同一个店铺空间，先看关键数字，再生成诊断和老板周报。
            </p>
          </div>

          <div className="mt-16">
            <LoginFocusStage mode={focusedField} />
          </div>
        </div>
      </section>

      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-7 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-700 text-lg font-semibold text-white">
              商
            </div>
            <h1 className="mt-5 text-3xl font-semibold text-slate-950">
              经营数据入口
            </h1>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-teal-700">本地账号登录</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  进入工作台
                </h2>
                <p className="mt-2 text-base leading-7 text-slate-500">
                  选择一个演示账号，直接验证上传、看板、诊断和周报。
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
                <LockKeyhole className="h-5 w-5" />
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-slate-700">账号</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-base text-slate-950 shadow-sm focus:border-teal-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">密码</label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  type="password"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-base text-slate-950 shadow-sm focus:border-teal-600"
                />
              </div>

              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-lg">
                登录
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </form>

            <div className="mt-6 grid gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.email}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                    activePreset?.email === preset.email
                      ? "border-teal-200 bg-teal-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Fingerprint className="h-4 w-4 text-teal-700" />
                      {preset.label}
                    </p>
                    <span className="text-xs text-slate-500">{preset.note}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{preset.email}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    密码：{preset.password}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoginFocusStage({
  mode,
}: {
  mode: "email" | "password" | null;
}) {
  const isEmail = mode === "email";
  const isPassword = mode === "password";
  const eyeOffset = isEmail ? "translate-x-2" : isPassword ? "-translate-x-2" : "";
  const stageText = isPassword
    ? "密码输入中，小助手会把视线移开。"
    : isEmail
      ? "账号输入中，小助手正在看向输入框。"
      : "点击账号或密码输入框，小助手会跟着变化。";

  return (
    <div className="relative max-w-[760px] py-10">
      <div className="absolute inset-x-8 bottom-8 h-14 rounded-[50%] bg-teal-900/5 blur-xl" />
      <div className="absolute left-12 top-6 h-2 w-2 rounded-full bg-teal-400/70" />
      <div className="absolute right-24 top-12 h-2.5 w-2.5 rounded-full bg-blue-400/60" />
      <div className="absolute left-1/2 top-2 h-1.5 w-1.5 rounded-full bg-amber-300/80" />

      <div className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-teal-800 shadow-sm backdrop-blur">
        <Sparkles className="h-4 w-4" />
        {stageText}
      </div>

      <div className="relative z-10 flex min-h-[190px] items-end justify-center gap-8">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className={`motion-float-soft relative h-28 w-24 transition duration-500 ${
              isPassword ? "rotate-[-5deg]" : isEmail ? "rotate-[4deg]" : ""
            }`}
            style={{
              animationDelay: `${item * 180}ms`,
              transitionDelay: `${item * 60}ms`,
            }}
          >
            <div className="absolute inset-x-3 bottom-0 h-16 rounded-[24px_24px_18px_18px] bg-teal-600 shadow-[0_18px_38px_rgba(15,118,110,0.22)]" />
            <div className="absolute left-1/2 top-5 h-16 w-16 -translate-x-1/2 rounded-[22px] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.10)]" />
            <div className="absolute left-1/2 top-8 h-9 w-11 -translate-x-1/2 rounded-full bg-teal-100" />
            <div className="absolute left-1/2 top-11 flex -translate-x-1/2 gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full bg-slate-950 transition-transform duration-500 ${eyeOffset}`}
              />
              <span
                className={`h-2.5 w-2.5 rounded-full bg-slate-950 transition-transform duration-500 ${eyeOffset}`}
              />
            </div>
            {isPassword ? (
              <div className="absolute left-1/2 top-10 h-5 w-20 -translate-x-1/2 rounded-full bg-white shadow-sm transition-all duration-500">
                <EyeOff className="mx-auto mt-1 h-3.5 w-3.5 text-slate-400" />
              </div>
            ) : null}
            <div className="absolute bottom-5 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-teal-200" />
            <div className="absolute -bottom-4 left-1/2 h-3 w-20 -translate-x-1/2 rounded-[50%] bg-slate-900/10 blur-sm" />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto mt-7 flex max-w-md items-center justify-center gap-3 text-xs font-semibold text-slate-500">
        <span className={`h-2 w-2 rounded-full ${isEmail ? "bg-teal-600" : "bg-slate-300"}`} />
        <span>账号</span>
        <span className={`h-2 w-2 rounded-full ${isPassword ? "bg-teal-600" : "bg-slate-300"}`} />
        <span>密码</span>
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span>进入工作台</span>
      </div>
    </div>
  );
}
