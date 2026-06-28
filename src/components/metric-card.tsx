type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "good" | "warn";
  meta?: string;
};

export function MetricCard({
  label,
  value,
  helper,
  meta,
  tone = "default",
}: MetricCardProps) {
  const toneClass =
    tone === "good"
      ? "border-teal-100 bg-teal-50/50"
      : tone === "warn"
        ? "border-amber-100 bg-amber-50/50"
        : "border-slate-200 bg-white";

  return (
    <div className={`rounded-lg border p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {meta ? (
          <span className="rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-500">
            {meta}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{helper}</p>
    </div>
  );
}
