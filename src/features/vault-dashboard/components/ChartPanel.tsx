import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

type ChartDataset = {
  label: string;
  data: Array<number | null>;
  borderColor: string;
  backgroundColor: string;
};

type ChartValueFormat = "plain" | "percent" | "compactNumber" | "compactCurrency";

type ChartPanelProps = {
  title: string;
  labels: string[];
  datasets: ChartDataset[];
  subtitle?: string;
  yAxisSuffix?: string;
  yAxisPrefix?: string;
  valueFormat?: ChartValueFormat;
  precision?: number;
};

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

function formatChartValue({
  value,
  format,
  prefix,
  suffix,
  precision,
}: {
  value: number;
  format: ChartValueFormat;
  prefix: string;
  suffix: string;
  precision: number;
}): string {
  if (format === "percent") {
    return `${value.toFixed(precision)}%`;
  }

  if (format === "compactCurrency") {
    return compactCurrencyFormatter.format(value);
  }

  if (format === "compactNumber") {
    return `${prefix}${compactNumberFormatter.format(value)}${suffix}`;
  }

  return `${prefix}${value.toLocaleString("en-US", {
    maximumFractionDigits: precision,
  })}${suffix}`;
}

const ChartPanel = ({
  title,
  labels,
  datasets,
  subtitle,
  yAxisSuffix = "",
  yAxisPrefix = "",
  valueFormat = "plain",
  precision = 2,
}: ChartPanelProps) => {
  if (labels.length === 0 || datasets.every((dataset) => dataset.data.length === 0)) {
    return (
      <div className="rounded-xl border border-[var(--app-panel-border)] bg-[var(--app-panel)] p-4">
        <h3 className="text-base font-semibold text-[var(--app-text)]">{title}</h3>
        <p className="mt-5 text-sm text-[var(--app-text-dim)]">No data in this window.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--app-panel-border)] bg-[var(--app-panel)] p-4">
      <h3 className="text-base font-semibold text-[var(--app-text)]">{title}</h3>
      {subtitle ? (
        <p className="mt-1 text-xs text-[var(--app-text-dim)]">{subtitle}</p>
      ) : null}
      <div className="mt-4 h-72">
        <Line
          data={{
            labels,
            datasets: datasets.map((dataset) => ({
              label: dataset.label,
              data: dataset.data,
              borderColor: dataset.borderColor,
              backgroundColor: dataset.backgroundColor,
              borderWidth: 2,
              pointRadius: 0,
              fill: true,
              tension: 0.3,
            })),
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false,
            },
            plugins: {
              legend: {
                labels: {
                  color: "#c8d5eb",
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.parsed.y;
                    if (value === null || value === undefined) {
                      return `${context.dataset.label}: N/A`;
                    }
                    return `${context.dataset.label}: ${formatChartValue({
                      value,
                      format: valueFormat,
                      prefix: yAxisPrefix,
                      suffix: yAxisSuffix,
                      precision,
                    })}`;
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: "#8ea3c2",
                  maxTicksLimit: 8,
                },
                grid: {
                  color: "rgba(157,176,204,0.12)",
                },
              },
              y: {
                ticks: {
                  color: "#8ea3c2",
                  callback: (value) =>
                    formatChartValue({
                      value: Number(value),
                      format: valueFormat,
                      prefix: yAxisPrefix,
                      suffix: yAxisSuffix,
                      precision,
                    }),
                },
                grid: {
                  color: "rgba(157,176,204,0.12)",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default ChartPanel;
