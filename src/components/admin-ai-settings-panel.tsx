"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Settings2 } from "lucide-react";
import {
  aiSettingsStorageKey,
  defaultAiSettings,
  maskApiKey,
  type AiSettings,
} from "@/lib/ai-settings";

function loadSettings() {
  const stored = window.localStorage.getItem(aiSettingsStorageKey);
  if (!stored) return defaultAiSettings;

  try {
    return { ...defaultAiSettings, ...(JSON.parse(stored) as Partial<AiSettings>) };
  } catch {
    window.localStorage.removeItem(aiSettingsStorageKey);
    return defaultAiSettings;
  }
}

export function AdminAiSettingsPanel() {
  const [settings, setSettings] = useState<AiSettings>(defaultAiSettings);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setSettings(loadSettings());

      try {
        const response = await fetch("/api/admin/ai-settings", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          settings?: Partial<AiSettings>;
          hasApiKey?: boolean;
        };

        if (data.settings) {
          setSettings((current) => ({
            ...current,
            ...data.settings,
            apiKey: data.hasApiKey ? "" : current.apiKey,
          }));
        }
      } catch {
        return;
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function updateField(field: keyof AiSettings, value: string) {
    setSaved(false);
    setTestResult("");
    setSettings((current) => ({ ...current, [field]: value }));
  }

  function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem(aiSettingsStorageKey, JSON.stringify(settings));
    window.dispatchEvent(new Event("sales-ai-settings-updated"));

    fetch("/api/admin/ai-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          setTestResult(
            data.error ??
              "配置已保存到当前浏览器，但未能保存为全员共享配置。",
          );
          return;
        }

        setSaved(true);
        setTestResult("配置已保存为全员共享配置，普通用户会使用这套 AI 接口。");
      })
      .catch(() => {
        setTestResult("配置已保存到当前浏览器，但服务端共享保存失败。");
      });
  }

  async function testConnection() {
    setTesting(true);
    setTestResult("");

    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshot: {
            id: "ai-settings-test",
            fileName: "测试数据.csv",
            dataType: "sales",
            rowCount: 3,
            importedAt: "刚刚",
            summary: {
              sales: {
                orders: 3,
                revenue: 1280,
                averageOrderValue: 426.67,
                channels: [{ name: "测试渠道", value: 3 }],
              },
            },
          },
        }),
      });
      const data = (await response.json()) as { source?: string; error?: string };

      if (!response.ok) {
        setTestResult(data.error ?? "测试失败，请检查接口配置。");
        return;
      }

      setTestResult(
        data.source === "ai"
          ? "连接成功，AI 接口已可用于诊断和周报。"
          : "已保存配置，但当前请求使用本地规则兜底。请检查 API Key、Base URL 和模型名。",
      );
    } catch {
      setTestResult("测试失败，请检查网络或接口地址。");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form
        onSubmit={saveSettings}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">AI 接口配置</h2>
            <p className="mt-2 text-base leading-7 text-slate-500">
              当前配置保存在本浏览器，用于本地 MVP 验证。正式部署建议迁到服务端密钥管理。
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
            <Settings2 className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">供应商名称</label>
            <input
              value={settings.provider}
              onChange={(event) => updateField("provider", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-base shadow-sm focus:border-teal-600"
              placeholder="DeepSeek / OpenAI compatible"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Base URL</label>
            <input
              value={settings.baseUrl}
              onChange={(event) => updateField("baseUrl", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-base shadow-sm focus:border-teal-600"
              placeholder="https://api.deepseek.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">模型名称</label>
            <input
              value={settings.model}
              onChange={(event) => updateField("model", event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-base shadow-sm focus:border-teal-600"
              placeholder="deepseek-chat"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">API Key</label>
            <input
              value={settings.apiKey}
              onChange={(event) => updateField("apiKey", event.target.value)}
              type="password"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-base shadow-sm focus:border-teal-600"
              placeholder="只保存在当前浏览器"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button className="rounded-lg bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-teal-800">
              保存配置
            </button>
            <button
              type="button"
              onClick={testConnection}
              disabled={testing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              测试连接
            </button>
          </div>
        </div>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h2 className="text-xl font-semibold text-slate-950">当前状态</h2>
        <div className="mt-5 space-y-3">
          {[
            ["供应商", settings.provider || "未填写"],
            ["接口地址", settings.baseUrl || "未填写"],
            ["模型", settings.model || "未填写"],
            ["密钥", maskApiKey(settings.apiKey)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <span className="font-medium text-slate-500">{label}</span>
              <span className="truncate font-semibold text-slate-950">{value}</span>
            </div>
          ))}
        </div>

        {saved ? (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            配置已保存到当前浏览器。
          </div>
        ) : null}

        {testResult ? (
          <div className="mt-5 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">
            {testResult}
          </div>
        ) : null}

      </div>
    </div>
  );
}
