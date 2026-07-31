"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MarketCandle = {
  open_time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  close_time: number;
};

type UseMarketCandlesOptions = {
  symbol: string;
  interval?: string;
  limit?: number;
};

export function useMarketCandles({
  symbol,
  interval = "1h",
  limit = 100,
}: UseMarketCandlesOptions) {
  const [candles, setCandles] = useState<MarketCandle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const requestInProgress = useRef(false);
  const hasLoadedCandles = useRef(false);
  const requestVersion = useRef(0);

  const loadCandles = useCallback(async () => {
    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;

    const currentRequestVersion = requestVersion.current;

    if (hasLoadedCandles.current) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const query = new URLSearchParams({
        interval,
        limit: String(limit),
      });

      const response = await fetch(
        `/api/market/candles/${symbol}?${query.toString()}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Could not load candle data");
      }

      const data: MarketCandle[] = await response.json();

      if (currentRequestVersion !== requestVersion.current) {
        return;
      }

      setCandles(data);
      setLastUpdated(new Date());
      hasLoadedCandles.current = true;
    } catch {
      if (currentRequestVersion !== requestVersion.current) {
        return;
      }

      setError(
        hasLoadedCandles.current
          ? "The latest candle refresh failed. Showing the last available data."
          : "Historical market data is currently unavailable.",
      );
    } finally {
      if (currentRequestVersion === requestVersion.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }

      requestInProgress.current = false;
    }
  }, [interval, limit, symbol]);

  useEffect(() => {
    requestVersion.current += 1;
    requestInProgress.current = false;
    hasLoadedCandles.current = false;

    const initialRequest = window.setTimeout(() => {
      void loadCandles();
    }, 0);

    return () => {
      window.clearTimeout(initialRequest);
    };
  }, [loadCandles]);

  function refreshCandles() {
    void loadCandles();
  }

  return {
    candles,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refreshCandles,
  };
}