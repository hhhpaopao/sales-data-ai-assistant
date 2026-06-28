import type { DiagnosisBlock, WeeklyReport } from "./types";
import type { ImportedMetricSnapshot } from "./import-parser";
import { formatCurrency, formatNumber } from "./format";

export function buildImportedDiagnosis(
  snapshot: ImportedMetricSnapshot,
): DiagnosisBlock[] {
  if (snapshot.summary.content) {
    const content = snapshot.summary.content;
    const interactions = content.likes + content.saves + content.comments;
    const leadRate = content.impressions
      ? (content.leads / content.impressions) * 100
      : 0;

    return [
      {
        title: "内容表现",
        finding: "本次导入的内容数据已能看出曝光、互动和线索的基础关系。",
        evidence: `共 ${formatNumber(content.impressions)} 次曝光，产生 ${formatNumber(interactions)} 次互动和 ${formatNumber(content.leads)} 条线索。`,
        action: "优先复盘带来线索的内容，把标题、封面和评论区问题整理成下周选题。",
      },
      {
        title: "线索转化",
        finding:
          leadRate >= 1
            ? "当前内容到线索的转化有继续放大的空间。"
            : "当前内容曝光较多，但线索承接还需要加强。",
        evidence: `本次导入估算线索率约 ${leadRate.toFixed(1)}%。`,
        action: "给高曝光内容补充明确的咨询入口，例如套餐图、价格区间和私信关键词。",
      },
    ];
  }

  if (snapshot.summary.sales) {
    const sales = snapshot.summary.sales;
    const topChannel = sales.channels[0];

    return [
      {
        title: "产品转化",
        finding: "本次订单数据已汇总出销售额、订单数和客单价。",
        evidence: `${formatNumber(sales.orders)} 单贡献 ${formatCurrency(sales.revenue)}，客单价约 ${formatCurrency(sales.averageOrderValue)}。`,
        action: "先检查高客单订单来自哪些商品和渠道，把对应商品放到内容承接页第一屏。",
      },
      {
        title: "渠道表现",
        finding: topChannel
          ? `${topChannel.name} 是本次导入中订单最多的渠道。`
          : "本次导入缺少渠道字段，暂时无法判断渠道贡献。",
        evidence: topChannel
          ? `${topChannel.name} 贡献 ${topChannel.value} 单。`
          : "建议在下次订单表中保留渠道或平台字段。",
        action: "下周优先加大高订单渠道的内容和商品承接，同时补齐渠道字段。",
      },
    ];
  }

  const leads = snapshot.summary.leads;
  const topSource = leads?.sources[0];
  const topIntent = leads?.intents[0];
  const topStatus = leads?.statuses[0];

  return [
    {
      title: "客户跟进优先级",
      finding: topIntent
        ? `${topIntent.name} 是本次导入中最多的意向等级。`
        : "本次线索表可以用于梳理来源、意向和跟进状态。",
      evidence: topIntent
        ? `${topIntent.name} 共 ${topIntent.value} 条。`
        : `共导入 ${snapshot.rowCount} 条线索。`,
      action: "今天先处理高意向和已留下明确需求的线索，避免热度下降。",
    },
    {
      title: "线索来源",
      finding: topSource
        ? `${topSource.name} 是当前最主要的线索来源。`
        : "本次导入缺少来源字段，后续需要补齐。",
      evidence: topSource
        ? `${topSource.name} 贡献 ${topSource.value} 条线索。`
        : topStatus
          ? `当前最多的跟进状态是 ${topStatus.name}。`
          : "来源、意向或跟进状态字段不足。",
      action: "把主要来源拆成可复用的话术和素材，并记录每次跟进后的状态变化。",
    },
  ];
}

export function buildImportedWeeklyReport(
  snapshot: ImportedMetricSnapshot,
): WeeklyReport {
  if (snapshot.summary.content) {
    const content = snapshot.summary.content;

    return {
      result: [
        `本次导入 ${snapshot.rowCount} 条内容数据。`,
        `累计曝光 ${formatNumber(content.impressions)}，点赞 ${formatNumber(content.likes)}，收藏 ${formatNumber(content.saves)}。`,
        `内容带来 ${formatNumber(content.leads)} 条线索。`,
      ],
      problems: [
        content.leads > 0
          ? "已有内容能带来线索，但需要进一步确认线索来自哪些具体选题。"
          : "内容已有曝光和互动，但暂未看到明确线索。",
        "当前本地版只做基础汇总，尚未按单条内容拆解转化。",
      ],
      opportunities: [
        "高收藏内容适合整理成套餐图、报价单或私信回复素材。",
        "评论和收藏可以作为下周选题池的优先依据。",
      ],
      nextActions: [
        "筛选曝光和收藏最高的 3 条内容，补充明确咨询入口。",
        "把评论区问题整理成 3 个下周选题。",
        "下次导入时保留内容标题、发布时间和线索字段，方便进一步诊断。",
      ],
    };
  }

  if (snapshot.summary.sales) {
    const sales = snapshot.summary.sales;
    const topChannel = sales.channels[0]?.name ?? "未填写渠道";

    return {
      result: [
        `本次导入 ${snapshot.rowCount} 条销售数据。`,
        `销售额 ${formatCurrency(sales.revenue)}，订单 ${formatNumber(sales.orders)} 单。`,
        `客单价约 ${formatCurrency(sales.averageOrderValue)}，主要渠道为 ${topChannel}。`,
      ],
      problems: [
        "当前只汇总了订单和渠道，还没有拆到商品级复购与毛利。",
        "如果订单表缺少渠道或商品字段，后续会影响归因判断。",
      ],
      opportunities: [
        "高订单渠道适合优先投放内容和优惠承接。",
        "客单价可以作为判断套餐升级空间的第一指标。",
      ],
      nextActions: [
        "查看主要渠道的 Top 商品，补充到内容和私信承接页。",
        "把低客单订单归类，判断是否需要做组合装或满减。",
        "下次导入时保留商品、渠道、实付金额和订单时间字段。",
      ],
    };
  }

  const leads = snapshot.summary.leads;
  const topSource = leads?.sources[0]?.name ?? "未填写来源";
  const topIntent = leads?.intents[0]?.name ?? "未填写意向";
  const topStatus = leads?.statuses[0]?.name ?? "未填写状态";

  return {
    result: [
      `本次导入 ${snapshot.rowCount} 条线索数据。`,
      `主要来源是 ${topSource}，主要意向等级是 ${topIntent}。`,
      `当前最多的跟进状态是 ${topStatus}。`,
    ],
    problems: [
      "线索需要按意向和跟进状态分层，否则容易漏掉快成交客户。",
      "本地版暂未记录每次跟进时间，后续接数据库后可补齐。",
    ],
    opportunities: [
      "高意向线索可以当天集中处理，提高成交概率。",
      "主要来源可以反推最值得继续投入的内容渠道。",
    ],
    nextActions: [
      "先联系高意向且未完成跟进的客户。",
      "把主要来源对应的话术整理成固定回复模板。",
      "下次导入时保留客户需求、最近跟进时间和成交状态。",
    ],
  };
}
