import { VaultReadModel } from "../types";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatTimestamp,
} from "./format";

function toIsoDate(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeCsvCell(value: string | number): string {
  const raw = String(value);
  if (!/[",\n]/.test(raw)) {
    return raw;
  }
  return `"${raw.replace(/"/g, "\"\"")}"`;
}

export function getDisplayVaultName(rawName: string): string {
  const cleaned = rawName.replace(/\bgauntlet\b/gi, "").replace(/\s{2,}/g, " ").trim();
  return cleaned.length > 0 ? cleaned : "Prime Credit Vault";
}

type ChartPoint = {
  x: number;
  y: number;
};

type ChartValueKind = "currency" | "percent" | "index";

function toChartPoints(
  points: Array<{ x: number; y: number | null }>,
  transform?: (value: number) => number
): ChartPoint[] {
  return points
    .filter((point): point is { x: number; y: number } => point.y !== null)
    .map((point) => ({
      x: point.x,
      y: transform ? transform(point.y) : point.y,
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    .sort((a, b) => a.x - b.x);
}

function formatCompactNumber(value: number): string {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}b`;
  }
  if (absolute >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}m`;
  }
  if (absolute >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return value.toFixed(2);
}

function formatChartValue(value: number, kind: ChartValueKind): string {
  if (kind === "currency") {
    return formatCurrency(value);
  }
  if (kind === "percent") {
    return `${value.toFixed(2)}%`;
  }
  return value.toFixed(1);
}

function buildLineChartSvg({
  title,
  points,
  stroke,
  kind,
}: {
  title: string;
  points: ChartPoint[];
  stroke: string;
  kind: ChartValueKind;
}): string {
  if (points.length < 2) {
    return `<div class="chart-card"><h3>${escapeHtml(title)}</h3><p class="chart-empty">Not enough data in this range.</p></div>`;
  }

  const width = 440;
  const height = 200;
  const marginLeft = 44;
  const marginRight = 14;
  const marginTop = 16;
  const marginBottom = 30;
  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;

  const xMin = points[0].x;
  const xMax = points[points.length - 1].x;

  let yMin = Math.min(...points.map((point) => point.y));
  let yMax = Math.max(...points.map((point) => point.y));
  if (yMin === yMax) {
    const pad = Math.abs(yMin) * 0.05 || 1;
    yMin -= pad;
    yMax += pad;
  } else {
    const pad = (yMax - yMin) * 0.08;
    yMin -= pad;
    yMax += pad;
  }

  const xToPx = (x: number): number =>
    marginLeft + ((x - xMin) / (xMax - xMin || 1)) * plotWidth;
  const yToPx = (y: number): number =>
    marginTop + ((yMax - y) / (yMax - yMin || 1)) * plotHeight;

  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xToPx(point.x).toFixed(2)} ${yToPx(point.y).toFixed(2)}`)
    .join(" ");

  const areaData = `${pathData} L ${xToPx(points[points.length - 1].x).toFixed(2)} ${(marginTop + plotHeight).toFixed(2)} L ${xToPx(points[0].x).toFixed(2)} ${(marginTop + plotHeight).toFixed(2)} Z`;

  const ticks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const value = yMax - (yMax - yMin) * ratio;
    const y = marginTop + plotHeight * ratio;
    return { value, y };
  });

  const latest = points[points.length - 1].y;
  const earliest = points[0].y;
  const change = latest - earliest;
  const changeColor = change >= 0 ? "#1f8d57" : "#b84747";
  const changeLabel =
    kind === "percent"
      ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`
      : kind === "currency"
        ? `${change >= 0 ? "+" : "-"}${formatCompactNumber(Math.abs(change))}`
        : `${change >= 0 ? "+" : ""}${change.toFixed(2)}`;

  return `
    <div class="chart-card">
      <h3>${escapeHtml(title)}</h3>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}">
        <defs>
          <linearGradient id="fill-${escapeHtml(title).replace(/[^a-zA-Z0-9]/g, "")}" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="${stroke}" stop-opacity="0.28"></stop>
            <stop offset="100%" stop-color="${stroke}" stop-opacity="0.02"></stop>
          </linearGradient>
        </defs>
        <rect x="${marginLeft}" y="${marginTop}" width="${plotWidth}" height="${plotHeight}" fill="#f9fbff" stroke="#dbe5f5"></rect>
        ${ticks
          .map(
            (tick) => `
          <line x1="${marginLeft}" y1="${tick.y.toFixed(2)}" x2="${(marginLeft + plotWidth).toFixed(2)}" y2="${tick.y.toFixed(2)}" stroke="#e4ebf8" stroke-width="1"></line>
          <text x="${marginLeft - 6}" y="${(tick.y + 4).toFixed(2)}" text-anchor="end" font-size="10" fill="#61779f">${escapeHtml(
              kind === "currency" ? formatCompactNumber(tick.value) : tick.value.toFixed(2)
            )}</text>
        `
          )
          .join("")}
        <path d="${areaData}" fill="url(#fill-${escapeHtml(title).replace(/[^a-zA-Z0-9]/g, "")})"></path>
        <path d="${pathData}" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
      <p class="chart-foot">
        <span>Latest: <strong>${escapeHtml(formatChartValue(latest, kind))}</strong></span>
        <span style="color:${changeColor};">Change: ${escapeHtml(changeLabel)}</span>
      </p>
    </div>
  `;
}

function buildAllocationBarsSvg(data: VaultReadModel): string {
  const rows = data.allocations.slice(0, 6);
  if (rows.length === 0) {
    return `<div class="chart-card chart-wide"><h3>Allocation Mix</h3><p class="chart-empty">No allocation data.</p></div>`;
  }

  const width = 900;
  const rowHeight = 34;
  const height = 44 + rows.length * rowHeight;
  const left = 180;
  const right = 72;
  const top = 14;
  const barHeight = 14;
  const plotWidth = width - left - right;
  const maxValue = Math.max(...rows.map((row) => row.allocationPct), 0.0001);

  return `
    <div class="chart-card chart-wide">
      <h3>Allocation Mix</h3>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Allocation mix">
        ${rows
          .map((row, index) => {
            const y = top + index * rowHeight;
            const barWidth = (row.allocationPct / maxValue) * plotWidth;
            return `
              <text x="${left - 10}" y="${y + 11}" text-anchor="end" font-size="11" fill="#1f3763">${escapeHtml(
                `${row.collateralSymbol}/${row.loanSymbol}`
              )}</text>
              <rect x="${left}" y="${y}" width="${plotWidth}" height="${barHeight}" rx="4" fill="#e7eefb"></rect>
              <rect x="${left}" y="${y}" width="${barWidth.toFixed(2)}" height="${barHeight}" rx="4" fill="#2f79d7"></rect>
              <text x="${width - 8}" y="${y + 11}" text-anchor="end" font-size="11" fill="#3d5685">${escapeHtml(
                formatPercent(row.allocationPct, 2)
              )}</text>
            `;
          })
          .join("")}
      </svg>
    </div>
  `;
}

export function buildVaultRiskReportCsv(data: VaultReadModel): string {
  const displayVaultName = getDisplayVaultName(data.snapshot.name);
  const reportDate = toIsoDate(data.snapshot.asOfTimestamp);

  const lines: string[] = [];
  lines.push("section,metric,value");
  lines.push(`executive,report_date,${escapeCsvCell(reportDate)}`);
  lines.push(`executive,vault,${escapeCsvCell(displayVaultName)}`);
  lines.push(`executive,chain,${escapeCsvCell(data.snapshot.chainNetwork.toUpperCase())}`);
  lines.push(`executive,total_supply,${escapeCsvCell(formatCurrency(data.snapshot.totalAssetsUsd))}`);
  lines.push(`executive,net_apy,${escapeCsvCell(formatPercent(data.snapshot.netApy, 2))}`);
  lines.push(
    `executive,pool_loan_to_value,${escapeCsvCell(formatPercent(data.risk.scorecard.weightedBorrowLtv, 2))}`
  );
  lines.push(
    `executive,collateral_coverage_ratio,${escapeCsvCell(
      formatPercent(data.risk.scorecard.collateralCoverageRatio, 2)
    )}`
  );
  lines.push(
    `executive,liquidity_coverage,${escapeCsvCell(formatPercent(data.risk.scorecard.liquidityCoverage, 2))}`
  );
  lines.push(
    `executive,near_liquidation_borrow,${escapeCsvCell(
      formatCurrency(data.risk.scorecard.nearLiquidationBorrowUsd)
    )}`
  );
  lines.push(
    `executive,stress_15pct_collateral_at_risk,${escapeCsvCell(
      formatCurrency(data.risk.scorecard.stressCollateralAtRisk15PctUsd)
    )}`
  );
  lines.push(
    `executive,active_borrowers,${escapeCsvCell(formatNumber(data.risk.scorecard.activeBorrowers))}`
  );
  lines.push(
    `executive,active_loans,${escapeCsvCell(formatNumber(data.risk.scorecard.activePositions))}`
  );

  lines.push("");
  lines.push(
    "allocations,market,allocation_pct,vault_supply_usd,liquidation_ltv,net_apy,market_liquidity_usd,utilization"
  );
  data.allocations.forEach((row) => {
    lines.push(
      [
        "allocations",
        `${row.collateralSymbol}/${row.loanSymbol}`,
        formatPercent(row.allocationPct, 2),
        formatCurrency(row.allocationUsd),
        formatPercent(row.lltv, 2),
        formatPercent(row.marketNetApy, 2),
        formatCurrency(row.marketLiquidityUsd),
        formatPercent(row.marketUtilization, 2),
      ]
        .map((cell) => escapeCsvCell(cell))
        .join(",")
    );
  });

  lines.push("");
  lines.push("health,bucket,borrowers,borrow_exposure,share_of_borrow");
  data.risk.healthBuckets.forEach((bucket) => {
    lines.push(
      [
        "health",
        bucket.label,
        formatNumber(bucket.borrowerCount),
        formatCurrency(bucket.borrowUsd),
        formatPercent(bucket.shareOfBorrow, 2),
      ]
        .map((cell) => escapeCsvCell(cell))
        .join(",")
    );
  });

  lines.push("");
  lines.push("liquidation_summary,window,incidents,repaid,seized,bad_debt");
  lines.push(
    [
      "liquidation_summary",
      "30d",
      formatNumber(data.risk.liquidationSummary30d.incidentCount),
      formatCurrency(data.risk.liquidationSummary30d.repaidUsd),
      formatCurrency(data.risk.liquidationSummary30d.seizedUsd),
      formatCurrency(data.risk.liquidationSummary30d.badDebtUsd),
    ]
      .map((cell) => escapeCsvCell(cell))
      .join(",")
  );
  lines.push(
    [
      "liquidation_summary",
      "90d",
      formatNumber(data.risk.liquidationSummary90d.incidentCount),
      formatCurrency(data.risk.liquidationSummary90d.repaidUsd),
      formatCurrency(data.risk.liquidationSummary90d.seizedUsd),
      formatCurrency(data.risk.liquidationSummary90d.badDebtUsd),
    ]
      .map((cell) => escapeCsvCell(cell))
      .join(",")
  );

  lines.push("");
  lines.push("liquidations,date,market,repaid,seized,bad_debt,tx_hash");
  data.risk.recentLiquidations.slice(0, 30).forEach((incident) => {
    lines.push(
      [
        "liquidations",
        formatTimestamp(incident.timestamp, true),
        incident.marketLabel,
        formatCurrency(incident.repaidUsd),
        formatCurrency(incident.seizedUsd),
        formatCurrency(incident.badDebtUsd),
        incident.hash,
      ]
        .map((cell) => escapeCsvCell(cell))
        .join(",")
    );
  });

  return `${lines.join("\n")}\n`;
}

export function buildVaultRiskReportHtml(data: VaultReadModel): string {
  const displayVaultName = getDisplayVaultName(data.snapshot.name);
  const reportDate = toIsoDate(data.snapshot.asOfTimestamp);

  const heroMetrics = [
    { label: "Current Pool TVL", value: formatCurrency(data.snapshot.totalAssetsUsd) },
    { label: "Net APY", value: formatPercent(data.snapshot.netApy, 2) },
    {
      label: "Pool Loan-to-Value",
      value: formatPercent(data.risk.scorecard.weightedBorrowLtv, 2),
    },
    {
      label: "Collateral Coverage",
      value: formatPercent(data.risk.scorecard.collateralCoverageRatio, 2),
    },
  ];

  const overviewRows = [
    ["Report Date", reportDate],
    ["Total Borrow", formatCurrency(data.risk.scorecard.totalBorrowUsd)],
    ["Total Collateral", formatCurrency(data.risk.scorecard.totalCollateralUsd)],
    ["Liquidity", formatCurrency(data.snapshot.liquidityUsd)],
    ["LLTV Headroom", formatPercent(data.risk.scorecard.lltvHeadroom, 2)],
    ["Near-Liquidation Borrow", formatCurrency(data.risk.scorecard.nearLiquidationBorrowUsd)],
    ["Active Loans", formatNumber(data.risk.scorecard.activePositions)],
    ["Active Borrowers", formatNumber(data.risk.scorecard.activeBorrowers)],
  ];

  const topAllocations = data.allocations.slice(0, 6);
  const recentLiquidations = data.risk.recentLiquidations.slice(0, 8);
  const performancePoints = toChartPoints(data.performanceSeries);
  const apyPoints = toChartPoints(data.netApySeries, (value) => value * 100);
  const utilizationPoints = toChartPoints(data.utilizationSeries, (value) => value * 100);
  const supplyPoints = toChartPoints(data.supplySeries);

  const performanceChart = buildLineChartSvg({
    title: "Performance (Growth of 1000)",
    points: performancePoints,
    stroke: "#2f79d7",
    kind: "index",
  });
  const apyChart = buildLineChartSvg({
    title: "Net APY",
    points: apyPoints,
    stroke: "#3fb4a1",
    kind: "percent",
  });
  const utilizationChart = buildLineChartSvg({
    title: "Allocation-Weighted Utilization",
    points: utilizationPoints,
    stroke: "#a2802f",
    kind: "percent",
  });
  const supplyChart = buildLineChartSvg({
    title: "Vault Supply (USD)",
    points: supplyPoints,
    stroke: "#5d68d6",
    kind: "currency",
  });
  const allocationBarsChart = buildAllocationBarsSvg(data);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Credit Risk Report - ${escapeHtml(displayVaultName)}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      background: #edf1f8;
      color: #0f1e36;
      font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      line-height: 1.4;
    }
    .page {
      background: #ffffff;
      border: 1px solid #d7dfed;
      box-shadow: 0 10px 30px rgba(11, 24, 49, 0.14);
      max-width: 1000px;
      margin: 18px auto;
      overflow: hidden;
    }
    .hero {
      padding: 26px 30px;
      color: #f3f7ff;
      background:
        radial-gradient(140% 180% at 0% 0%, rgba(69, 167, 255, 0.3), transparent 50%),
        linear-gradient(120deg, #0b1f4d 0%, #122f67 42%, #183f84 100%);
      border-bottom: 3px solid #5fc4f2;
    }
    .hero-eyebrow {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: rgba(224, 238, 255, 0.8);
      margin: 0 0 8px;
    }
    .hero h1 {
      margin: 0;
      font-size: 34px;
      line-height: 1.08;
      letter-spacing: -0.02em;
      font-weight: 700;
    }
    .hero-subtitle {
      margin-top: 6px;
      font-size: 17px;
      color: #cae6ff;
      font-weight: 500;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin-top: 18px;
    }
    .hero-metric {
      background: rgba(237, 246, 255, 0.12);
      border: 1px solid rgba(173, 220, 255, 0.35);
      border-radius: 10px;
      padding: 10px 12px;
    }
    .hero-metric p {
      margin: 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: #c6e2ff;
    }
    .hero-metric strong {
      display: block;
      margin-top: 5px;
      font-size: 18px;
      color: #ffffff;
      font-weight: 700;
    }
    .content {
      padding: 20px 24px 26px;
    }
    .chart-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .chart-card {
      border: 1px solid #d7dfed;
      background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
      border-radius: 12px;
      padding: 10px;
    }
    .chart-card h3 {
      margin: 0 0 8px;
      font-size: 13px;
      color: #17366b;
      letter-spacing: 0.01em;
    }
    .chart-card svg {
      width: 100%;
      height: auto;
      display: block;
    }
    .chart-foot {
      margin: 8px 2px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #5b7096;
    }
    .chart-foot strong {
      color: #1c335c;
    }
    .chart-empty {
      margin: 10px 0 2px;
      color: #6f83a8;
      font-size: 12px;
    }
    .chart-wide {
      grid-column: 1 / -1;
    }
    .row {
      display: grid;
      gap: 14px;
      grid-template-columns: 1fr 1fr;
      margin-bottom: 14px;
    }
    .panel {
      border: 1px solid #d7dfed;
      background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
      border-radius: 12px;
      overflow: hidden;
    }
    .panel h2 {
      margin: 0;
      padding: 10px 12px;
      font-size: 15px;
      border-bottom: 1px solid #d7dfed;
      background: #f0f5ff;
      color: #17366b;
      letter-spacing: 0.01em;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      padding: 8px 10px;
      border-bottom: 1px solid #e7ecf6;
      vertical-align: top;
      text-align: left;
    }
    th {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #4d6390;
      background: #f8faff;
      font-weight: 700;
    }
    td:last-child,
    th:last-child {
      text-align: right;
    }
    .subnote {
      margin: 10px 2px 0;
      color: #5f7094;
      font-size: 11px;
    }
    .wide {
      grid-column: 1 / -1;
    }
    .footer {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #d7dfed;
      color: #607296;
      font-size: 10px;
      line-height: 1.45;
    }
    @media print {
      body {
        background: #fff;
      }
      .page {
        margin: 0;
        border: 0;
        box-shadow: none;
        max-width: none;
      }
    }
    @media (max-width: 920px) {
      .chart-grid {
        grid-template-columns: 1fr;
      }
      .row {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <p class="hero-eyebrow">Monthly Lender Report</p>
      <h1>${escapeHtml(displayVaultName)}</h1>
      <p class="hero-subtitle">Institutional Credit Risk Reporting - ${escapeHtml(reportDate)}</p>
      <div class="hero-grid">
        ${heroMetrics
          .map(
            (metric) => `
          <div class="hero-metric">
            <p>${escapeHtml(metric.label)}</p>
            <strong>${escapeHtml(metric.value)}</strong>
          </div>
        `
          )
          .join("")}
      </div>
    </section>
    <section class="content">
      <div class="chart-grid">
        ${performanceChart}
        ${apyChart}
        ${utilizationChart}
        ${supplyChart}
        ${allocationBarsChart}
      </div>

      <div class="row">
        <article class="panel">
          <h2>Pool Summary</h2>
          <table>
            <tbody>
              ${overviewRows
                .map(
                  ([label, value]) => `
                <tr>
                  <td>${escapeHtml(label)}</td>
                  <td>${escapeHtml(value)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </article>
        <article class="panel">
          <h2>Liquidation Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Window</th>
                <th>Incidents</th>
                <th>Bad Debt</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Last 30 Days</td>
                <td>${escapeHtml(formatNumber(data.risk.liquidationSummary30d.incidentCount))}</td>
                <td>${escapeHtml(formatCurrency(data.risk.liquidationSummary30d.badDebtUsd))}</td>
              </tr>
              <tr>
                <td>Last 90 Days</td>
                <td>${escapeHtml(formatNumber(data.risk.liquidationSummary90d.incidentCount))}</td>
                <td>${escapeHtml(formatCurrency(data.risk.liquidationSummary90d.badDebtUsd))}</td>
              </tr>
              <tr>
                <td>Stress 15% At Risk</td>
                <td>--</td>
                <td>${escapeHtml(formatCurrency(data.risk.scorecard.stressCollateralAtRisk15PctUsd))}</td>
              </tr>
            </tbody>
          </table>
          <p class="subnote">Stress metric is estimated from collateral-at-risk curves and vault share by market.</p>
        </article>
      </div>

      <div class="row">
        <article class="panel wide">
          <h2>Top Market Allocation</h2>
          <table>
            <thead>
              <tr>
                <th>Market</th>
                <th>Allocation %</th>
                <th>Vault Supply</th>
                <th>Liquidation LTV</th>
                <th>Net APY</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              ${topAllocations
                .map(
                  (allocation) => `
                <tr>
                  <td>${escapeHtml(`${allocation.collateralSymbol}/${allocation.loanSymbol}`)}</td>
                  <td>${escapeHtml(formatPercent(allocation.allocationPct, 2))}</td>
                  <td>${escapeHtml(formatCurrency(allocation.allocationUsd))}</td>
                  <td>${escapeHtml(formatPercent(allocation.lltv, 2))}</td>
                  <td>${escapeHtml(formatPercent(allocation.marketNetApy, 2))}</td>
                  <td>${escapeHtml(formatPercent(allocation.marketUtilization, 2))}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </article>
      </div>

      <div class="row">
        <article class="panel">
          <h2>Borrower Health Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Bucket</th>
                <th>Borrowers</th>
                <th>Borrow Exposure</th>
              </tr>
            </thead>
            <tbody>
              ${data.risk.healthBuckets
                .map(
                  (bucket) => `
                <tr>
                  <td>${escapeHtml(bucket.label)}</td>
                  <td>${escapeHtml(formatNumber(bucket.borrowerCount))}</td>
                  <td>${escapeHtml(formatCurrency(bucket.borrowUsd))}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </article>
        <article class="panel">
          <h2>Recent Liquidation Incidents</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Market</th>
                <th>Repaid</th>
              </tr>
            </thead>
            <tbody>
              ${
                recentLiquidations.length === 0
                  ? `<tr><td colspan="3" style="text-align:center;color:#6b7ea3;">No incidents in lookback period.</td></tr>`
                  : recentLiquidations
                      .map(
                        (incident) => `
                    <tr>
                      <td>${escapeHtml(formatTimestamp(incident.timestamp, true))}</td>
                      <td>${escapeHtml(incident.marketLabel)}</td>
                      <td>${escapeHtml(formatCurrency(incident.repaidUsd))}</td>
                    </tr>
                  `
                      )
                      .join("")
              }
            </tbody>
          </table>
        </article>
      </div>

      <div class="footer">
        <p><strong>Methodology:</strong> ${escapeHtml(data.risk.methodologyNotes.join(" "))}</p>
        <p>Confidential report intended for credit and risk review. Historical and stress results are model-based estimates and should be interpreted alongside governance controls.</p>
      </div>
    </section>
  </main>
</body>
</html>`;
}
