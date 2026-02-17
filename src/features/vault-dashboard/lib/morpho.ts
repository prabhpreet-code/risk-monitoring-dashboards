import { MORPHO_GRAPHQL_ENDPOINT } from "../constants";
import {
  CollateralAtRiskSeries,
  LiquidationIncident,
  LiquidationSummary,
  RiskHealthBucket,
  RiskScorecard,
  TimeRangeConfig,
  TimeseriesPoint,
  VaultAllocationRow,
  VaultReadModel,
  VaultRiskAnalysis,
  VaultSnapshot,
} from "../types";

const WAD = BigInt("1000000000000000000");
const STRESS_COLLATERAL_RATIO = 0.85;
const NEAR_LIQUIDATION_HF = 1.1;
const NEAR_LIQUIDATION_LLTV_FACTOR = 0.9;
const LIQUIDATION_LOOKBACK_DAYS = 90;

const VAULT_DASHBOARD_QUERY = `
  query VaultDashboard(
    $address: String!
    $chainId: Int!
    $startTimestamp: Int!
    $endTimestamp: Int!
    $interval: TimeseriesInterval!
    $riskStartTimestamp: Int!
    $riskEndTimestamp: Int!
  ) {
    vaultByAddress(address: $address, chainId: $chainId) {
      address
      name
      symbol
      chain {
        id
        network
      }
      state {
        timestamp
        totalAssetsUsd
        netApy
        fee
        allocation {
          supplyAssetsUsd
          market {
            uniqueKey
            lltv
            loanAsset {
              symbol
            }
            collateralAsset {
              symbol
            }
            state {
              utilization
              liquidityAssetsUsd
              supplyAssetsUsd
              netSupplyApy
              supplyApy
            }
            historicalState {
              utilizationRange: utilization(
                options: {
                  startTimestamp: $startTimestamp
                  endTimestamp: $endTimestamp
                  interval: $interval
                }
              ) {
                x
                y
              }
              supplyAssetsUsd(
                options: {
                  startTimestamp: $riskStartTimestamp
                  endTimestamp: $riskEndTimestamp
                  interval: DAY
                }
              ) {
                x
                y
              }
            }
          }
        }
      }
      liquidity {
        usd
      }
      historicalState {
        allocation {
          market {
            uniqueKey
          }
          supplyAssetsUsd {
            x
            y
          }
        }
        sharePriceUsd(
          options: {
            startTimestamp: $startTimestamp
            endTimestamp: $endTimestamp
            interval: $interval
          }
        ) {
          x
          y
        }
        netApy(
          options: {
            startTimestamp: $startTimestamp
            endTimestamp: $endTimestamp
            interval: $interval
          }
        ) {
          x
          y
        }
        totalAssetsUsd(
          options: {
            startTimestamp: $startTimestamp
            endTimestamp: $endTimestamp
            interval: $interval
          }
        ) {
          x
          y
        }
      }
    }
  }
`;

const COLLATERAL_AT_RISK_QUERY = `
  query MarketCollateralAtRisk(
    $uniqueKey: String!
    $chainId: Int!
    $numberOfPoints: Float!
  ) {
    marketCollateralAtRisk(
      uniqueKey: $uniqueKey
      chainId: $chainId
      numberOfPoints: $numberOfPoints
    ) {
      market {
        uniqueKey
        loanAsset {
          symbol
        }
        collateralAsset {
          symbol
        }
      }
      collateralAtRisk {
        collateralPriceRatio
        collateralUsd
      }
    }
  }
`;

const MARKET_POSITIONS_QUERY = `
  query MarketPositions(
    $first: Int!
    $skip: Int!
    $marketKeys: [String!]!
    $chainIds: [Int!]
  ) {
    marketPositions(
      first: $first
      skip: $skip
      orderBy: BorrowShares
      orderDirection: Desc
      where: {
        marketUniqueKey_in: $marketKeys
        chainId_in: $chainIds
        borrowShares_gte: 1
      }
    ) {
      items {
        id
        healthFactor
        priceVariationToLiquidationPrice
        user {
          address
        }
        market {
          uniqueKey
          lltv
          loanAsset {
            symbol
          }
          collateralAsset {
            symbol
          }
        }
        state {
          borrowAssetsUsd
          collateralUsd
          marginUsd
        }
      }
      pageInfo {
        count
        countTotal
      }
    }
  }
`;

