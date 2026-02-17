import {
  LiquidationIncident,
  LiquidationSummary,
} from "../types";
import { formatAddress, formatCurrency, formatTimestamp } from "../lib/format";

type LiquidationPanelProps = {
  summary30d: LiquidationSummary;
  summary90d: LiquidationSummary;
  incidents: LiquidationIncident[];
};

const SummaryCard = ({
  title,
  summary,
}: {
  title: string;
  summary: LiquidationSummary;
}) => {
  return (
    <div className="rounded-lg border border-[rgba(157,176,204,0.18)] bg-[#0f1727] p-3">
      <p className="text-xs uppercase tracking-[0.1em] text-[var(--app-text-dim)]">
        {title}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-[var(--app-text)] tabular-nums">
        <p className="text-[var(--app-text-dim)]">Incidents</p>
        <p className="text-right">{summary.incidentCount}</p>
        <p className="text-[var(--app-text-dim)]">Bad Debt</p>
        <p className="text-right">{formatCurrency(summary.badDebtUsd, true)}</p>
        <p className="text-[var(--app-text-dim)]">Repaid</p>
        <p className="text-right">{formatCurrency(summary.repaidUsd, true)}</p>
        <p className="text-[var(--app-text-dim)]">Seized</p>
        <p className="text-right">{formatCurrency(summary.seizedUsd, true)}</p>
      </div>
    </div>
  );
};

const LiquidationPanel = ({
  summary30d,
  summary90d,
  incidents,
}: LiquidationPanelProps) => {
  return (
    <section className="rounded-xl border border-[var(--app-panel-border)] bg-[var(--app-panel)] p-4">
      <h3 className="mb-4 text-base font-semibold text-[var(--app-text)]">
        Liquidation Incidents
      </h3>
      <p className="mb-4 text-xs text-[var(--app-text-dim)]">
        Market liquidation events within monitored lookback windows.
      </p>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <SummaryCard title="Last 30 Days" summary={summary30d} />
        <SummaryCard title="Last 90 Days" summary={summary90d} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm tabular-nums">
          <thead>
            <tr className="border-b border-[var(--app-panel-border)] text-xs uppercase tracking-[0.08em] text-[var(--app-text-dim)]">
              <th className="px-3 py-3 font-semibold">Date</th>
              <th className="px-3 py-3 font-semibold">Market</th>
              <th className="px-3 py-3 text-right font-semibold">Repaid</th>
              <th className="px-3 py-3 text-right font-semibold">Seized</th>
              <th className="px-3 py-3 text-right font-semibold">Bad Debt</th>
              <th className="px-3 py-3 font-semibold">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-5 text-center text-[var(--app-text-dim)]"
                >
                  No liquidation incidents in the selected lookback.
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-b border-[rgba(157,176,204,0.12)] text-[var(--app-text)] even:bg-[rgba(255,255,255,0.01)]"
                >
                  <td className="px-3 py-3">
                    {formatTimestamp(incident.timestamp, true)}
                  </td>
                  <td className="px-3 py-3">{incident.marketLabel}</td>
                  <td className="px-3 py-3 text-right">
                    {formatCurrency(incident.repaidUsd, true)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatCurrency(incident.seizedUsd, true)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatCurrency(incident.badDebtUsd, true)}
                  </td>
                  <td className="px-3 py-3">
                    <a
                      href={`https://etherscan.io/tx/${incident.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--app-accent)] hover:underline"
                    >
                      {formatAddress(incident.hash, 8, 6)}
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default LiquidationPanel;
