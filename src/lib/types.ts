export type TrendPoint = {
  date: string;
  views: number;
  sales: number;
  leads: number;
};

export type ContentItem = {
  title: string;
  platform: string;
  views: number;
  likes: number;
  saves: number;
  comments: number;
  conversionHint: string;
};

export type ProductItem = {
  name: string;
  revenue: number;
  orders: number;
  conversion: number;
};

export type LeadItem = {
  name: string;
  source: string;
  intent: string;
  lastAction: string;
  priority: "高" | "中" | "低";
};

export type DiagnosisBlock = {
  title: string;
  finding: string;
  evidence: string;
  action: string;
};

export type WeeklyReport = {
  result: string[];
  problems: string[];
  opportunities: string[];
  nextActions: string[];
};

export type Project = {
  id: string;
  name: string;
  channel: string;
  category: string;
  status: "已完成导入" | "等待导入" | "建议复盘";
  updatedAt: string;
  metrics: {
    revenue: number;
    orders: number;
    leads: number;
    engagementRate: number;
    contentCount: number;
    conversionRate: number;
  };
  trend: TrendPoint[];
  content: ContentItem[];
  products: ProductItem[];
  leads: LeadItem[];
  diagnosis: DiagnosisBlock[];
  report: WeeklyReport;
};
