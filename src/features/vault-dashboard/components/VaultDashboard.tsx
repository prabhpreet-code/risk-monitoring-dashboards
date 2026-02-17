import AllocationTable from "./AllocationTable";
import ChartPanel from "./ChartPanel";
import LiquidationPanel from "./LiquidationPanel";
import MetricCard from "./MetricCard";
import RangeSelector from "./RangeSelector";
import RiskBucketsTable from "./RiskBucketsTable";
import OracleRiskPanel from "./OracleRiskPanel";
import RiskScorecards from "./RiskScorecards";
import { useVaultDashboard } from "../context/VaultDashboardContext";
import {
  formatAddress,
  formatCurrency,
  formatPercent,
  formatTimestamp,
} from "../lib/format";
import {
  buildVaultRiskReportCsv,
  buildVaultRiskReportHtml,
  getDisplayVaultName,
} from "../lib/report";

const CHART_COLORS = [
  { line: "#39c8ff", fill: "rgba(57,200,255,0.16)" },
  { line: "#2fe6a6", fill: "rgba(47,230,166,0.16)" },
  { line: "#f2b04e", fill: "rgba(242,176,78,0.16)" },
  { line: "#8c9cff", fill: "rgba(140,156,255,0.16)" },
];

const VaultDashboard = () => {
  const { data, loading, error, range, setRange, vaultAddress } =
    useVaultDashboard();

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-[var(--app-panel-border)] bg-[var(--app-panel)] p-6">
        <p className="text-sm text-[var(--app-text-dim)]">
          Loading institutional risk data...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-red-600/40 bg-[var(--app-panel)] p-6">
        <p className="text-sm text-red-300">
          Unable to load vault analytics. {error ? `Reason: ${error}` : ""}
        </p>
      </div>
    );
  }

  const performanceLabels = data.performanceSeries.map((point) =>
    formatTimestamp(point.x, range === "ALL")
  );
  const apyLabels = data.netApySeries.map((point) =>
    formatTimestamp(point.x, range === "ALL")
  );
  const supplyLabels = data.supplySeries.map((point) =>
    formatTimestamp(point.x, range === "ALL")
  );
  const utilizationLabels = data.utilizationSeries.map((point) =>
    formatTimestamp(point.x, range === "ALL")
  );

  const collateralLabels =
    data.collateralAtRisk[0]?.points.map(
      (point) => `${Math.round(point.collateralPriceRatio * 100)}%`
    ) ?? [];
  const displayVaultName = getDisplayVaultName(data.snapshot.name);

  const handleExportCsv = () => {
    const csv = buildVaultRiskReportCsv(data);
    const fileDate = new Date(data.snapshot.asOfTimestamp * 1000)
      .toISOString()
      .slice(0, 10);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `prime-credit-risk-report-${fileDate}.csv`;
    anchor.click();
    window.URL.revokeObjectURL(objectUrl);
  };

  const handleExportPdf = () => {
    const html = buildVaultRiskReportHtml(data);
    const popup = window.open("", "_blank", "width=1200,height=900");

    if (!popup) {
      return;
    }

    popup.document.open();
    popup.document.write(html);
    popup.document.close();

    let didPrint = false;
    const printOnce = () => {
      if (didPrint || popup.closed) {
        return;
      }
      didPrint = true;
      popup.focus();
      popup.print();
    };

    popup.onload = printOnce;
    window.setTimeout(printOnce, 600);
  };

  const actionButtonClassName =
    "rounded-md border border-[var(--app-panel-border)] bg-[#0e1523] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--app-text)] transition hover:border-[var(--app-accent)] hover:text-[var(--app-accent)]";

  const reportButtonClassName =
    "rounded-md border border-[rgba(122,178,255,0.45)] bg-[linear-gradient(120deg,#12356f,#1a4f9c)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#f0f6ff] transition hover:border-[#9accff] hover:text-white";

  const fileDate = new Date(data.snapshot.asOfTimestamp * 1000)
    .toISOString()
    .slice(0, 10);

  const handleDownloadDeckHtml = () => {
    const html = buildVaultRiskReportHtml(data);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `prime-credit-risk-report-${fileDate}.html`;
    anchor.click();
    window.URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 lg:px-6">
      <section className="rounded-xl border border-[var(--app-panel-border)] bg-[var(--app-panel)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--app-text-dim)]">
              Institutional Credit Risk Dashboard
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[var(--app-text)]">
              {displayVaultName}
            </h2>
            <p className="mt-1 text-sm text-[var(--app-text-dim)]">
              Cross-market vault monitoring with committee-ready risk diagnostics.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--app-text-dim)]">
              <span className="rounded-md border border-[var(--app-panel-border)] bg-[#0e1523] px-2 py-1">
                {data.snapshot.chainNetwork.toUpperCase()}
              </span>
              <a
                href={`https://etherscan.io/address/${vaultAddress}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[var(--app-panel-border)] bg-[#0e1523] px-2 py-1 hover:text-[var(--app-text)]"
              >
                {formatAddress(vaultAddress)}
              </a>
              <span className="rounded-md border border-[var(--app-panel-border)] bg-[#0e1523] px-2 py-1">
                As of {formatTimestamp(data.snapshot.asOfTimestamp, true)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--app-text-dim)]">
              <span className="rounded-md border border-[var(--app-panel-border)] bg-[#0e1523] px-2 py-1">
                Data Source: Morpho API
              </span>
              <span className="rounded-md border border-[var(--app-panel-border)] bg-[#0e1523] px-2 py-1">
                Scope: Read-only, share-adjusted risk model
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <RangeSelector selectedRange={range} onChange={setRange} />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportPdf}
                className={reportButtonClassName}
              >
                Export PDF
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className={actionButtonClassName}
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={handleDownloadDeckHtml}
                className={actionButtonClassName}
              >
                Download Deck HTML
              </button>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="rounded-xl border border-[var(--app-panel-border)] bg-[rgba(53,194,255,0.08)] p-3 text-sm text-[var(--app-text-dim)]">
          Refreshing live market and risk series...
        </section>
      ) : null}

      {error ? (
        <section className="rounded-xl border border-yellow-600/40 bg-[rgba(239,167,58,0.08)] p-4 text-sm text-yellow-200">
          Live refresh warning: {error}
        </section>
      ) : null}

      <section className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-text-dim)]">
            Executive Snapshot
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Supply"
            value={formatCurrency(data.snapshot.totalAssetsUsd, true)}
            hint="Current assets supplied to the vault."
          />
          <MetricCard
            label="Net APY"
            value={formatPercent(data.snapshot.netApy, 2)}
            hint="Current annualized net supplier return."
          />
          <MetricCard
            label="Performance Fee"
            value={formatPercent(data.snapshot.performanceFee, 2)}
            hint="Manager fee share applied to strategy returns."
          />
          <MetricCard
            label="Liquidity"
            value={formatCurrency(data.snapshot.liquidityUsd, true)}
            hint="Available withdrawal capacity."
          />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-text-dim)]">
            Trend Monitoring
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartPanel
            title="Performance (Growth of 1,000 units)"
            subtitle="Indexed vault growth from selected range baseline."
            labels={performanceLabels}
            valueFormat="plain"
            precision={1}
            datasets={[
              {
                label: "Vault Performance",
                data: data.performanceSeries.map((point) => point.y),
                borderColor: CHART_COLORS[0].line,
                backgroundColor: CHART_COLORS[0].fill,
              },
            ]}
          />
          <ChartPanel
            title="Net APY"
            subtitle="Annualized net return trend for suppliers."
            labels={apyLabels}
            valueFormat="percent"
            precision={2}
            datasets={[
              {
                label: "Net APY",
                data: data.netApySeries.map((point) =>
                  point.y === null ? null : point.y * 100
                ),
                borderColor: CHART_COLORS[1].line,
                backgroundColor: CHART_COLORS[1].fill,
              },
            ]}
          />
          <ChartPanel
            title="Allocation-Weighted Market Utilization"
            subtitle="Market utilization weighted by vault allocation share."
            labels={utilizationLabels}
            valueFormat="percent"
            precision={2}
            datasets={[
              {
                label: "Allocation-Weighted Utilization",
                data: data.utilizationSeries.map((point) =>
                  point.y === null ? null : point.y * 100
                ),
                borderColor: CHART_COLORS[2].line,
                backgroundColor: CHART_COLORS[2].fill,
              },
            ]}
          />
          <ChartPanel
            title="Supply Over Time"
            subtitle="Vault total assets over the selected period."
            labels={supplyLabels}
            valueFormat="compactCurrency"
            datasets={[
              {
                label: "Vault Supply (USD)",
                data: data.supplySeries.map((point) => point.y),
                borderColor: CHART_COLORS[3].line,
                backgroundColor: CHART_COLORS[3].fill,
              },
            ]}
          />
        </div>
      </section>

      <section>
        <ChartPanel
          title="Collateral at Risk"
          subtitle="Estimated collateral exposed by collateral price stress scenario."
          labels={collateralLabels}
          valueFormat="compactCurrency"
          datasets={data.collateralAtRisk.map((series, index) => {
            const palette = CHART_COLORS[index % CHART_COLORS.length];
            return {
              label: series.label,
              data: series.points.map((point) => point.collateralUsd),
              borderColor: palette.line,
              backgroundColor: palette.fill,
            };
          })}
        />
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-text-dim)]">
            Exposure Breakdown
          </p>
        </div>
        <AllocationTable rows={data.allocations} />
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-text-dim)]">
            Risk Diagnostics
          </p>
        </div>
        <RiskScorecards scorecard={data.risk.scorecard} />
        <OracleRiskPanel oracleRisk={data.risk.oracle} />
      </section>

      <section>
        <RiskBucketsTable buckets={data.risk.healthBuckets} />
      </section>

      <section>
        <LiquidationPanel
          summary30d={data.risk.liquidationSummary30d}
          summary90d={data.risk.liquidationSummary90d}
          incidents={data.risk.recentLiquidations}
        />
      </section>

      <section className="rounded-xl border border-[var(--app-panel-border)] bg-[var(--app-panel)] p-4">
        <h3 className="mb-3 text-base font-semibold text-[var(--app-text)]">
          Methodology Notes
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--app-text-dim)]">
          {data.risk.methodologyNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default VaultDashboard;
