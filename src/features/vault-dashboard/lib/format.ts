const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const wholeNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatCurrency(
  value: number | null | undefined,
  compact = false
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  if (compact) {
    return compactCurrencyFormatter.format(value);
  }

  return currencyFormatter.format(value);
}

export function formatPercent(
  value: number | null | undefined,
  digits = 2
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return `${(value * 100).toFixed(digits)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return wholeNumberFormatter.format(value);
}

export function formatTimestamp(timestamp: number, includeYear = false): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: includeYear ? "2-digit" : undefined,
  });
}

export function formatAddress(address: string, start = 6, end = 4): string {
  if (!address) {
    return "";
  }
  if (address.length <= start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

