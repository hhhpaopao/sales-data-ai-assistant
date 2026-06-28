export type ImportDataType = "content" | "sales" | "leads";

export type ImportedMetricSnapshot = {
  id: string;
  fileName: string;
  dataType: ImportDataType;
  rowCount: number;
  importedAt: string;
  summary: {
    content?: {
      impressions: number;
      likes: number;
      saves: number;
      comments: number;
      leads: number;
    };
    sales?: {
      orders: number;
      revenue: number;
      averageOrderValue: number;
      channels: Array<{ name: string; value: number }>;
    };
    leads?: {
      sources: Array<{ name: string; value: number }>;
      intents: Array<{ name: string; value: number }>;
      statuses: Array<{ name: string; value: number }>;
    };
  };
};

export type TabularParseResult = {
  headers: string[];
  rows: Record<string, string>[];
};

const contentSignals = [
  "曝光",
  "浏览",
  "阅读",
  "播放",
  "点赞",
  "收藏",
  "评论",
  "线索",
  "标题",
];
const salesSignals = ["订单", "销售额", "金额", "支付", "客单价", "商品", "渠道"];
const leadSignals = ["线索", "来源", "意向", "跟进", "状态", "客户", "电话"];

function normaliseHeader(value: string) {
  return value.trim().toLowerCase();
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
      continue;
    }

    cell += char;
  }

  cells.push(cell.trim());
  return cells;
}

export function parseCsv(text: string): TabularParseResult {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] ?? "";
      return row;
    }, {});
  });

  return { headers, rows };
}

export async function parseExcel(buffer: ArrayBuffer): Promise<TabularParseResult> {
  const xlsx = await import("xlsx");
  const workbook = xlsx.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return { headers: [], rows: [] };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const matrix = xlsx.utils.sheet_to_json<Array<string | number | boolean | null>>(
    sheet,
    {
      header: 1,
      defval: "",
      blankrows: false,
    },
  );

  if (matrix.length < 2) {
    return { headers: [], rows: [] };
  }

  const headers = matrix[0].map((cell) => String(cell).trim()).filter(Boolean);
  const rows = matrix.slice(1).map((line) =>
    headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = String(line[index] ?? "").trim();
      return row;
    }, {}),
  );

  return { headers, rows };
}

function score(headers: string[], signals: string[]) {
  const text = headers.join(" ").toLowerCase();
  return signals.reduce(
    (total, signal) => total + (text.includes(signal.toLowerCase()) ? 1 : 0),
    0,
  );
}

export function detectDataType(headers: string[]): ImportDataType | "unknown" {
  const scores: Array<{ type: ImportDataType; value: number }> = [
    { type: "content", value: score(headers, contentSignals) },
    { type: "sales", value: score(headers, salesSignals) },
    { type: "leads", value: score(headers, leadSignals) },
  ];
  const sorted = scores.toSorted((a, b) => b.value - a.value);

  if (sorted[0].value === 0 || sorted[0].value === sorted[1].value) {
    return "unknown";
  }

  return sorted[0].type;
}

function findHeader(headers: string[], candidates: string[]) {
  return (
    headers.find((header) =>
      candidates.some((candidate) =>
        normaliseHeader(header).includes(normaliseHeader(candidate)),
      ),
    ) ?? ""
  );
}

function numberFrom(row: Record<string, string>, header: string) {
  if (!header) return 0;
  const raw = row[header] ?? "";
  const cleaned = raw.replace(/[^\d.-]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function textFrom(row: Record<string, string>, header: string, fallback: string) {
  if (!header) return fallback;
  return row[header]?.trim() || fallback;
}

function countBy(rows: Record<string, string>[], header: string) {
  const map = new Map<string, number>();

  rows.forEach((row) => {
    const value = textFrom(row, header, "未填写");
    map.set(value, (map.get(value) ?? 0) + 1);
  });

  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .toSorted((a, b) => b.value - a.value);
}

export function aggregateImport(
  fileName: string,
  parsed: TabularParseResult,
  dataType: ImportDataType,
): ImportedMetricSnapshot {
  const { headers, rows } = parsed;
  const importedAt = new Date().toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const base = {
    id: `${fileName}-${Date.now()}`,
    fileName,
    dataType,
    rowCount: rows.length,
    importedAt,
    summary: {},
  } satisfies ImportedMetricSnapshot;

  if (dataType === "content") {
    const impressions = findHeader(headers, ["曝光", "浏览", "阅读", "播放"]);
    const likes = findHeader(headers, ["点赞"]);
    const saves = findHeader(headers, ["收藏"]);
    const comments = findHeader(headers, ["评论"]);
    const leads = findHeader(headers, ["线索", "咨询", "私信"]);

    return {
      ...base,
      summary: {
        content: {
          impressions: rows.reduce((sum, row) => sum + numberFrom(row, impressions), 0),
          likes: rows.reduce((sum, row) => sum + numberFrom(row, likes), 0),
          saves: rows.reduce((sum, row) => sum + numberFrom(row, saves), 0),
          comments: rows.reduce((sum, row) => sum + numberFrom(row, comments), 0),
          leads: rows.reduce((sum, row) => sum + numberFrom(row, leads), 0),
        },
      },
    };
  }

  if (dataType === "sales") {
    const amount = findHeader(headers, ["销售额", "金额", "支付", "实付"]);
    const orderNo = findHeader(headers, ["订单号", "订单", "编号"]);
    const channel = findHeader(headers, ["渠道", "来源", "平台"]);
    const revenue = rows.reduce((sum, row) => sum + numberFrom(row, amount), 0);
    const orders = orderNo
      ? new Set(rows.map((row) => row[orderNo]).filter(Boolean)).size || rows.length
      : rows.length;

    return {
      ...base,
      summary: {
        sales: {
          orders,
          revenue,
          averageOrderValue: orders ? revenue / orders : 0,
          channels: countBy(rows, channel),
        },
      },
    };
  }

  const source = findHeader(headers, ["来源", "渠道", "平台"]);
  const intent = findHeader(headers, ["意向", "等级"]);
  const status = findHeader(headers, ["跟进", "状态"]);

  return {
    ...base,
    summary: {
      leads: {
        sources: countBy(rows, source),
        intents: countBy(rows, intent),
        statuses: countBy(rows, status),
      },
    },
  };
}
