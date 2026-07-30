"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type MarketPrice = {
  symbol: string;
  price: number;
};

const symbols = [
  { value: "BTCUSDT", label: "Bitcoin" },
  { value: "ETHUSDT", label: "Ethereum" },
  { value: "SOLUSDT", label: "Solana" },
];

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
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

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <header>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-400">
            Crypto Signal
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Live cryptocurrency market data
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Select a cryptocurrency to view its current market price.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
          <label
            htmlFor="symbol"
            className="text-sm font-medium uppercase tracking-wider text-zinc-400"
          >
            Cryptocurrency
          </label>

          <select
            id="symbol"
            value={selectedSymbol}
            onChange={(event) => changeSymbol(event.target.value)}
            className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
          >
            {symbols.map((symbol) => (
              <option key={symbol.value} value={symbol.value}>
                {symbol.label} ({symbol.value})
              </option>
            ))}
          </select>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                Current price
              </p>

              <button
                type="button"
                onClick={refreshPrice}
                disabled={isLoading || isRefreshing}
                className="rounded-lg border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500 hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:text-zinc-500"
              >
                {isRefreshing ? "Refreshing..." : "Refresh now"}
              </button>
            </div>

            {isLoading && !marketPrice && (
              <p className="mt-4 text-xl text-zinc-300">
                Loading live market price...
              </p>
            )}

            {marketPrice && (
              <div className="mt-4">
                <p className="text-sm text-zinc-400">
                  {marketPrice.symbol}
                </p>

                <p className="mt-2 text-5xl font-bold tracking-tight">
                  $
                  {marketPrice.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>

                {lastUpdated && (
                  <p className="mt-4 text-sm text-zinc-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}

                {isRefreshing && (
                  <p className="mt-2 text-sm text-emerald-400">
                    Refreshing price...
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-amber-400">
                {error}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}