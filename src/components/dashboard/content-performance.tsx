import { formatNumber } from "@/lib/format";
import type { ContentItem } from "@/lib/types";

type ContentPerformanceProps = {
  items: ContentItem[];
};

export function ContentPerformance({ items }: ContentPerformanceProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <table className="min-w-[640px] divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              内容
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              浏览
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              互动
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              转化提示
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.title} className="hover:bg-slate-50/70">
              <td className="px-4 py-4">
                <p className="text-base font-medium text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.platform}</p>
              </td>
              <td className="px-4 py-4 text-base font-medium text-slate-800">
                {formatNumber(item.views)}
              </td>
              <td className="px-4 py-4 text-base text-slate-700">
                {formatNumber(item.likes + item.saves + item.comments)}
              </td>
              <td className="px-4 py-4 text-base text-slate-600">
                {item.conversionHint}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
