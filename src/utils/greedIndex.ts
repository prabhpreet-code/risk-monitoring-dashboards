type Metrics = {
    healthFactor: number; // Inverted for greed (higher health factor -> fear)
    totalBorrowed: number; // Direct greed (higher borrowing -> greed)
    availableToBorrow: number; // Inverted for greed (more available -> less greed)
    suppliedAssetValue: number; // Higher collateralization -> fear
    netAssetValue: number; // Higher security -> fear
    liquidationThreshold: number; // Higher threshold -> greed
    maxLoanToValue: number; // Higher max LTV -> greed
    currentLoanToValue: number; // Higher current LTV -> greed
    utilizedBorrowingPower: number; // Higher utilization -> greed
  };
  
  type Weights = {
    healthFactorWeight: number;
    totalBorrowedWeight: number;
    availableToBorrowWeight: number;
    suppliedAssetValueWeight: number;
    netAssetValueWeight: number;
    liquidationThresholdWeight: number;
    maxLoanToValueWeight: number;
    currentLoanToValueWeight: number;
    utilizedBorrowingPowerWeight: number;
  };
  const weightsDefault: Weights = {
    healthFactorWeight: 0.12,
    totalBorrowedWeight: 0.15,
    availableToBorrowWeight: 0.1,
    suppliedAssetValueWeight: 0.1,
    netAssetValueWeight: 0.1,
    liquidationThresholdWeight: 0.1,
    maxLoanToValueWeight: 0.1,
    currentLoanToValueWeight: 0.08,
    utilizedBorrowingPowerWeight: 0.15,
  };
  
  export default function calculateFearGreedIndex(
    metrics: Metrics,
    weights: Weights = weightsDefault
  ): number {
    const {
      healthFactor,
      totalBorrowed,
      availableToBorrow,
      suppliedAssetValue,
      netAssetValue,
      liquidationThreshold,
      maxLoanToValue,
      currentLoanToValue,
      utilizedBorrowingPower,
    } = metrics;
  
    const {
      healthFactorWeight,
      totalBorrowedWeight,
      availableToBorrowWeight,
      suppliedAssetValueWeight,
      netAssetValueWeight,
      liquidationThresholdWeight,
      maxLoanToValueWeight,
      currentLoanToValueWeight,
      utilizedBorrowingPowerWeight,
    } = weights;
  
    const totalWeight =
      healthFactorWeight +
      totalBorrowedWeight +
      availableToBorrowWeight +
      suppliedAssetValueWeight +
      netAssetValueWeight +
      liquidationThresholdWeight +
      maxLoanToValueWeight +
      currentLoanToValueWeight +
      utilizedBorrowingPowerWeight;
  
    // Normalize and calculate each weighted metric contribution (values should be between 0-1)
    const weightedHealthFactor = (1 - healthFactor) * healthFactorWeight; // Inverted for greed
    const weightedTotalBorrowed = totalBorrowed * totalBorrowedWeight;
    const weightedAvailableToBorrow = (1 - availableToBorrow) * availableToBorrowWeight; // Inverted for greed
    const weightedSuppliedAssetValue = (1 - suppliedAssetValue) * suppliedAssetValueWeight; // Higher collateral -> fear
    const weightedNetAssetValue = (1 - netAssetValue) * netAssetValueWeight; // Higher security -> fear
    const weightedLiquidationThreshold = liquidationThreshold * liquidationThresholdWeight;
    const weightedMaxLoanToValue = maxLoanToValue * maxLoanToValueWeight;
    const weightedCurrentLoanToValue = currentLoanToValue * currentLoanToValueWeight;
    const weightedUtilizedBorrowingPower = utilizedBorrowingPower * utilizedBorrowingPowerWeight;
  
    // Sum of weighted metrics
    const fearGreedIndex =
      (weightedHealthFactor +
        weightedTotalBorrowed +
        weightedAvailableToBorrow +
        weightedSuppliedAssetValue +
        weightedNetAssetValue +
        weightedLiquidationThreshold +
        weightedMaxLoanToValue +
        weightedCurrentLoanToValue +
        weightedUtilizedBorrowingPower) /
      totalWeight;
  
    // Scale the index to a percentage (0 - 100)
    return Math.min(Math.max(fearGreedIndex * 100, 0), 100);
  }
