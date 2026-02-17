import { RANGE_OPTIONS } from "../constants";
import { TimeRangeKey } from "../types";

type RangeSelectorProps = {
  selectedRange: TimeRangeKey;
  onChange: (range: TimeRangeKey) => void;
};

const RangeSelector = ({
  selectedRange,
  onChange,
}: RangeSelectorProps) => {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-[var(--app-panel-border)] bg-[#0f1727] p-1">
      {RANGE_OPTIONS.map((option) => {
        const isActive = selectedRange === option.key;
        return (
          <button
            type="button"
            key={option.key}
            onClick={() => onChange(option.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              isActive
                ? "bg-[rgba(53,194,255,0.2)] text-[var(--app-text)]"
                : "text-[var(--app-text-dim)] hover:bg-[rgba(53,194,255,0.08)] hover:text-[var(--app-text)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default RangeSelector;
