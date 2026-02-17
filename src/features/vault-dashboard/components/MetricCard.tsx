type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
};

const MetricCard = ({ label, value, hint }: MetricCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--app-panel-border)] bg-[var(--app-panel)] p-4 shadow-[0_8px_26px_rgba(2,6,18,0.35)]">
      <div className="pointer-events-none absolute left-0 top-0 h-[2px] w-full bg-[linear-gradient(90deg,rgba(53,194,255,0.7),rgba(53,194,255,0))]" />
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--app-text-dim)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-text)] tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-[var(--app-text-dim)]">{hint}</p> : null}
    </div>
  );
};

export default MetricCard;
