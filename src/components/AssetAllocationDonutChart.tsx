import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useMarketData } from "@/context/MarketDataContext";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ReserveData {
  reserve: {
    name: string;
  };
  underlyingBalanceUSD: string;
  stableBorrowsUSD: string;
  variableBorrowsUSD: string;
  usageAsCollateralEnabledOnUser: boolean;
}

const AssetAllocationCharts: React.FC = () => {
  const { userReservesData } = useMarketData() as {
    userReservesData: ReserveData[];
  };

  const suppliedLabels = userReservesData
    .filter((asset) => Number(asset.underlyingBalanceUSD) > 0)
    .map((asset) => asset.reserve.name);

  const suppliedData = userReservesData
    .filter((asset) => Number(asset.underlyingBalanceUSD) > 0)
    .map((asset) => Number(asset.underlyingBalanceUSD));

  const borrowedLabels = userReservesData
    .filter(
      (asset) =>
        Number(asset.stableBorrowsUSD) > 0 ||
        Number(asset.variableBorrowsUSD) > 0
    )
    .map((asset) => asset.reserve.name);

  const borrowedData = userReservesData
    .filter(
      (asset) =>
        Number(asset.stableBorrowsUSD) > 0 ||
        Number(asset.variableBorrowsUSD) > 0
    )
    .map(
      (asset) =>
        Number(asset.stableBorrowsUSD) + Number(asset.variableBorrowsUSD)
    );

  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#66FF66",
  ];

  interface ChartData {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      hoverBackgroundColor: string[];
    }[];
  }

  const createChartData = (labels: string[], data: number[]): ChartData => ({
    labels: labels,
    datasets: [
      {
        label: "Allocation",
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        hoverBackgroundColor: colors.slice(0, labels.length),
      },
    ],
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: { label: string; raw: number }) {
            return `${tooltipItem.label}: $${tooltipItem.raw.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`;
          },
        },
      },
    },
    cutout: "70%",
  };

  return (
    <div className="flex flex-wrap justify-around gap-4 max-w-full py-4">
      {/* Supplied Assets Chart */}
      <div className="flex flex-col items-center h-[500px] max-h-[550px] w-full max-w-[600px] border rounded-lg shadow-md p-4 bg-white overflow-hidden">
        <h3 className="text-xl font-semibold mb-4">
          Supplied Assets Allocation
        </h3>
        <div className="w-full h-full">
          <Doughnut
            data={createChartData(suppliedLabels, suppliedData)}
            options={options as any}
          />
        </div>
      </div>

      {/* Borrowed Assets Chart */}
      <div className="flex flex-col items-center h-[500px] max-h-[550px] w-full max-w-[600px] border rounded-lg shadow-md p-4 bg-white overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">
          Borrowed Assets Allocation
        </h3>
        <div className="w-full h-full">
          <Doughnut
            data={createChartData(borrowedLabels, borrowedData)}
            options={options as any}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetAllocationCharts;
