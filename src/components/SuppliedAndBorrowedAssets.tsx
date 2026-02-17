import React from "react";
import { useMarketData } from "@/context/MarketDataContext";
import { WobbleCard } from "./WobbleCard";

const SuppliedAndBorrowedAssets = () => {
  const { userReservesData, totalBorrowed, suppliedAssetValue } =
    useMarketData();

  return (
    <div className="flex flex-col lg:flex-row lg:space-x-8 p-6 rounded-2xl text-gray-800 bg-softPeach border border-[#f5c4a8] space-y-8 lg:space-y-0">
      {/* Supplied Assets Section */}
      <div className="flex-1 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">
            Supplied Assets
          </h3>
          <div className="text-2xl font-bold text-black">
            ${" "}
            {suppliedAssetValue
              ? suppliedAssetValue.toNumber().toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "N/A"}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* arrange cards based on balance */}
          {userReservesData
            .filter((reserve) => Number(reserve.underlyingBalanceUSD) > 0)
            .sort((a, b) => Number(b.underlyingBalanceUSD) - Number(a.underlyingBalanceUSD))
            .map((reserve) => (
              <WobbleCard
                key={reserve.reserve.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border border-gray-300 shadow-md bg-white min-h-[100px] lg:min-h-[120px]"
              >
                <div className="flex flex-col items-start md:flex-row space-y-2 md:space-y-0 md:space-x-6 w-full">
                  <h3 className="text-lg font-bold text-gray-900">
                    {reserve.reserve.name} ({reserve.reserve.symbol})
                  </h3>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Supply APY:</span>{" "}
                    {Number(reserve.reserve.supplyAPY).toFixed(2)}%
                  </p>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">User Balance (USD):</span> $
                  {Number(reserve.underlyingBalanceUSD).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
              </WobbleCard>
            ))}
        </div>
      </div>

      {/* Borrowed Assets Section */}
      <div className="flex-1 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">
            Borrowed Assets
          </h3>
          <div className="text-2xl font-bold text-black">
            ${" "}
            {totalBorrowed
              ? totalBorrowed.toNumber().toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "N/A"}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {userReservesData
            .filter(
              (reserve) =>
                Number(reserve.stableBorrowsUSD) > 0 ||
                Number(reserve.variableBorrowsUSD) > 0
            )
            .sort((a, b) => Number(b.variableBorrowsUSD) - Number(a.variableBorrowsUSD))
            .map((reserve) => (
              <WobbleCard
                key={reserve.reserve.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border border-gray-300 shadow-md bg-white min-h-[100px] lg:min-h-[120px]"
              >
                <div className="flex flex-col items-start md:flex-row space-y-2 md:space-y-0 md:space-x-6 w-full">
                  <h3 className="text-lg font-bold text-gray-900">
                    {reserve.reserve.name} ({reserve.reserve.symbol})
                  </h3>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Borrow APY (Variable):</span>{" "}
                    {Number(reserve.reserve.variableBorrowAPY).toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Borrow APY (Stable):</span>{" "}
                    {Number(reserve.reserve.stableBorrowAPY).toFixed(2)}%
                  </p>
                </div>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">
                      Variable Borrowed (USD):
                    </span>{" "}
                    $
                    {Number(reserve.variableBorrowsUSD).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Stable Borrowed (USD):</span>{" "}
                    $
                    {Number(reserve.stableBorrowsUSD).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </WobbleCard>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SuppliedAndBorrowedAssets;
