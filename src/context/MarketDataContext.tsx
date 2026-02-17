import React, { createContext, useContext, useState } from "react";
import { ethers } from "ethers";
import {
  ChainId,
  UiIncentiveDataProvider,
  UiIncentiveDataProviderContext,
  UiPoolDataProvider,
  UiPoolDataProviderContext,
} from "@aave/contract-helpers";
import {
  ComputedUserReserve,
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
} from "@aave/math-utils";
import * as pools from "@bgd-labs/aave-address-book";
import BigNumber from "bignumber.js";
import calculateFearGreedIndex from "@/utils/greedIndex";
export type AaveMarketDataType = {
  v3?: boolean;
  id: string;
  title: string;
  chainId: ChainId;
  api: string;
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: string;
    UI_POOL_DATA_PROVIDER: string;
    UI_INCENTIVE_DATA_PROVIDER: string;
  };
  explorer: string;
  explorerName: string;
  subgraphUrl: string;
};

export const market: AaveMarketDataType = {
  v3: true,
  id: "ETHEREUM_V3",
  title: "Ethereum v3",
  chainId: ChainId.mainnet,
  api: `https://eth-mainnet.g.alchemy.com/v2/Rr1orFKH4xrM32kZ0FKDj327hWQbmhPK`,
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: pools.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
    UI_POOL_DATA_PROVIDER: "0x194324C9Af7f56E22F1614dD82E18621cb9238E7",
    UI_INCENTIVE_DATA_PROVIDER: "0x5a40cDe2b76Da2beD545efB3ae15708eE56aAF9c",
  },
  explorer: "https://etherscan.io/address/{{ADDRESS}}",
  explorerName: "Etherscan",
  subgraphUrl:
    "https://api.goldsky.com/api/public/project_cm03xfb4zf0wq01wz3w3w7nhe/subgraphs/aavev3/v0.0.1/gn",
};

type MarketDataContextType = {
  greedIndex: number;
  healthFactor: string; // Changed to string to prevent overflow
  totalBorrowed: BigNumber;
  availableToBorrow: BigNumber;
  suppliedAssetValue: BigNumber;
  netAssetValue: BigNumber;
  liquidationThreshold: number;
  maxLoanToValue: number;
  currentLoanToValue: number;
  utilizedBorrowingPower: number;
  userReservesData: Array<ComputedUserReserve>;
  fetchMarketData: (address: string) => void;
};

const MarketDataContext = createContext<MarketDataContextType | undefined>(
  undefined
);

