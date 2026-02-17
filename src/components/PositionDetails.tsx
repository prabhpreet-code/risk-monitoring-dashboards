import { useMarketData } from "@/context/MarketDataContext";
import { ethers } from "ethers";
import React, { useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";

const PositionDetails = ({ address }: { address: string }) => {
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
    fetchMarketData,
  } = useMarketData();

  useEffect(() => {
    // Validate the address before fetching market data
    if (ethers.utils.isAddress(address)) {
      fetchMarketData(address);
    } else {
      console.warn("Invalid Ethereum address entered");
    }
  }, [address]);

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Helper function for formatting percentage
  const formatPercentage = (value: number) =>
    `${(value * 100).toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}%`;

  return (
    <div className="flex flex-col p-4 rounded-lg text-gray-800 space-y-4 bg-softPeach border-[#f5c4a8] border">
      <div className="flex">
        
        <div className="font-semibold text-black flex items-center text-2xl">
          Health Factor:{" "}
          <span className="text-yellow-600">
            {healthFactor ? Number(healthFactor).toFixed(2) : "N/A"}
          </span>
          <FaInfoCircle className="inline ml-2 text-[#9B9EA1]" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg px-2 py-2 border-[#f5c4a8] border">
          <span className="text-sm font-light">
            Total Borrowed{" "}
            <FaInfoCircle className="inline ml-2 text-[#9B9EA1] " />
          </span>
          <p className="text-base font-semibold">
            {totalBorrowed ? formatCurrency(totalBorrowed.toNumber()) : "N/A"}
          </p>
        </div>
        <div className="bg-white rounded-lg px-2 py-2 border-[#f5c4a8] border">
          <span className="text-sm font-light">
            Available to Borrow
            <FaInfoCircle className="inline ml-2 text-[#9B9EA1] " />
          </span>
          <p className="text-base font-semibold">
            {availableToBorrow ? formatCurrency(availableToBorrow.toNumber()) : "N/A"}
          </p>
        </div>
        <div className="bg-white rounded-lg px-2 py-2 border-[#f5c4a8] border">
          <span className="text-sm font-light">
            Supplied Asset Value
            <FaInfoCircle className="inline ml-2 text-[#9B9EA1] " />
          </span>
          <p className="text-base font-semibold">
            {suppliedAssetValue ? formatCurrency(suppliedAssetValue.toNumber()) : "N/A"}
          </p>
        </div>

        <div className="bg-white rounded-lg px-2 py-2 border-[#f5c4a8] border">
          <span className="text-sm font-light">
            Net Asset Value
            <FaInfoCircle className="inline ml-2 text-[#9B9EA1] " />
          </span>
          <p className="text-base font-semibold">
            {netAssetValue ? formatCurrency(netAssetValue.toNumber()) : "N/A"}
          </p>
        </div>
        <div className="bg-white rounded-lg px-2 py-2 border-[#f5c4a8] border">
          <span className="text-sm font-light">
            Liquidation Threshold{" "}
            <FaInfoCircle className="inline ml-2 text-[#9B9EA1] " />
          </span>
          <p className="text-base font-semibold">
            {liquidationThreshold
              ? formatPercentage(liquidationThreshold)
              : "N/A"}
          </p>
        </div>
        <div className="bg-white rounded-lg px-2 py-2 border-[#f5c4a8] border">
          <span className="text-sm font-light">
            Max Loan to Value{" "}
            <FaInfoCircle className="inline ml-2 text-[#9B9EA1]" />
          </span>
          <p className="text-base font-semibold">
            {maxLoanToValue ? formatPercentage(maxLoanToValue) : "N/A"}
          </p>
        </div>
        <div className="bg-white rounded-lg px-2 py-2 border-[#f5c4a8] border">
          <span className="text-sm font-light">
            Current Loan to Value{" "}
            <FaInfoCircle className="inline ml-2 text-[#9B9EA1]" />
          </span>
          <p className="text-base font-semibold">
            {currentLoanToValue ? formatPercentage(currentLoanToValue) : "N/A"}
          </p>
        </div>
        <div className="bg-white rounded-lg px-2 py-2 border-[#f5c4a8] border">
          <span className="text-sm font-light">
            Utilized Borrowing Power
            <FaInfoCircle className="inline ml-2 text-[#9B9EA1]" />
          </span>
          <p className="text-base font-semibold">
            {utilizedBorrowingPower
              ? formatPercentage(utilizedBorrowingPower)
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PositionDetails;
