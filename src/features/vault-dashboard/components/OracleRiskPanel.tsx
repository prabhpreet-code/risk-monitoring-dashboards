import {
  OracleRiskAnalysis,
  OracleRiskMarketRow,
} from "../types";
import { formatCurrency, formatNumber, formatPercent } from "../lib/format";
import InfoTooltip from "./InfoTooltip";

type OracleRiskPanelProps = {
  oracleRisk: OracleRiskAnalysis;
};

function formatHhi(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  return value.toFixed(3);
}

function formatWarningSummary(market: OracleRiskMarketRow): string {
  if (market.warningCount === 0) {
    return "None";
  }

  return `${market.warningCount} total (${market.redWarningCount} red / ${market.yellowWarningCount} yellow)`;
}

const OracleRiskPanel = ({ oracleRisk }: OracleRiskPanelProps) => {
  const cards = [
    {
      label: "Oracle Coverage",
      value: formatPercent(oracleRisk.scorecard.coveredAllocationPct, 2),
      info: "Share of active credit allocation with configured on-chain oracle metadata.",
    },
    {
      label: "Uncovered Allocation",
      value: formatCurrency(oracleRisk.scorecard.uncoveredAllocationUsd, true),
      info: "Active credit allocation without parsed oracle metadata.",
    },
    {
      label: "Oracle Contract HHI",
      value: formatHhi(oracleRisk.scorecard.oracleContractHhi),
      info: "Concentration index over oracle contract allocation shares: sum(share^2).",
    },
    {
      label: "Top Oracle Contract",
      value: formatPercent(
        oracleRisk.scorecard.topOracleContractConcentration,
        2
      ),
      info: "Largest single oracle contract share of oracle-covered allocation.",
    },
    {
      label: "Unique Oracle Contracts",
      value: formatNumber(oracleRisk.scorecard.uniqueOracleContracts),
      info: "Distinct oracle contracts referenced by current active markets.",
    },
    {
      label: "Feed Dependency HHI",
      value: formatHhi(oracleRisk.scorecard.feedDependencyHhi),
      info: "Concentration over normalized feed dependency exposure shares.",
    },
    {
      label: "Top Feed Dependency",
      value: formatPercent(
        oracleRisk.scorecard.topFeedDependencyConcentration,
        2
      ),
      info: "Largest feed dependency share after normalizing total feed exposure.",
    },
    {
      label: "Unique Feeds",
      value: formatNumber(oracleRisk.scorecard.uniqueFeeds),
      info: "Distinct feed addresses in the current oracle dependency graph.",
    },
    {
      label: "Warning Markets",
      value: formatNumber(oracleRisk.scorecard.warningMarkets),
      info: "Markets with at least one active oracle-related warning flag.",
    },
    {
      label: "Warning-Exposed Allocation",
      value: formatPercent(oracleRisk.scorecard.warningAllocationPct, 2),
      info: "Share of active allocation in markets with any warning.",
    },
    {
      label: "Severe Warning Allocation",
      value: formatPercent(oracleRisk.scorecard.severeWarningAllocationPct, 2),
      info: "Share of active allocation in markets with red-level warnings.",
    },
    {
      label: "Warning Count",
      value: `${formatNumber(oracleRisk.scorecard.warningCount)} (${formatNumber(
        oracleRisk.scorecard.redWarningCount
      )} red)`,
      info: "Total warning events across active markets with red/yellow split.",
    },
    {
      label: "Error Tolerance (Avg)",
      value: formatPercent(oracleRisk.scorecard.liquidationErrorToleranceAvg, 2),
      info: "Borrow-weighted average tolerance: 1 - (position LTV / market LLTV).",
    },
    {
      label: "Error Tolerance (P10)",
      value: formatPercent(oracleRisk.scorecard.liquidationErrorToleranceP10, 2),
      info: "Borrow-weighted 10th percentile of liquidation error tolerance.",
    },
    {
      label: "Low Tolerance Borrow (<=5%)",
      value: formatCurrency(oracleRisk.scorecard.lowToleranceBorrowUsd, true),
      info: "Scaled borrow with liquidation error tolerance at or below 5%.",
    },
    {
      label: "Breached Tolerance (<=0%)",
      value: formatCurrency(oracleRisk.scorecard.breachedToleranceBorrowUsd, true),
      info: "Scaled borrow where modeled LTV is already at or above LLTV.",
    },
  ];

  return (
    <section className="space-y-4 rounded-xl border border-[var(--app-panel-border)] bg-[var(--app-panel)] p-4">
      <div>
        <h3 className="text-base font-semibold text-[var(--app-text)]">
          Oracle Risk Monitoring
        </h3>
        <p className="mt-1 text-xs text-[var(--app-text-dim)]">
          Oracle coverage, dependency concentration, warning exposure, and liquidation-price error tolerance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-[rgba(157,176,204,0.18)] bg-[#0f1727] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.09em] text-[var(--app-text-dim)]">
                {card.label}
              </p>
              <InfoTooltip content={card.info} />
            </div>
            <p className="mt-2 text-lg font-semibold text-[var(--app-text)] tabular-nums">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[rgba(157,176,204,0.18)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#10192b]">
            <tr className="border-b border-[var(--app-panel-border)] text-xs uppercase tracking-[0.08em] text-[var(--app-text-dim)]">
              <th className="px-3 py-3 text-left font-medium">Market</th>
              <th className="px-3 py-3 text-right font-medium">Allocation</th>
              <th className="px-3 py-3 text-left font-medium">Oracle</th>
              <th className="px-3 py-3 text-right font-medium">Feeds</th>
              <th className="px-3 py-3 text-left font-medium">Warnings</th>
            </tr>
          </thead>
          <tbody>
            {oracleRisk.markets.map((market) => (
              <tr
                key={market.marketKey}
                className="border-b border-[rgba(157,176,204,0.12)] text-[var(--app-text)] even:bg-[rgba(255,255,255,0.01)]"
              >
                <td className="px-3 py-3">{market.marketLabel}</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {formatPercent(market.allocationPct, 2)}
                </td>
                <td className="px-3 py-3">
                  {market.hasOracle ? market.oracleType ?? "Configured" : "Missing"}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {formatNumber(market.feedCount)}
                </td>
                <td className="px-3 py-3">
                  {formatWarningSummary(market)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="list-disc space-y-2 pl-5 text-xs text-[var(--app-text-dim)]">
        {oracleRisk.methodologyNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  );
};

export default OracleRiskPanel;
