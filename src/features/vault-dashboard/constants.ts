import { TimeRangeKey } from "./types";

export const MORPHO_GRAPHQL_ENDPOINT = "https://api.morpho.org/graphql";
export const DEFAULT_CHAIN_ID = 1;
export const DEFAULT_VAULT_ADDRESS =
  "0xdd0f28e19c1780eb6396170735d45153d261490d";

export const RANGE_OPTIONS: Array<{ key: TimeRangeKey; label: string }> = [
  { key: "30D", label: "30D" },
  { key: "60D", label: "60D" },
  { key: "90D", label: "90D" },
  { key: "YTD", label: "YTD" },
  { key: "ALL", label: "ALL" },
];

