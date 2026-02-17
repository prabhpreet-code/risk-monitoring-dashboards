export type TimeRangeKey = "30D" | "60D" | "90D" | "YTD" | "ALL";
export type TimeseriesInterval = "HOUR" | "DAY" | "WEEK" | "MONTH";

export type TimeseriesPoint = {
  x: number;
  y: number | null;
};

export type TimeRangeConfig = {
  startTimestamp: number;
  endTimestamp: number;
  interval: TimeseriesInterval;
};

export type VaultAllocationRow = {
  marketKey: string;
  collateralSymbol: string;
  loanSymbol: string;
  allocationUsd: number;
  allocationPct: number;
  lltv: number | null;
  oracleType: string | null;
  oracleAddress: string | null;
  oracleFeedAddresses: string[];
  warningCount: number;
  redWarningCount: number;
  yellowWarningCount: number;
  warningTypes: string[];
  marketTotalSupplyUsd: number;
  marketLiquidityUsd: number;
  marketUtilization: number;
  marketNetApy: number;
  utilizationHistory: TimeseriesPoint[];
};

export type CollateralAtRiskPoint = {
  collateralPriceRatio: number;
  collateralUsd: number;
};

export type CollateralAtRiskSeries = {
  marketKey: string;
  label: string;
  points: CollateralAtRiskPoint[];
};

export type VaultSnapshot = {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  chainNetwork: string;
  totalAssetsUsd: number;
  netApy: number;
  performanceFee: number;
  liquidityUsd: number;
  asOfTimestamp: number;
};

export type RiskScorecard = {
  weightedLltv: number | null;
  weightedBorrowLtv: number | null;
  lltvHeadroom: number | null;
  collateralCoverageRatio: number | null;
  liquidityCoverage: number | null;
  topMarketConcentration: number;
  concentrationHhi: number;
  nearLiquidationBorrowUsd: number;
  stressCollateralAtRisk15PctUsd: number;
  totalBorrowUsd: number;
  totalCollateralUsd: number;
  activeBorrowers: number;
  activePositions: number;
};

export type OracleRiskMarketRow = {
  marketKey: string;
  marketLabel: string;
  allocationUsd: number;
  allocationPct: number;
  hasOracle: boolean;
  oracleType: string | null;
  oracleAddress: string | null;
  feedCount: number;
  feedAddresses: string[];
  warningCount: number;
  redWarningCount: number;
  yellowWarningCount: number;
  warningTypes: string[];
};

export type OracleRiskScorecard = {
  coveredAllocationPct: number | null;
  uncoveredAllocationUsd: number;
  oracleContractHhi: number | null;
  topOracleContractConcentration: number | null;
  uniqueOracleContracts: number;
  feedDependencyHhi: number | null;
  topFeedDependencyConcentration: number | null;
  uniqueFeeds: number;
  warningCount: number;
  redWarningCount: number;
  yellowWarningCount: number;
  warningMarkets: number;
  warningAllocationPct: number | null;
  severeWarningAllocationPct: number | null;
  liquidationErrorToleranceAvg: number | null;
  liquidationErrorToleranceP10: number | null;
  lowToleranceBorrowUsd: number;
  breachedToleranceBorrowUsd: number;
};

export type OracleRiskAnalysis = {
  scorecard: OracleRiskScorecard;
  markets: OracleRiskMarketRow[];
  methodologyNotes: string[];
};

export type RiskHealthBucket = {
  label: string;
  borrowerCount: number;
  borrowUsd: number;
  shareOfBorrow: number;
};

export type LiquidationIncident = {
  id: string;
  timestamp: number;
  hash: string;
  marketKey: string;
  marketLabel: string;
  repaidUsd: number;
  seizedUsd: number;
  badDebtUsd: number;
};

export type LiquidationSummary = {
  windowDays: number;
  incidentCount: number;
  repaidUsd: number;
  seizedUsd: number;
  badDebtUsd: number;
};

export type VaultRiskAnalysis = {
  scorecard: RiskScorecard;
  oracle: OracleRiskAnalysis;
  healthBuckets: RiskHealthBucket[];
  liquidationSummary30d: LiquidationSummary;
  liquidationSummary90d: LiquidationSummary;
  recentLiquidations: LiquidationIncident[];
  methodologyNotes: string[];
};

export type VaultReadModel = {
  snapshot: VaultSnapshot;
  allocations: VaultAllocationRow[];
  performanceSeries: TimeseriesPoint[];
  netApySeries: TimeseriesPoint[];
  supplySeries: TimeseriesPoint[];
  utilizationSeries: TimeseriesPoint[];
  collateralAtRisk: CollateralAtRiskSeries[];
  risk: VaultRiskAnalysis;
};
