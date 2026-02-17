import React, { useState } from "react";
import HistoricAPRChart from "./APRHistoryChart"; // Ensure this path is correct
import { useMarketData } from "@/context/MarketDataContext";

const HistoricAPRChartWithDropdown = () => {
  const { userReservesData } = useMarketData(); // Assuming `userReservesData` contains assets
  const [selectedAsset, setSelectedAsset] = useState(userReservesData[0]?.reserve.name || "");

  const handleAssetChange = (event: React.ChangeEvent<HTMLSelectElement> ) => {
    setSelectedAsset(event.target.value);
  };

  return (
    <div className="p-12 rounded-lg bg-white shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Asset APR History</h2>

      {/* Dropdown for selecting an asset */}
      <div className="mb-6">
        <label htmlFor="assetSelect" className="block text-sm font-medium text-gray-700 mb-2">
          Select Asset
        </label>
        <select
          id="assetSelect"
          value={selectedAsset}
          onChange={handleAssetChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {userReservesData.map((reserve) => (
            <option key={reserve.reserve.id} value={reserve.reserve.name}>
              {reserve.reserve.name} ({reserve.reserve.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Display the chart for the selected asset */}
      {selectedAsset && (
        <HistoricAPRChart assetName={selectedAsset} />
      )}
    </div>
  );
};

export default HistoricAPRChartWithDropdown;
