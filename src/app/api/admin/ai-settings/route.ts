import { NextRequest, NextResponse } from "next/server";
import { defaultAiSettings, type AiSettings } from "@/lib/ai-settings";
import { decodeSessionCookie, sessionCookieName } from "@/lib/session-cookie";
import {
  readServerAiSettings,
  saveServerAiSettings,
} from "@/lib/server-ai-settings";

function isAdmin(request: NextRequest) {
  const session = decodeSessionCookie(
    request.cookies.get(sessionCookieName)?.value,
  );

  return session?.role === "admin";
}

function normalizeSettings(settings: Partial<AiSettings>): AiSettings {
  return {
    provider: settings.provider?.trim() || defaultAiSettings.provider,
    baseUrl: settings.baseUrl?.trim() || defaultAiSettings.baseUrl,
    model: settings.model?.trim() || defaultAiSettings.model,
    apiKey: settings.apiKey?.trim() || "",
  };
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await readServerAiSettings();

  return NextResponse.json({
    settings: {
      ...settings,
      apiKey: settings.apiKey ? "" : "",
    },
    hasApiKey: Boolean(settings.apiKey),
  });
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { settings?: Partial<AiSettings> };
  const settings = normalizeSettings(body.settings ?? {});
  const result = await saveServerAiSettings(settings);

  if (!result.saved) {
    return NextResponse.json(
      {
        error:
          result.reason === "SUPABASE_NOT_CONFIGURED"
            ? "Supabase 尚未配置，无法保存为全员共享配置。"
            : "保存 AI 配置失败，请检查 Supabase 表和权限。",
        reason: result.reason,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
