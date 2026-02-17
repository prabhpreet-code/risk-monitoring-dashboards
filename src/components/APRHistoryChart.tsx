import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useHistoricAPRByName } from "@/hooks/useHistoricalAPR";

export interface APRHistoryPoint {
  timestamp: number;
  supplyAPR: number;
  variableBorrowAPR: number;
  stableBorrowAPR: number;
}

export interface UseHistoricAPRResponse {
  loading: boolean;
  error: Error | null;
  aprHistory: APRHistoryPoint[];
}


// Register Chart.js components
ChartJS.register(CategoryScale, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend);

const HistoricAPRChart = ({ assetName }: { assetName: string}) => {
  const endTime = Math.floor(Date.now() / 1000);
  const startTime = endTime - 30 * 24 * 60 * 60; // 30 days ago

  const { loading, error, aprHistory } = useHistoricAPRByName(
    assetName,
    startTime,
    endTime
  );

  // Chart data structure
  const chartData = {
    labels: aprHistory.map((point: APRHistoryPoint) =>
      new Date(point.timestamp).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Supply APR",
        data: aprHistory.map((point : APRHistoryPoint) => point.supplyAPR * 100),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
      },
      {
        label: "Variable Borrow APR",
        data: aprHistory.map((point : APRHistoryPoint) => point.variableBorrowAPR * 100),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
      },
      {
        label: "Stable Borrow APR",
        data: aprHistory.map((point : APRHistoryPoint) => point.stableBorrowAPR * 100),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "APR (%)",
        },
        ticks: {
          callback: (value: string | number) => `${value}%`,
        },
      },
    },
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data: {error.message}</p>;

  return (
    <div>
      <h2>Historical APR for {assetName}</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default HistoricAPRChart;
