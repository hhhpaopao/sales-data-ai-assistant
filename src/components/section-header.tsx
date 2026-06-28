type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
};

export function SectionHeader({
  title,
  description,
  action,
  eyebrow,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h2>
        {description ? <p className="mt-2 max-w-3xl text-base leading-7 text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