export const MarketDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [greedIndex, setGreedIndex] = useState(0);
  const [healthFactor, setHealthFactor] = useState("0"); // Using string
  const [totalBorrowed, setTotalBorrowed] = useState(new BigNumber(0));
  const [availableToBorrow, setAvailableToBorrow] = useState(new BigNumber(0));
  const [suppliedAssetValue, setSuppliedAssetValue] = useState(
    new BigNumber(0)
  );
  const [netAssetValue, setNetAssetValue] = useState(new BigNumber(0));
  const [liquidationThreshold, setLiquidationThreshold] = useState(0);
  const [maxLoanToValue, setMaxLoanToValue] = useState(0);
  const [currentLoanToValue, setCurrentLoanToValue] = useState(0);
  const [utilizedBorrowingPower, setUtilizedBorrowingPower] = useState(0);
  const [userReservesData, setUserReservesData] = useState<
    Array<ComputedUserReserve>
  >([]);

  const fetchMarketData = async (address: string) => {
    const provider = new ethers.providers.StaticJsonRpcProvider(
      market.api,
      market.chainId
    );
    const UiPoolDataCtx: UiPoolDataProviderContext = {
      uiPoolDataProviderAddress: market.addresses.UI_POOL_DATA_PROVIDER,
      provider,
      chainId: market.chainId,
    };
    const poolDataProviderContract = new UiPoolDataProvider(UiPoolDataCtx);

    const UiIncentiveDataCtx: UiIncentiveDataProviderContext = {
      uiIncentiveDataProviderAddress:
        market.addresses.UI_INCENTIVE_DATA_PROVIDER,
      provider,
      chainId: market.chainId,
    };
    const incentiveDataProviderContract = new UiIncentiveDataProvider(
      UiIncentiveDataCtx
    );

    const [reserves, userReserves, reserveIncentives, userIncentives] =
      await Promise.all([
        poolDataProviderContract.getReservesHumanized({
          lendingPoolAddressProvider:
            market.addresses.LENDING_POOL_ADDRESS_PROVIDER,
        }),
        poolDataProviderContract.getUserReservesHumanized({
          lendingPoolAddressProvider:
            market.addresses.LENDING_POOL_ADDRESS_PROVIDER,
          user: address,
        }),
        incentiveDataProviderContract.getReservesIncentivesDataHumanized({
          lendingPoolAddressProvider:
            market.addresses.LENDING_POOL_ADDRESS_PROVIDER,
        }),
        incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
          lendingPoolAddressProvider:
            market.addresses.LENDING_POOL_ADDRESS_PROVIDER,
          user: address,
        }),
      ]);

    const { baseCurrencyData } = reserves;

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const extendedReservesData = reserves.reservesData.map((reserve) => ({
      ...reserve,
      originalId: Number(reserve.id),
    }));

    const formattedPoolReserves = formatReservesAndIncentives({
      reserves: extendedReservesData,
      currentTimestamp,
      marketReferenceCurrencyDecimals:
        baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd:
        baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      reserveIncentives,
    });

    const userSummary = formatUserSummaryAndIncentives({
      currentTimestamp,
      marketReferencePriceInUsd:
        baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      marketReferenceCurrencyDecimals:
        baseCurrencyData.marketReferenceCurrencyDecimals,
      userReserves: userReserves.userReserves,
      formattedReserves: formattedPoolReserves,
      userEmodeCategoryId: userReserves.userEmodeCategoryId,
      reserveIncentives,
      userIncentives,
    });


    const greedIndex = await calculateFearGreedIndex({
      healthFactor: 1 - Number(userSummary.healthFactor),
      totalBorrowed: Number(userSummary.totalBorrowsUSD),
      availableToBorrow: 1 - Number(userSummary.availableBorrowsUSD),
      suppliedAssetValue:
        1 - Number(userSummary.totalCollateralMarketReferenceCurrency),
      netAssetValue:
        1 - Number(userSummary.totalCollateralMarketReferenceCurrency),
      liquidationThreshold: Number(userSummary.currentLiquidationThreshold),
      maxLoanToValue: Number(userSummary.currentLoanToValue),
      currentLoanToValue:
        Number(userSummary.totalBorrowsMarketReferenceCurrency) /
        Number(userSummary.totalCollateralMarketReferenceCurrency),
      utilizedBorrowingPower: Number(userSummary.currentLoanToValue),
    });

    setGreedIndex(greedIndex);

    // Update state, converting large numbers to strings to prevent overflow
    setHealthFactor(userSummary.healthFactor.toString()); // Using string
    setTotalBorrowed(new BigNumber(userSummary.totalBorrowsUSD.toString())); // Using BigNumber from string
    setAvailableToBorrow(
      new BigNumber(userSummary.availableBorrowsUSD.toString())
    );
    setSuppliedAssetValue(
      new BigNumber(
        userSummary.totalCollateralMarketReferenceCurrency.toString()
      )
    );
    setNetAssetValue(
      new BigNumber(
        userSummary.totalCollateralMarketReferenceCurrency.toString()
      ).minus(
        new BigNumber(
          userSummary.totalBorrowsMarketReferenceCurrency.toString()
        )
      )
    );
    setLiquidationThreshold(Number(userSummary.currentLiquidationThreshold));
    setMaxLoanToValue(Number(userSummary.currentLoanToValue));
    setCurrentLoanToValue(
      Number(userSummary.totalBorrowsMarketReferenceCurrency) /
        Number(userSummary.totalCollateralMarketReferenceCurrency)
    );
    setUtilizedBorrowingPower(Number(userSummary.currentLoanToValue));
    setUserReservesData(userSummary.userReservesData);
  };

  return (
    <MarketDataContext.Provider
      value={{
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
        userReservesData,
        fetchMarketData,
      }}
    >
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error("useMarketData must be used within a MarketDataProvider");
  }
  return context;
};
