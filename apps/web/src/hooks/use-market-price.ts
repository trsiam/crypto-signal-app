"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MarketPrice = {
  symbol: string;
  price: number;
};

export function useMarketPrice(initialSymbol: string) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [marketPrice, setMarketPrice] = useState<MarketPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const requestInProgress = useRef(false);
  const hasLoadedPrice = useRef(false);
  const requestVersion = useRef(0);

  const loadMarketPrice = useCallback(async () => {
    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;

    const currentRequestVersion = requestVersion.current;

    if (hasLoadedPrice.current) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = await fetch(
        `/api/market/price/${selectedSymbol}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Could not load the cryptocurrency price");
      }

      const data: MarketPrice = await response.json();

      if (currentRequestVersion !== requestVersion.current) {
        return;
      }

      setMarketPrice(data);
      setLastUpdated(new Date());
      hasLoadedPrice.current = true;
    } catch {
      if (currentRequestVersion !== requestVersion.current) {
        return;
      }

      setError(
        hasLoadedPrice.current
          ? "The latest refresh failed. Showing the last available price."
          : "Live market data is currently unavailable.",
      );
    } finally {
      if (currentRequestVersion === requestVersion.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }

      requestInProgress.current = false;
    }
  }, [selectedSymbol]);

  useEffect(() => {
    const initialRequest = window.setTimeout(() => {
      void loadMarketPrice();
    }, 0);

    const refreshInterval = window.setInterval(() => {
      void loadMarketPrice();
    }, 5_000);

    return () => {
      window.clearTimeout(initialRequest);
      window.clearInterval(refreshInterval);
    };
  }, [loadMarketPrice]);

  function changeSymbol(symbol: string) {
    requestVersion.current += 1;
    requestInProgress.current = false;
    hasLoadedPrice.current = false;

    setSelectedSymbol(symbol);
    setMarketPrice(null);
    setLastUpdated(null);
    setError(null);
    setIsLoading(true);
    setIsRefreshing(false);
  }

  function refreshPrice() {
    void loadMarketPrice();
  }

  return {
    selectedSymbol,
    marketPrice,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    changeSymbol,
    refreshPrice,
  };
}