import type { AiSettings } from "./ai-settings";
import { defaultAiSettings } from "./ai-settings";

const settingKey = "ai_settings";

type AppSettingRow = {
  key: string;
  value: AiSettings;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY;

  if (!url || !key) return null;

  return {
    baseUrl: url.replace(/\/$/, ""),
    key,
  };
}

export function getEnvAiSettings(): AiSettings {
  return {
    provider: process.env.AI_PROVIDER ?? defaultAiSettings.provider,
    baseUrl: process.env.AI_API_BASE_URL ?? defaultAiSettings.baseUrl,
    model: process.env.AI_MODEL ?? defaultAiSettings.model,
    apiKey: process.env.AI_API_KEY ?? "",
  };
}

export async function readServerAiSettings() {
  const supabase = getSupabaseConfig();

  if (!supabase) {
    return getEnvAiSettings();
  }

  const response = await fetch(
    `${supabase.baseUrl}/rest/v1/app_settings?key=eq.${settingKey}&select=key,value&limit=1`,
    {
      headers: {
        apikey: supabase.key,
        Authorization: `Bearer ${supabase.key}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return getEnvAiSettings();
  }

  const rows = (await response.json()) as AppSettingRow[];
  return rows[0]?.value ?? getEnvAiSettings();
}

export async function saveServerAiSettings(settings: AiSettings) {
  const supabase = getSupabaseConfig();

  if (!supabase) {
    return { saved: false, reason: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const response = await fetch(`${supabase.baseUrl}/rest/v1/app_settings`, {
    method: "POST",
    headers: {
      apikey: supabase.key,
      Authorization: `Bearer ${supabase.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      key: settingKey,
      value: settings,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    return { saved: false, reason: "SUPABASE_SAVE_FAILED" as const };
  }

  return { saved: true, reason: "SUPABASE" as const };
}
