"use client";

import { useEffect, useState } from "react";
import {
  accountStorageKey,
  defaultAccounts,
  type LocalAccount,
} from "@/lib/accounts";
import { StatusBadge } from "./status-badge";

function loadAccounts() {
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

export function AdminUsersPanel() {
  const [accounts, setAccounts] = useState<LocalAccount[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setAccounts(loadAccounts()), 0);

    return () => window.clearTimeout(timer);
  }, []);

  function persist(nextAccounts: LocalAccount[]) {
    setAccounts(nextAccounts);
    window.localStorage.setItem(accountStorageKey, JSON.stringify(nextAccounts));
  }

  function addUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim()) return;

    const exists = accounts.some((account) => account.email === email.trim());
    if (exists) return;

    persist([
      ...accounts,
      {
        name: name.trim(),
        email: email.trim(),
        password: "User123!",
        role: "user",
        status: "active",
        lastLogin: "未登录",
      },
    ]);
    setName("");
    setEmail("");
  }

  function toggleStatus(emailToToggle: string) {
    persist(
      accounts.map((account) =>
        account.email === emailToToggle
          ? {
              ...account,
              status: account.status === "active" ? "disabled" : "active",
            }
          : account,
      ),
    );
  }

  function resetAccounts() {
    persist(defaultAccounts);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <form
        onSubmit={addUser}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        <h2 className="text-xl font-semibold text-slate-950">新增本地用户</h2>
        <p className="mt-2 text-base leading-7 text-slate-500">
          新增用户默认密码为 User123!。真实部署时这里会接入正式用户系统。
        </p>
        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">姓名</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-base shadow-sm focus:border-teal-600"
              placeholder="例如：运营小张"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">账号邮箱</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-base shadow-sm focus:border-teal-600"
              placeholder="user@salesai.local"
            />
          </div>
          <button className="w-full rounded-lg bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-teal-800">
            创建用户
          </button>
          <button
            type="button"
            onClick={resetAccounts}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            重置为内置账号
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-xl font-semibold text-slate-950">用户列表</h2>
          <p className="mt-1 text-base text-slate-500">
            管理员可以停用普通账号。真实部署时这里会接 Supabase 用户表。
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  用户
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  角色
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  状态
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  最近登录
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((account) => (
                <tr key={account.email} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="text-base font-medium text-slate-950">
                      {account.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{account.email}</p>
                  </td>
                  <td className="px-5 py-4 text-base text-slate-700">
                    {account.role === "admin" ? "管理员" : "普通用户"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      status={account.status === "active" ? "可用" : "停用"}
                    />
                  </td>
                  <td className="px-5 py-4 text-base text-slate-700">
                    {account.lastLogin}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      disabled={account.role === "admin"}
                      onClick={() => toggleStatus(account.email)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {account.status === "active" ? "停用" : "启用"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
