"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_CHAIN_ID,
  DEFAULT_VAULT_ADDRESS,
} from "../constants";
import { fetchVaultReadModel } from "../lib/morpho";
import { getTimeRangeConfig } from "../lib/timeRange";
import { TimeRangeKey, VaultReadModel } from "../types";

type VaultDashboardContextValue = {
  data: VaultReadModel | null;
  loading: boolean;
  error: string | null;
  range: TimeRangeKey;
  setRange: (range: TimeRangeKey) => void;
  vaultAddress: string;
  setVaultAddress: (address: string) => void;
  refetch: () => Promise<void>;
};

const VaultDashboardContext = createContext<VaultDashboardContextValue | undefined>(
  undefined
);

export const VaultDashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<VaultReadModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRangeKey>("30D");
  const [vaultAddress, setVaultAddress] = useState<string>(DEFAULT_VAULT_ADDRESS);
  const requestIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const rangeConfig = getTimeRangeConfig(range);
      const readModel = await fetchVaultReadModel({
        vaultAddress,
        chainId: DEFAULT_CHAIN_ID,
        range: rangeConfig,
      });
      if (requestId !== requestIdRef.current) {
        return;
      }
      setData(readModel);
    } catch (fetchError) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to fetch vault data"
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [range, vaultAddress]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return (
    <VaultDashboardContext.Provider
      value={{
        data,
        loading,
        error,
        range,
        setRange,
        vaultAddress,
        setVaultAddress,
        refetch,
      }}
    >
      {children}
    </VaultDashboardContext.Provider>
  );
};

export function useVaultDashboard(): VaultDashboardContextValue {
  const context = useContext(VaultDashboardContext);
  if (!context) {
    throw new Error(
      "useVaultDashboard must be used within VaultDashboardProvider"
    );
  }
  return context;
}
