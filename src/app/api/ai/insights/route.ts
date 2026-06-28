import { NextRequest, NextResponse } from "next/server";
import { decodeSessionCookie, sessionCookieName } from "@/lib/session-cookie";
import type { DiagnosisBlock, WeeklyReport } from "@/lib/types";
import type { ImportedMetricSnapshot } from "@/lib/import-parser";
import { buildImportedDiagnosis, buildImportedWeeklyReport } from "@/lib/import-insights";
import { readServerAiSettings } from "@/lib/server-ai-settings";

type AiInsightsResponse = {
  diagnosis: DiagnosisBlock[];
  report: WeeklyReport;
  source: "ai" | "local";
};

function localResponse(snapshot: ImportedMetricSnapshot): AiInsightsResponse {
  return {
    diagnosis: buildImportedDiagnosis(snapshot),
    report: buildImportedWeeklyReport(snapshot),
    source: "local",
  };
}

function parseJsonObject(text: string) {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain JSON.");
  }

  return JSON.parse(trimmed.slice(start, end + 1)) as AiInsightsResponse;
}

function isValidInsights(value: AiInsightsResponse) {
  return (
    Array.isArray(value.diagnosis) &&
    value.diagnosis.length > 0 &&
    Array.isArray(value.report?.result) &&
    Array.isArray(value.report?.problems) &&
    Array.isArray(value.report?.opportunities) &&
    Array.isArray(value.report?.nextActions)
  );
}

export async function POST(request: NextRequest) {
  const session = decodeSessionCookie(
    request.cookies.get(sessionCookieName)?.value,
  );

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    snapshot?: ImportedMetricSnapshot;
  };
  const snapshot = body.snapshot;
  const settings = await readServerAiSettings();
  const apiKey = settings.apiKey;
  const baseUrl = settings.baseUrl;
  const model = settings.model;

  if (!snapshot?.summary) {
    return NextResponse.json({ error: "Missing snapshot" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json(localResponse(snapshot));
  }

  const prompt = [
    "你是小商家的经营数据分析助手。",
    "请基于用户上传后的聚合指标，生成老板能看懂的 AI 诊断和周报。",
    "不要编造未提供的具体商品、客户或渠道。",
    "输出必须是 JSON，不要 Markdown，不要代码块。",
    "JSON 结构：",
    `{
      "diagnosis": [
        { "title": "内容表现", "finding": "...", "evidence": "...", "action": "..." }
      ],
      "report": {
        "result": ["..."],
        "problems": ["..."],
        "opportunities": ["..."],
        "nextActions": ["..."]
      }
    }`,
    "每个数组保留 2 到 4 条，中文表达要直接、克制、可执行。",
    `聚合数据：${JSON.stringify(snapshot)}`,
  ].join("\n");

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "你只输出符合要求的 JSON。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1400,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(localResponse(snapshot));
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseJsonObject(content);

    if (!isValidInsights(parsed)) {
      return NextResponse.json(localResponse(snapshot));
    }

    return NextResponse.json({ ...parsed, source: "ai" });
  } catch {
    return NextResponse.json(localResponse(snapshot));
  }
}
