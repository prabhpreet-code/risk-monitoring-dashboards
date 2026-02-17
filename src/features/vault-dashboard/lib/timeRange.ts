import { TimeRangeConfig, TimeRangeKey } from "../types";

const DAY_IN_SECONDS = 24 * 60 * 60;
const HOUR_IN_SECONDS = 60 * 60;

function startOfUtcDay(date: Date): number {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0
  );
}

export function getTimeRangeConfig(range: TimeRangeKey): TimeRangeConfig {
  const nowDate = new Date();
  const now = Math.floor(nowDate.getTime() / 1000);
  const startOfToday = Math.floor(startOfUtcDay(nowDate) / 1000);

  if (range === "30D") {
    return {
      startTimestamp: startOfToday - 30 * DAY_IN_SECONDS,
      endTimestamp: now,
      interval: "DAY",
    };
  }

  if (range === "60D") {
    return {
      startTimestamp: startOfToday - 60 * DAY_IN_SECONDS,
      endTimestamp: now,
      interval: "DAY",
    };
  }

  if (range === "90D") {
    return {
      startTimestamp: startOfToday - 90 * DAY_IN_SECONDS,
      endTimestamp: now,
      interval: "DAY",
    };
  }

  if (range === "YTD") {
    const yearStart = Math.floor(
      Date.UTC(nowDate.getUTCFullYear(), 0, 1, 0, 0, 0) / 1000
    );
    return {
      startTimestamp: yearStart,
      endTimestamp: now,
      interval: "DAY",
    };
  }

  return {
    startTimestamp: Math.floor(Date.UTC(2024, 0, 1, 0, 0, 0) / 1000),
    endTimestamp: now + HOUR_IN_SECONDS,
    interval: "WEEK",
  };
}

