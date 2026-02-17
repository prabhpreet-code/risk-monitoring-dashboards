import { RiskScorecard } from "../types";
import { formatCurrency, formatNumber, formatPercent } from "../lib/format";
import InfoTooltip from "./InfoTooltip";

type RiskScorecardsProps = {
  scorecard: RiskScorecard;
};

const RiskScorecards = ({ scorecard }: RiskScorecardsProps) => {
  const cards = [
    {
      label: "Weighted LLTV",
      value: formatPercent(scorecard.weightedLltv, 2),
      info: "Sum(allocation_usd * market_lltv) / Sum(allocation_usd) for active non-idle markets.",
    },
    {
      label: "Pool Loan-to-Value",
      value: formatPercent(scorecard.weightedBorrowLtv, 2),
      info: "Total scaled borrower debt / total scaled borrower collateral across underlying markets.",
    },
    {
      label: "LLTV Headroom",
      value: formatPercent(scorecard.lltvHeadroom, 2),
      info: "Weighted LLTV minus Pool Loan-to-Value.",
    },
    {
      label: "Collateral Coverage",
      value: formatPercent(scorecard.collateralCoverageRatio, 2),
      info: "Total scaled collateral / total scaled borrow. Values above 100% indicate overcollateralization.",
    },
    {
      label: "Liquidity Coverage",
      value: formatPercent(scorecard.liquidityCoverage, 2),
      info: "Vault liquid assets / vault total assets.",
    },
    {
      label: "Top Market Concentration",
      value: formatPercent(scorecard.topMarketConcentration, 2),
      info: "Largest single market allocation share in the vault.",
    },
    {
      label: "Concentration HHI",
      value: scorecard.concentrationHhi.toFixed(3),
      info: "Herfindahl-Hirschman Index = Sum(allocation_share^2). Higher means more concentration.",
    },
    {
      label: "Near-Liquidation Borrow",
      value: formatCurrency(scorecard.nearLiquidationBorrowUsd, true),
      info: "Scaled borrow where health factor <= 1.10 or position LTV >= 90% of market LLTV.",
    },
    {
      label: "Stress 15% At Risk",
      value: formatCurrency(scorecard.stressCollateralAtRisk15PctUsd, true),
      info: "Interpolated collateral-at-risk at 85% collateral price ratio, scaled by vault share per market.",
    },
    {
      label: "Total Borrow",
      value: formatCurrency(scorecard.totalBorrowUsd, true),
      info: "Aggregate scaled borrower debt across all monitored markets.",
    },
    {
      label: "Total Collateral",
      value: formatCurrency(scorecard.totalCollateralUsd, true),
      info: "Aggregate scaled collateral backing monitored borrower debt.",
    },
    {
      label: "Active Borrowers",
      value: formatNumber(scorecard.activeBorrowers),
      info: "Unique borrowers with positive scaled debt in the latest snapshot.",
    },
    {
      label: "Active Loans",
      value: formatNumber(scorecard.activePositions),
      info: "Count of market positions with positive scaled debt in the latest snapshot.",
    },
  ];

  return (
    <section className="rounded-xl border border-[var(--app-panel-border)] bg-[var(--app-panel)] p-4">
      <h3 className="mb-4 text-base font-semibold text-[var(--app-text)]">
        Risk Scorecards
      </h3>
      <p className="mb-4 text-xs text-[var(--app-text-dim)]">
        Portfolio-level risk and concentration indicators from live vault and market state.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-[rgba(157,176,204,0.18)] bg-[#0f1727] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.09em] text-[var(--app-text-dim)]">
                {card.label}
              </p>
              {card.info ? <InfoTooltip content={card.info} /> : null}
            </div>
            <p className="mt-2 text-xl font-semibold text-[var(--app-text)] tabular-nums">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RiskScorecards;
