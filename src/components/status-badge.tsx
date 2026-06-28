import { clsx } from "clsx";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold",
        status.includes("完成") &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        status.includes("可用") &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        status.includes("等待") &&
          "border-amber-200 bg-amber-50 text-amber-700",
        status.includes("建议") &&
          "border-blue-200 bg-blue-50 text-blue-700",
        status.includes("停用") &&
          "border-slate-200 bg-slate-100 text-slate-600",
        status.includes("高") && "border-red-200 bg-red-50 text-red-700",
        status.includes("中") && "border-amber-200 bg-amber-50 text-amber-700",
        status.includes("低") && "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      {status}
    </span>
  );
}