const LIQUIDATIONS_QUERY = `
  query Liquidations(
    $first: Int!
    $skip: Int!
    $marketKeys: [String!]!
    $chainIds: [Int!]
    $timestampGte: Int!
  ) {
    transactions(
      first: $first
      skip: $skip
      orderBy: Timestamp
      orderDirection: Desc
      where: {
        marketUniqueKey_in: $marketKeys
        chainId_in: $chainIds
        type_in: [MarketLiquidation]
        timestamp_gte: $timestampGte
      }
    ) {
      items {
        id
        timestamp
        hash
        data {
          ... on MarketLiquidationTransactionData {
            repaidAssetsUsd
            seizedAssetsUsd
            badDebtAssetsUsd
            market {
              uniqueKey
              loanAsset {
                symbol
              }
              collateralAsset {
                symbol
              }
            }
          }
        }
      }
      pageInfo {
        count
        countTotal
      }
    }
  }
`;

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type VaultDashboardResponse = {
  vaultByAddress: {
    address: string;
    name: string;
    symbol: string;
    chain: {
      id: number;
      network: string;
    };
    state: {
      timestamp: string | number;
      totalAssetsUsd: number | null;
      netApy: number;
      fee: number;
      allocation: Array<{
        supplyAssetsUsd: number | null;
        market: {
          uniqueKey: string;
          lltv: string | number;
          loanAsset: { symbol: string };
          collateralAsset: { symbol: string } | null;
          state: {
            utilization: number;
            liquidityAssetsUsd: number | null;
            supplyAssetsUsd: number | null;
            netSupplyApy: number | null;
            supplyApy: number;
          };
          historicalState: {
            utilizationRange: TimeseriesPoint[];
            supplyAssetsUsd: TimeseriesPoint[];
          };
        };
      }>;
    };
    liquidity: { usd: number } | null;
    historicalState: {
      allocation: Array<{
        market: {
          uniqueKey: string;
        };
        supplyAssetsUsd: TimeseriesPoint[];
      }>;
      sharePriceUsd: TimeseriesPoint[];
      netApy: TimeseriesPoint[];
      totalAssetsUsd: TimeseriesPoint[];
    };
  };
};

type CollateralAtRiskResponse = {
  marketCollateralAtRisk: {
    market: {
      uniqueKey: string;
      loanAsset: { symbol: string };
      collateralAsset: { symbol: string } | null;
    };
    collateralAtRisk: Array<{
      collateralPriceRatio: number;
      collateralUsd: number;
    }>;
  };
};

type MarketPositionsResponse = {
  marketPositions: {
    items: Array<{
      id: string;
      healthFactor: number | null;
      priceVariationToLiquidationPrice: number | null;
      user: { address: string } | null;
      market: {
        uniqueKey: string;
        lltv: string | number;
        loanAsset: { symbol: string };
        collateralAsset: { symbol: string } | null;
      };
      state: {
        borrowAssetsUsd: number | null;
        collateralUsd: number | null;
        marginUsd: number | null;
      } | null;
    }>;
    pageInfo: {
      count: number;
      countTotal: number;
    };
  };
};

type LiquidationsResponse = {
  transactions: {
    items: Array<{
      id: string;
      timestamp: string | number;
      hash: string;
      data:
        | {
            repaidAssetsUsd: number | null;
            seizedAssetsUsd: number | null;
            badDebtAssetsUsd: number | null;
            market: {
              uniqueKey: string;
              loanAsset: { symbol: string };
              collateralAsset: { symbol: string } | null;
            };
          }
        | null;
    }>;
    pageInfo: {
      count: number;
      countTotal: number;
    };
  };
};

type RiskPosition = {
  id: string;
  userAddress: string;
  marketKey: string;
  marketLabel: string;
  lltv: number | null;
  healthFactor: number | null;
  borrowUsd: number;
  collateralUsd: number;
  marginUsd: number;
};

