type InfoTooltipProps = {
  content: string;
  label?: string;
};

const InfoTooltip = ({ content, label = "Metric methodology" }: InfoTooltipProps) => {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(157,176,204,0.4)] text-[10px] font-semibold text-[var(--app-text-dim)] transition hover:border-[var(--app-accent)] hover:text-[var(--app-accent)] focus:border-[var(--app-accent)] focus:text-[var(--app-accent)] focus:outline-none"
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-5 z-30 hidden w-64 rounded-md border border-[rgba(157,176,204,0.3)] bg-[#0d1524] px-3 py-2 text-[11px] leading-relaxed text-[var(--app-text)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] group-hover:block group-focus-within:block"
      >
        {content}
      </span>
    </span>
  );
};

export default InfoTooltip;
