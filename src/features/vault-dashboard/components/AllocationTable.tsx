import { formatCurrency, formatPercent } from "../lib/format";
import { VaultAllocationRow } from "../types";

type AllocationTableProps = {
  rows: VaultAllocationRow[];
};

const AllocationTable = ({ rows }: AllocationTableProps) => {
  return (
    <div className="rounded-xl border border-[var(--app-panel-border)] bg-[var(--app-panel)] p-4">
      <h3 className="mb-4 text-base font-semibold text-[var(--app-text)]">
        Market Allocations
      </h3>
      <p className="mb-4 text-xs text-[var(--app-text-dim)]">
        Allocation and liquidity profile across underlying lending markets.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm tabular-nums">
          <thead>
            <tr className="border-b border-[var(--app-panel-border)] text-xs uppercase tracking-[0.08em] text-[var(--app-text-dim)]">
              <th className="px-3 py-3 font-semibold">Collateral Type</th>
              <th className="px-3 py-3 text-right font-semibold">Allocation %</th>
              <th className="px-3 py-3 text-right font-semibold">Vault Supply</th>
              <th className="px-3 py-3 text-right font-semibold">Liquidation LTV</th>
              <th className="px-3 py-3 text-right font-semibold">Net APY</th>
              <th className="px-3 py-3 text-right font-semibold">Market Liquidity</th>
              <th className="px-3 py-3 text-right font-semibold">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.marketKey}
                className="border-b border-[rgba(157,176,204,0.12)] text-[var(--app-text)] even:bg-[rgba(255,255,255,0.01)]"
              >
                <td className="px-3 py-3">
                  <div className="font-medium">
                    {row.collateralSymbol}/{row.loanSymbol}
                  </div>
                </td>
                <td className="px-3 py-3 text-right">{formatPercent(row.allocationPct, 2)}</td>
                <td className="px-3 py-3 text-right">
                  {formatCurrency(row.allocationUsd, true)}
                </td>
                <td className="px-3 py-3 text-right">{formatPercent(row.lltv, 2)}</td>
                <td className="px-3 py-3 text-right">
                  {formatPercent(row.marketNetApy, 2)}
                </td>
                <td className="px-3 py-3 text-right">
                  {formatCurrency(row.marketLiquidityUsd, true)}
                </td>
                <td className="px-3 py-3 text-right">
                  {formatPercent(row.marketUtilization, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllocationTable;
