import { RiskScorecard } from "../types";
import { formatCurrency, formatNumber, formatPercent } from "../lib/format";

type RiskScorecardsProps = {
  scorecard: RiskScorecard;
};

const RiskScorecards = ({ scorecard }: RiskScorecardsProps) => {
  const cards = [
    {
      label: "Weighted LLTV",
      value: formatPercent(scorecard.weightedLltv, 2),
    },
    {
      label: "Pool Loan-to-Value",
      value: formatPercent(scorecard.weightedBorrowLtv, 2),
    },
    {
      label: "LLTV Headroom",
      value: formatPercent(scorecard.lltvHeadroom, 2),
    },
    {
      label: "Collateral Coverage",
      value: formatPercent(scorecard.collateralCoverageRatio, 2),
    },
    {
      label: "Liquidity Coverage",
      value: formatPercent(scorecard.liquidityCoverage, 2),
    },
    {
      label: "Top Market Concentration",
      value: formatPercent(scorecard.topMarketConcentration, 2),
    },
    {
      label: "Concentration HHI",
      value: scorecard.concentrationHhi.toFixed(3),
    },
    {
      label: "Near-Liquidation Borrow",
      value: formatCurrency(scorecard.nearLiquidationBorrowUsd, true),
    },
    {
      label: "Stress 15% At Risk",
      value: formatCurrency(scorecard.stressCollateralAtRisk15PctUsd, true),
    },
    {
      label: "Total Borrow",
      value: formatCurrency(scorecard.totalBorrowUsd, true),
    },
    {
      label: "Total Collateral",
      value: formatCurrency(scorecard.totalCollateralUsd, true),
    },
    {
      label: "Active Borrowers",
      value: formatNumber(scorecard.activeBorrowers),
    },
    {
      label: "Active Loans",
      value: formatNumber(scorecard.activePositions),
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
            <p className="text-xs uppercase tracking-[0.09em] text-[var(--app-text-dim)]">
              {card.label}
            </p>
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
