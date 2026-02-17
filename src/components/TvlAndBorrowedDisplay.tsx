"use client";

import { AAVE_DATA_PROVIDER, RPC_URL } from "@/shared/constant";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

const AAVE_API_URL = "https://api.llama.fi/protocol/aave";

const TvlAndBorrowedDisplay = () => {
  const [tvl, setTvl] = useState<number | null>(null); // Total Supplied
  const [borrowed, setBorrowed] = useState<number | null>(null); // Total Borrowed
  const [greedIndex, setGreedIndex] = useState<number | null>(null); // Greed Index
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalReserves, setTotalReserves] = useState<number | null>(null);

  // Fetch the total number of reserves from the Aave contract
  useEffect(() => {
    async function fetchReserveCount() {
      try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          AAVE_DATA_PROVIDER,
          [
            {
              inputs: [],
              name: "getAllReservesTokens",
              outputs: [
                {
                  components: [
                    { internalType: "string", name: "symbol", type: "string" },
                    {
                      internalType: "address",
                      name: "tokenAddress",
                      type: "address",
                    },
                  ],
                  internalType: "struct IPoolDataProvider.TokenData[]",
                  name: "",
                  type: "tuple[]",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
          ],
          provider
        );

        const reserves = await contract.getAllReservesTokens();
        setTotalReserves(reserves.length);
      } catch (error) {
        console.error("Error fetching reserves count:", error);
      }
    }

    fetchReserveCount();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(AAVE_API_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();
        const supplied = data.currentChainTvls?.["Ethereum"] || 0; // Ethereum TVL
        const borrowed = data.currentChainTvls?.["Ethereum-borrowed"] || 0; // Ethereum Borrowed

        setTvl(supplied);
        setBorrowed(borrowed);

        // Calculate Greed Index
        const greed =
          (1 - (supplied - borrowed - 0.15 * supplied) / supplied) * 100;

        setGreedIndex(greed);
      } catch (err: unknown) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading TVL, Borrowed, and Greed Index...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 rounded-md">
      <h2 className="text-lg font-semibold">AAVE Metrics</h2>
      <p className="text-xl font-bold text-green-600">
        TVL (Supplied): {parseFloat((tvl! / 1e9).toFixed(2)).toLocaleString()}{" "}
        Billion USD
      </p>
      <p className="text-xl font-bold text-red-600">
        Borrowed: {parseFloat((borrowed! / 1e9).toFixed(2)).toLocaleString()}{" "}
        Billion USD
      </p>
      <div className="flex justify-between py-3">
        <p className=" font-bold text-orange-500">
          Greed Index: {greedIndex ? greedIndex.toFixed(2) : "N/A"}%
        </p>
        <p className=" font-bold">
          Total Reserves: {totalReserves || "Loading..."}
        </p>
      </div>
    </div>
  );
};

export default TvlAndBorrowedDisplay;
