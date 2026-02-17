import { RiskHealthBucket } from "../types";
import { formatCurrency, formatPercent } from "../lib/format";

type RiskBucketsTableProps = {
  buckets: RiskHealthBucket[];
};

const RiskBucketsTable = ({ buckets }: RiskBucketsTableProps) => {
  return (
    <section className="rounded-xl border border-[var(--app-panel-border)] bg-[var(--app-panel)] p-4">
      <h3 className="mb-4 text-base font-semibold text-[var(--app-text)]">
        Borrower Health Distribution
      </h3>
      <p className="mb-4 text-xs text-[var(--app-text-dim)]">
        Aggregated by borrower with worst-position health factor assignment.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm tabular-nums">
          <thead>
            <tr className="border-b border-[var(--app-panel-border)] text-xs uppercase tracking-[0.08em] text-[var(--app-text-dim)]">
              <th className="px-3 py-3 font-semibold">Bucket</th>
              <th className="px-3 py-3 text-right font-semibold">Borrowers</th>
              <th className="px-3 py-3 text-right font-semibold">Borrow Exposure</th>
              <th className="px-3 py-3 text-right font-semibold">Share of Borrow</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((bucket) => (
              <tr
                key={bucket.label}
                className="border-b border-[rgba(157,176,204,0.12)] text-[var(--app-text)] even:bg-[rgba(255,255,255,0.01)]"
              >
                <td className="px-3 py-3">{bucket.label}</td>
                <td className="px-3 py-3 text-right">{bucket.borrowerCount}</td>
                <td className="px-3 py-3 text-right">
                  {formatCurrency(bucket.borrowUsd, true)}
                </td>
                <td className="px-3 py-3 text-right">
                  {formatPercent(bucket.shareOfBorrow, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RiskBucketsTable;