async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await fetch(MORPHO_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Morpho API request failed (${response.status})`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((error) => error.message).join("; "));
  }

  if (!json.data) {
    throw new Error("Morpho API returned empty data");
  }

  return json.data;
}

function toFiniteNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseWadToRatio(value: string | number): number | null {
  if (typeof value === "number") {
    return value > 1 ? value / 1e18 : value;
  }

  if (value === "0") {
    return 0;
  }

  try {
    const raw = BigInt(value);
    const whole = raw / WAD;
    const fraction = raw % WAD;
    const fractionText = fraction.toString().padStart(18, "0").slice(0, 6);
    return Number(`${whole.toString()}.${fractionText}`);
  } catch {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return null;
    }
    return numeric > 1 ? numeric / 1e18 : numeric;
  }
}

function normalizeSeries(series: TimeseriesPoint[]): TimeseriesPoint[] {
  return [...series]
    .map((point) => ({
      x: Number(point.x),
      y: point.y === null || point.y === undefined ? null : Number(point.y),
    }))
    .filter((point) => Number.isFinite(point.x))
    .sort((a, b) => a.x - b.x);
}

type NonNullPoint = {
  x: number;
  y: number;
};

function toNonNullSeries(series: TimeseriesPoint[]): NonNullPoint[] {
  return series
    .filter((point): point is { x: number; y: number } => point.y !== null)
    .map((point) => ({
      x: point.x,
      y: point.y,
    }))
    .sort((a, b) => a.x - b.x);
}

function getStepSeriesValue(
  series: NonNullPoint[],
  timestamp: number
): number | null {
  if (series.length === 0) {
    return null;
  }

  if (timestamp <= series[0].x) {
    return series[0].y;
  }

  let left = 0;
  let right = series.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const middlePoint = series[middle];

    if (middlePoint.x === timestamp) {
      return middlePoint.y;
    }

    if (middlePoint.x < timestamp) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  const candidateIndex = Math.max(0, Math.min(right, series.length - 1));
  return series[candidateIndex].y;
}

function buildCurrentShareByMarket(
  allocations: VaultAllocationRow[]
): Map<string, number> {
  const shares = new Map<string, number>();

  allocations.forEach((allocation) => {
    if (allocation.marketTotalSupplyUsd <= 0 || allocation.allocationUsd <= 0) {
      return;
    }

    const share = allocation.allocationUsd / allocation.marketTotalSupplyUsd;
    shares.set(allocation.marketKey, Math.max(0, Math.min(1, share)));
  });

  return shares;
}

function buildVaultAllocationHistoryByMarket(
  allocationHistory: Array<{
    market: { uniqueKey: string };
    supplyAssetsUsd: TimeseriesPoint[];
  }>
): Map<string, TimeseriesPoint[]> {
  return new Map(
    allocationHistory.map((historyRow) => [
      historyRow.market.uniqueKey,
      normalizeSeries(historyRow.supplyAssetsUsd),
    ])
  );
}

function buildPerformanceSeries(sharePriceSeries: TimeseriesPoint[]): TimeseriesPoint[] {
  const series = normalizeSeries(sharePriceSeries);
  const baseline = series.find((point) => point.y !== null)?.y ?? 1;

  if (!baseline) {
    return series;
  }

  return series.map((point) => ({
    x: point.x,
    y: point.y === null ? null : (point.y / baseline) * 1000,
  }));
}

function buildWeightedUtilizationSeries(
  allocations: VaultAllocationRow[],
  allocationHistoryByMarket: Map<string, TimeseriesPoint[]>
): TimeseriesPoint[] {
  const byTimestamp = new Map<number, { weighted: number; weight: number }>();
  const allocationHistoryNonNullByMarket = new Map<string, NonNullPoint[]>(
    Array.from(allocationHistoryByMarket.entries()).map(([marketKey, series]) => [
      marketKey,
      toNonNullSeries(series),
    ])
  );

  allocations.forEach((allocation) => {
    const historicalAllocationSeries =
      allocationHistoryNonNullByMarket.get(allocation.marketKey) ?? [];

    allocation.utilizationHistory.forEach((point) => {
      if (point.y === null) {
        return;
      }

      const historicalWeight = getStepSeriesValue(historicalAllocationSeries, point.x);
      const weight =
        historicalWeight !== null
          ? historicalWeight
          : allocation.allocationUsd > 0
            ? allocation.allocationUsd
            : 0;

      if (weight <= 0) {
        return;
      }

      const previous = byTimestamp.get(point.x) ?? { weighted: 0, weight: 0 };
      previous.weighted += point.y * weight;
      previous.weight += weight;
      byTimestamp.set(point.x, previous);
    });
  });

  return Array.from(byTimestamp.entries())
    .map(([timestamp, values]) => ({
      x: timestamp,
      y: values.weight === 0 ? null : values.weighted / values.weight,
    }))
    .sort((a, b) => a.x - b.x);
}

function getMarketLabel(collateralSymbol: string | null, loanSymbol: string): string {
  return `${collateralSymbol ?? "Idle"}/${loanSymbol}`;
}

function buildHistoricalShareResolver({
  currentShareByMarket,
  allocationHistoryByMarket,
  marketSupplyHistoryByMarket,
}: {
  currentShareByMarket: Map<string, number>;
  allocationHistoryByMarket: Map<string, TimeseriesPoint[]>;
  marketSupplyHistoryByMarket: Map<string, TimeseriesPoint[]>;
}): (marketKey: string, timestamp: number) => number {
  const allocationSeriesByMarket = new Map<string, NonNullPoint[]>(
    Array.from(allocationHistoryByMarket.entries()).map(([marketKey, series]) => [
      marketKey,
      toNonNullSeries(series),
    ])
  );

  const marketSupplySeriesByMarket = new Map<string, NonNullPoint[]>(
    Array.from(marketSupplyHistoryByMarket.entries()).map(([marketKey, series]) => [
      marketKey,
      toNonNullSeries(series),
    ])
  );

  return (marketKey: string, timestamp: number): number => {
    const fallbackShare = currentShareByMarket.get(marketKey) ?? 0;
    const allocationSeries = allocationSeriesByMarket.get(marketKey);
    const marketSupplySeries = marketSupplySeriesByMarket.get(marketKey);

    if (!allocationSeries || !marketSupplySeries) {
      return fallbackShare;
    }

    const allocationAtTimestamp = getStepSeriesValue(allocationSeries, timestamp);
    const marketSupplyAtTimestamp = getStepSeriesValue(marketSupplySeries, timestamp);

    if (
      allocationAtTimestamp === null ||
      marketSupplyAtTimestamp === null ||
      marketSupplyAtTimestamp <= 0
    ) {
      return fallbackShare;
    }

    const share = allocationAtTimestamp / marketSupplyAtTimestamp;
    if (!Number.isFinite(share)) {
      return fallbackShare;
    }

    return Math.max(0, Math.min(1, share));
  };
}

function interpolateCollateralUsdAtRatio(
  points: CollateralAtRiskSeries["points"],
  targetRatio: number
): number | null {
  if (points.length === 0) {
    return null;
  }

  const sorted = [...points].sort(
    (a, b) => a.collateralPriceRatio - b.collateralPriceRatio
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  if (targetRatio <= first.collateralPriceRatio) {
    return first.collateralUsd;
  }

  if (targetRatio >= last.collateralPriceRatio) {
    return last.collateralUsd;
  }

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const lower = sorted[index];
    const upper = sorted[index + 1];

    if (
      targetRatio >= lower.collateralPriceRatio &&
      targetRatio <= upper.collateralPriceRatio
    ) {
      const ratioDelta = upper.collateralPriceRatio - lower.collateralPriceRatio;
      if (ratioDelta === 0) {
        return lower.collateralUsd;
      }

      const weight =
        (targetRatio - lower.collateralPriceRatio) / ratioDelta;
      return (
        lower.collateralUsd + (upper.collateralUsd - lower.collateralUsd) * weight
      );
    }
  }

  return null;
}

function summarizeLiquidations(
  incidents: LiquidationIncident[],
  nowTimestamp: number,
  windowDays: number
): LiquidationSummary {
  const lowerBound = nowTimestamp - windowDays * 24 * 60 * 60;
  const inWindow = incidents.filter((incident) => incident.timestamp >= lowerBound);

  return {
    windowDays,
    incidentCount: inWindow.length,
    repaidUsd: inWindow.reduce((sum, incident) => sum + incident.repaidUsd, 0),
    seizedUsd: inWindow.reduce((sum, incident) => sum + incident.seizedUsd, 0),
    badDebtUsd: inWindow.reduce((sum, incident) => sum + incident.badDebtUsd, 0),
  };
}

function computeRiskAnalysis({
  snapshot,
  allocations,
  collateralAtRisk,
  positions,
  liquidations,
  currentShareByMarket,
  liquidationShareAtTimestamp,
}: {
  snapshot: VaultSnapshot;
  allocations: VaultAllocationRow[];
  collateralAtRisk: CollateralAtRiskSeries[];
  positions: RiskPosition[];
  liquidations: LiquidationIncident[];
  currentShareByMarket: Map<string, number>;
  liquidationShareAtTimestamp: (marketKey: string, timestamp: number) => number;
}): VaultRiskAnalysis {
  const scaledPositions = positions.map((position) => {
    const share = currentShareByMarket.get(position.marketKey) ?? 0;
    return {
      ...position,
      borrowUsd: position.borrowUsd * share,
      collateralUsd: position.collateralUsd * share,
      marginUsd: position.marginUsd * share,
    };
  });

  const scaledLiquidations = liquidations.map((incident) => {
    const share = liquidationShareAtTimestamp(incident.marketKey, incident.timestamp);
    return {
      ...incident,
      repaidUsd: incident.repaidUsd * share,
      seizedUsd: incident.seizedUsd * share,
      badDebtUsd: incident.badDebtUsd * share,
    };
  });

  const weightedLltvInputs = allocations.filter(
    (allocation) =>
      allocation.allocationUsd > 0 &&
      allocation.lltv !== null &&
      allocation.lltv > 0 &&
      allocation.collateralSymbol !== "Idle"
  );

  const weightedLltvDenominator = weightedLltvInputs.reduce(
    (sum, allocation) => sum + allocation.allocationUsd,
    0
  );

  const weightedLltvNumerator = weightedLltvInputs.reduce(
    (sum, allocation) => sum + allocation.allocationUsd * (allocation.lltv ?? 0),
    0
  );

  const weightedLltv =
    weightedLltvDenominator > 0 ? weightedLltvNumerator / weightedLltvDenominator : null;

  const totalBorrowUsd = scaledPositions.reduce(
    (sum, position) => sum + position.borrowUsd,
    0
  );
  const totalCollateralUsd = scaledPositions.reduce(
    (sum, position) => sum + position.collateralUsd,
    0
  );

  const weightedBorrowLtv =
    totalCollateralUsd > 0 ? totalBorrowUsd / totalCollateralUsd : null;

  const lltvHeadroom =
    weightedLltv !== null && weightedBorrowLtv !== null
      ? weightedLltv - weightedBorrowLtv
      : null;

  const collateralCoverageRatio =
    totalBorrowUsd > 0 ? totalCollateralUsd / totalBorrowUsd : null;

  const liquidityCoverage =
    snapshot.totalAssetsUsd > 0 ? snapshot.liquidityUsd / snapshot.totalAssetsUsd : null;

  const topMarketConcentration = allocations.reduce(
    (max, allocation) => Math.max(max, allocation.allocationPct),
    0
  );

  const concentrationHhi = allocations.reduce(
    (sum, allocation) => sum + allocation.allocationPct * allocation.allocationPct,
    0
  );

  const nearLiquidationBorrowUsd = scaledPositions.reduce((sum, position) => {
    if (position.borrowUsd <= 0) {
      return sum;
    }

    const positionLtv =
      position.collateralUsd > 0 ? position.borrowUsd / position.collateralUsd : null;

    const hfTriggered =
      position.healthFactor !== null && position.healthFactor <= NEAR_LIQUIDATION_HF;

    const lltvTriggered =
      positionLtv !== null &&
      position.lltv !== null &&
      position.lltv > 0 &&
      positionLtv >= position.lltv * NEAR_LIQUIDATION_LLTV_FACTOR;

    return hfTriggered || lltvTriggered ? sum + position.borrowUsd : sum;
  }, 0);

  const allocationByMarket = new Map<string, VaultAllocationRow>(
    allocations.map((allocation) => [allocation.marketKey, allocation])
  );

  const stressCollateralAtRisk15PctUsd = collateralAtRisk.reduce((sum, series) => {
    const allocation = allocationByMarket.get(series.marketKey);
    if (!allocation) {
      return sum;
    }

    const interpolatedCollateralUsd = interpolateCollateralUsdAtRatio(
      series.points,
      STRESS_COLLATERAL_RATIO
    );
    if (interpolatedCollateralUsd === null) {
      return sum;
    }

    const vaultShareOfMarket = currentShareByMarket.get(series.marketKey) ?? 0;
    if (vaultShareOfMarket <= 0) {
      return sum;
    }

    return sum + interpolatedCollateralUsd * vaultShareOfMarket;
  }, 0);

  const bucketDefinitions: Array<{
    label: string;
    test: (healthFactor: number | null) => boolean;
  }> = [
    { label: "Critical (HF <= 1.05)", test: (hf) => hf !== null && hf <= 1.05 },
    {
      label: "Elevated (1.05 < HF <= 1.20)",
      test: (hf) => hf !== null && hf > 1.05 && hf <= 1.2,
    },
    {
      label: "Watch (1.20 < HF <= 1.50)",
      test: (hf) => hf !== null && hf > 1.2 && hf <= 1.5,
    },
    { label: "Healthy (HF > 1.50)", test: (hf) => hf !== null && hf > 1.5 },
    { label: "Unscored", test: (hf) => hf === null },
  ];

  const borrowerRiskByAddress = new Map<
    string,
    { borrowUsd: number; minHealthFactor: number | null }
  >();

  scaledPositions.forEach((position) => {
    const current = borrowerRiskByAddress.get(position.userAddress) ?? {
      borrowUsd: 0,
      minHealthFactor: null,
    };

    const nextHealthFactor =
      position.healthFactor === null
        ? current.minHealthFactor
        : current.minHealthFactor === null
          ? position.healthFactor
          : Math.min(current.minHealthFactor, position.healthFactor);

    borrowerRiskByAddress.set(position.userAddress, {
      borrowUsd: current.borrowUsd + position.borrowUsd,
      minHealthFactor: nextHealthFactor,
    });
  });

  const borrowerRiskRows = Array.from(borrowerRiskByAddress.entries()).map(
    ([address, value]) => ({
      address,
      borrowUsd: value.borrowUsd,
      healthFactor: value.minHealthFactor,
    })
  );

  const mutableBuckets = bucketDefinitions.map((bucket) => ({
    label: bucket.label,
    borrowUsd: 0,
    addresses: new Set<string>(),
  }));

  borrowerRiskRows.forEach((borrower) => {
    const bucketIndex = bucketDefinitions.findIndex((bucket) =>
      bucket.test(borrower.healthFactor)
    );
    const targetBucket = mutableBuckets[Math.max(bucketIndex, 0)];
    targetBucket.borrowUsd += borrower.borrowUsd;
    targetBucket.addresses.add(borrower.address);
  });

  const healthBuckets: RiskHealthBucket[] = mutableBuckets.map((bucket) => ({
    label: bucket.label,
    borrowerCount: bucket.addresses.size,
    borrowUsd: bucket.borrowUsd,
    shareOfBorrow: totalBorrowUsd > 0 ? bucket.borrowUsd / totalBorrowUsd : 0,
  }));

  const activeBorrowers = borrowerRiskRows.filter(
    (borrower) => borrower.borrowUsd > 0
  ).length;
  const activePositions = scaledPositions.filter(
    (position) => position.borrowUsd > 0
  ).length;

  const nowTimestamp =
    snapshot.asOfTimestamp > 0
      ? snapshot.asOfTimestamp
      : Math.floor(Date.now() / 1000);

  const liquidationSummary30d = summarizeLiquidations(
    scaledLiquidations,
    nowTimestamp,
    30
  );
  const liquidationSummary90d = summarizeLiquidations(
    scaledLiquidations,
    nowTimestamp,
    90
  );

  const scorecard: RiskScorecard = {
    weightedLltv,
    weightedBorrowLtv,
    lltvHeadroom,
    collateralCoverageRatio,
    liquidityCoverage,
    topMarketConcentration,
    concentrationHhi,
    nearLiquidationBorrowUsd,
    stressCollateralAtRisk15PctUsd,
    totalBorrowUsd,
    totalCollateralUsd,
    activeBorrowers,
    activePositions,
  };

  return {
    scorecard,
    healthBuckets,
    liquidationSummary30d,
    liquidationSummary90d,
    recentLiquidations: scaledLiquidations.slice(0, 20),
    methodologyNotes: [
      "Borrower buckets use Morpho market position health factors.",
      "Near-liquidation exposure uses HF <= 1.10 or LTV >= 90% of market LLTV.",
      "Borrower exposures use current vault share of each underlying market.",
      "Liquidation exposures use timestamp-aligned vault share estimates from vault allocation history and market supply history.",
      "Stress collateral-at-risk scales market collateral-at-risk by vault share of each market.",
      "Utilization chart uses historical vault allocation weights at each timestamp.",
    ],
  };
}

async function fetchCollateralAtRiskSeries(
  allocations: VaultAllocationRow[],
  chainId: number
): Promise<CollateralAtRiskSeries[]> {
  const targetMarkets = allocations.filter(
    (allocation) =>
      allocation.allocationUsd > 0 &&
      allocation.lltv !== null &&
      allocation.collateralSymbol !== "Idle"
  );

  const series = await Promise.all(
    targetMarkets.map(async (allocation) => {
      try {
        const response = await fetchGraphQL<CollateralAtRiskResponse>(
          COLLATERAL_AT_RISK_QUERY,
          {
            uniqueKey: allocation.marketKey,
            chainId,
            numberOfPoints: 24,
          }
        );

        const points = response.marketCollateralAtRisk.collateralAtRisk.map(
          (point) => ({
            collateralPriceRatio: toFiniteNumber(point.collateralPriceRatio),
            collateralUsd: toFiniteNumber(point.collateralUsd),
          })
        );

        return {
          marketKey: response.marketCollateralAtRisk.market.uniqueKey,
          label: getMarketLabel(
            response.marketCollateralAtRisk.market.collateralAsset?.symbol ?? null,
            response.marketCollateralAtRisk.market.loanAsset.symbol
          ),
          points,
        };
      } catch {
        return null;
      }
    })
  );

  return series.filter((item): item is CollateralAtRiskSeries => item !== null);
}

async function fetchMarketRiskPositions(
  marketKeys: string[],
  chainId: number
): Promise<RiskPosition[]> {
  if (marketKeys.length === 0) {
    return [];
  }

  const first = 200;
  let skip = 0;
  const allItems: MarketPositionsResponse["marketPositions"]["items"] = [];
  const seenIds = new Set<string>();

  while (true) {
    const response = await fetchGraphQL<MarketPositionsResponse>(MARKET_POSITIONS_QUERY, {
      first,
      skip,
      marketKeys,
      chainIds: [chainId],
    });

    const items = response.marketPositions.items;
    if (items.length === 0) {
      break;
    }

    items.forEach((item) => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        allItems.push(item);
      }
    });

    if (items.length < first || skip + items.length >= response.marketPositions.pageInfo.countTotal) {
      break;
    }

    skip += items.length;
  }

  return allItems
    .map((item) => {
      const borrowUsd = toFiniteNumber(item.state?.borrowAssetsUsd);
      const collateralUsd = toFiniteNumber(item.state?.collateralUsd);

      return {
        id: item.id,
        userAddress: item.user?.address ?? item.id,
        marketKey: item.market.uniqueKey,
        marketLabel: getMarketLabel(
          item.market.collateralAsset?.symbol ?? null,
          item.market.loanAsset.symbol
        ),
        lltv: parseWadToRatio(item.market.lltv),
        healthFactor:
          item.healthFactor === null || item.healthFactor === undefined
            ? null
            : toFiniteNumber(item.healthFactor),
        borrowUsd,
        collateralUsd,
        marginUsd: toFiniteNumber(item.state?.marginUsd),
      };
    })
    .filter((position) => position.borrowUsd > 0);
}

async function fetchVaultLiquidations(
  marketKeys: string[],
  chainId: number,
  lookbackDays: number
): Promise<LiquidationIncident[]> {
  if (marketKeys.length === 0) {
    return [];
  }

  const first = 100;
  let skip = 0;
  const now = Math.floor(Date.now() / 1000);
  const timestampGte = now - lookbackDays * 24 * 60 * 60;
  const incidents: LiquidationIncident[] = [];
  const seenIds = new Set<string>();

  while (true) {
    const response = await fetchGraphQL<LiquidationsResponse>(LIQUIDATIONS_QUERY, {
      first,
      skip,
      marketKeys,
      chainIds: [chainId],
      timestampGte,
    });

    const items = response.transactions.items;
    if (items.length === 0) {
      break;
    }

    items.forEach((item) => {
      if (seenIds.has(item.id) || !item.data) {
        return;
      }

      seenIds.add(item.id);
      incidents.push({
        id: item.id,
        timestamp: toFiniteNumber(item.timestamp),
        hash: item.hash,
        marketKey: item.data.market.uniqueKey,
        marketLabel: getMarketLabel(
          item.data.market.collateralAsset?.symbol ?? null,
          item.data.market.loanAsset.symbol
        ),
        repaidUsd: toFiniteNumber(item.data.repaidAssetsUsd),
        seizedUsd: toFiniteNumber(item.data.seizedAssetsUsd),
        badDebtUsd: toFiniteNumber(item.data.badDebtAssetsUsd),
      });
    });

    if (items.length < first || skip + items.length >= response.transactions.pageInfo.countTotal) {
      break;
    }

    skip += items.length;
  }

  return incidents.sort((a, b) => b.timestamp - a.timestamp);
}

export async function fetchVaultReadModel({
  vaultAddress,
  chainId,
  range,
}: {
  vaultAddress: string;
  chainId: number;
  range: TimeRangeConfig;
}): Promise<VaultReadModel> {
  const nowTimestamp = Math.floor(Date.now() / 1000);
  const riskStartTimestamp =
    nowTimestamp - LIQUIDATION_LOOKBACK_DAYS * 24 * 60 * 60;

  const response = await fetchGraphQL<VaultDashboardResponse>(VAULT_DASHBOARD_QUERY, {
    address: vaultAddress,
    chainId,
    startTimestamp: range.startTimestamp,
    endTimestamp: range.endTimestamp,
    interval: range.interval,
    riskStartTimestamp,
    riskEndTimestamp: range.endTimestamp,
  });

  if (!response.vaultByAddress) {
    throw new Error("Vault not found");
  }

  const vault = response.vaultByAddress;
  const totalAssetsUsd = toFiniteNumber(vault.state.totalAssetsUsd);
  const allocationHistoryByMarket = buildVaultAllocationHistoryByMarket(
    vault.historicalState.allocation
  );
  const marketSupplyHistoryByMarket = new Map<string, TimeseriesPoint[]>(
    vault.state.allocation.map((allocation) => [
      allocation.market.uniqueKey,
      normalizeSeries(allocation.market.historicalState.supplyAssetsUsd),
    ])
  );

  const allocations: VaultAllocationRow[] = vault.state.allocation
    .map((allocation) => {
      const allocationUsd = toFiniteNumber(allocation.supplyAssetsUsd);
      const marketNetApyRaw =
        allocation.market.state.netSupplyApy ?? allocation.market.state.supplyApy;

      return {
        marketKey: allocation.market.uniqueKey,
        collateralSymbol: allocation.market.collateralAsset?.symbol ?? "Idle",
        loanSymbol: allocation.market.loanAsset.symbol,
        allocationUsd,
        allocationPct: totalAssetsUsd === 0 ? 0 : allocationUsd / totalAssetsUsd,
        lltv: parseWadToRatio(allocation.market.lltv),
        marketTotalSupplyUsd: toFiniteNumber(
          allocation.market.state.supplyAssetsUsd
        ),
        marketLiquidityUsd: toFiniteNumber(
          allocation.market.state.liquidityAssetsUsd
        ),
        marketUtilization: toFiniteNumber(allocation.market.state.utilization),
        marketNetApy: toFiniteNumber(marketNetApyRaw),
        utilizationHistory: normalizeSeries(
          allocation.market.historicalState.utilizationRange
        ),
      };
    })
    .sort((a, b) => b.allocationUsd - a.allocationUsd);

  const riskMarketKeys = allocations
    .filter(
      (allocation) =>
        allocation.allocationUsd > 0 && allocation.collateralSymbol !== "Idle"
    )
    .map((allocation) => allocation.marketKey);

  const snapshot: VaultSnapshot = {
    name: vault.name,
    symbol: vault.symbol,
    address: vault.address,
    chainId: vault.chain.id,
    chainNetwork: vault.chain.network,
    totalAssetsUsd,
    netApy: toFiniteNumber(vault.state.netApy),
    performanceFee: toFiniteNumber(vault.state.fee),
    liquidityUsd: toFiniteNumber(vault.liquidity?.usd),
    asOfTimestamp: toFiniteNumber(vault.state.timestamp),
  };

  const currentShareByMarket = buildCurrentShareByMarket(allocations);
  const liquidationShareAtTimestamp = buildHistoricalShareResolver({
    currentShareByMarket,
    allocationHistoryByMarket,
    marketSupplyHistoryByMarket,
  });

  const [collateralAtRisk, positions, liquidations] = await Promise.all([
    fetchCollateralAtRiskSeries(allocations, chainId),
    fetchMarketRiskPositions(riskMarketKeys, chainId),
    fetchVaultLiquidations(riskMarketKeys, chainId, LIQUIDATION_LOOKBACK_DAYS),
  ]);

  const risk = computeRiskAnalysis({
    snapshot,
    allocations,
    collateralAtRisk,
    positions,
    liquidations,
    currentShareByMarket,
    liquidationShareAtTimestamp,
  });

  return {
    snapshot,
    allocations,
    performanceSeries: buildPerformanceSeries(vault.historicalState.sharePriceUsd),
    netApySeries: normalizeSeries(vault.historicalState.netApy),
    supplySeries: normalizeSeries(vault.historicalState.totalAssetsUsd),
    utilizationSeries: buildWeightedUtilizationSeries(
      allocations,
      allocationHistoryByMarket
    ),
    collateralAtRisk,
    risk,
  };
}
