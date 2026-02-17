import { useMarketData } from "@/context/MarketDataContext";
import React, { useEffect } from "react";


const MarketStats: React.FC<{ address: string }> = ({ address }) => {
  const {
    greedIndex,
    healthFactor,
    totalBorrowed,
    availableToBorrow,
    suppliedAssetValue,
    netAssetValue,
    liquidationThreshold,
    maxLoanToValue,
    currentLoanToValue,
    utilizedBorrowingPower,
    fetchMarketData,
  } = useMarketData();

  useEffect(() => {
    // Fetch market data when the component mounts
    fetchMarketData(address);

  }, [address]);

  return (
    <div>
      <h2>Market Stats</h2>
      <p>Greed Index: {greedIndex}</p>
      <p>Health Factor: {Number(healthFactor).toFixed(2)}</p>
      <p>Total Borrowed: ${Number(totalBorrowed).toFixed(2)}</p>
      <p>Available to Borrow: ${Number(availableToBorrow).toFixed(2)}</p>
      <p>Supplied Asset Value: ${Number(suppliedAssetValue).toFixed(2)}</p>
      <p>Net Asset Value: ${Number(netAssetValue).toFixed(2)}</p>
      <p>Liquidation Threshold: {liquidationThreshold}%</p>
      <p>Max Loan to Value: {maxLoanToValue}%</p>
      <p>Current Loan to Value: {currentLoanToValue}%</p>
      <p>Utilized Borrowing Power: {utilizedBorrowingPower}%</p>
    </div>
  );
};

export default MarketStats;
