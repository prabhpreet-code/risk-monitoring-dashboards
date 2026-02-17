import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

// Query to get the Reserve ID by name
const GET_RESERVE_BY_NAME = gql`
  query GetReserveByName($name: String!) {
    reserves(where: { name: $name }) {
      id
    }
  }
`;

// Query to get Historical APR using reserve ID
const HISTORICAL_APR_QUERY = gql`
  query GetHistoricalAPR($reserveId: ID!, $startTime: Int!, $endTime: Int!) {
    reserveParamsHistoryItems(
      where: {
        reserve: $reserveId
        timestamp_gte: $startTime
        timestamp_lte: $endTime
      }
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      liquidityRate
      variableBorrowRate
      stableBorrowRate
    }
  }
`;

export function useHistoricAPRByName(
  name: string,
  startTime: number,
  endTime: number
) {
  const [reserveId, setReserveId] = useState(null);

  // Step 1: Query to get the Reserve ID by name
  const [
    getReserveByName,
    { loading: loadingReserve, error: errorReserve, data: reserveData },
  ] = useLazyQuery(GET_RESERVE_BY_NAME);

  // Step 2: Query to get historical APR based on the reserve ID
  const {
    loading: loadingAPR,
    error: errorAPR,
    data: aprData,
  } = useQuery(HISTORICAL_APR_QUERY, {
    skip: !reserveId, // Only run when reserveId is available
    variables: { reserveId, startTime, endTime },
  });

  // Fetch reserveId when name changes
  useEffect(() => {
    if (name) {
      getReserveByName({ variables: { name } });
    }
  }, [name, getReserveByName]);

  // Update reserveId once the reserveData is available
  useEffect(() => {
    if (reserveData && reserveData.reserves.length > 0) {
      setReserveId(reserveData.reserves[0].id);
    }
  }, [reserveData]);

  const aprHistory =
    aprData?.reserveParamsHistoryItems.map((item: {
      timestamp: number;
      liquidityRate: number;
      variableBorrowRate: number;
      stableBorrowRate: number
    }) => ({
      timestamp: item.timestamp * 1000, // Convert to milliseconds
      supplyAPR: item.liquidityRate * 100 / 1e27, // Adjust for decimal scaling
      variableBorrowAPR: item.variableBorrowRate * 100 / 1e27,
      stableBorrowAPR: item.stableBorrowRate * 100 / 1e27,
    })) || [];

  return {
    loading: loadingReserve || loadingAPR,
    error: errorReserve || errorAPR,
    aprHistory,
  };
}
