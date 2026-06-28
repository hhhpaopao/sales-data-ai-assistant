import type { LeadItem } from "@/lib/types";
import { StatusBadge } from "../status-badge";

type LeadPriorityTableProps = {
  leads: LeadItem[];
};

export function LeadPriorityTable({ leads }: LeadPriorityTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <table className="min-w-[640px] divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              客户
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              来源
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              意向
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              优先级
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map((lead) => (
            <tr key={`${lead.name}-${lead.intent}`} className="hover:bg-slate-50/70">
              <td className="px-4 py-4">
                <p className="text-base font-medium text-slate-950">{lead.name}</p>
                <p className="mt-1 text-sm text-slate-500">{lead.lastAction}</p>
              </td>
              <td className="px-4 py-4 text-base text-slate-700">{lead.source}</td>
              <td className="px-4 py-4 text-base text-slate-700">{lead.intent}</td>
              <td className="px-4 py-4">
                <StatusBadge status={lead.priority} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
