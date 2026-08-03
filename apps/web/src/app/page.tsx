"use client";
import { useState } from "react";

import { PriceChart } from "../components/price-chart";
import { SignalCard } from "../components/signal-card";
import { useMarketCandles } from "../hooks/use-market-candles";
import { useMarketPrice } from "../hooks/use-market-price";
import { generateSignalFromCandles } from "../lib/market-signal";

const symbols = [
  { value: "BTCUSDT", label: "Bitcoin" },
  { value: "ETHUSDT", label: "Ethereum" },
  { value: "SOLUSDT", label: "Solana" },
];
const chartIntervals = [
  { value: "15m", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "4h", label: "4h" },
  { value: "1d", label: "1d" },
];

export default function Home() {
  const [chartInterval, setChartInterval] = useState("1h");

  const {
    selectedSymbol,
    marketPrice,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    changeSymbol,
    refreshPrice,
  } = useMarketPrice("BTCUSDT");

  const {
    candles,
    isLoading: areCandlesLoading,
    error: candleError,
    refreshCandles,
  } = useMarketCandles({
    symbol: selectedSymbol,
    interval: chartInterval,
    limit: 100,
  });

  const liveSignal = generateSignalFromCandles(candles);

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

        {liveSignal !== null && (
          <SignalCard
            signal={liveSignal}
            symbol={selectedSymbol}
            timeframe={chartInterval}
          />
        )}

        {areCandlesLoading && liveSignal === null && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
            Calculating live signal...
          </section>
        )}

        {!areCandlesLoading &&
          candles.length > 0 &&
          liveSignal === null && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
              Not enough market history to calculate a signal.
            </section>
          )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                Historical chart
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Last 100 candles using the {chartInterval} timeframe
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {chartIntervals.map((interval) => (
                  <button
                    key={interval.value}
                    type="button"
                    onClick={() => setChartInterval(interval.value)}
                    className={
                      chartInterval === interval.value
                        ? "rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-zinc-950"
                        : "rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400"
                    }
                  >
                    {interval.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={refreshCandles}
              disabled={areCandlesLoading}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400 disabled:cursor-not-allowed disabled:text-zinc-600"
            >
              Refresh chart
            </button>
          </div>

          <div className="mt-6">
            {areCandlesLoading && candles.length === 0 && (
              <p className="text-sm text-zinc-400">
                Loading historical candle data...
              </p>
            )}

            {candles.length > 0 && <PriceChart candles={candles} />}

            {candleError && (
              <p className="mt-4 text-sm text-amber-400">
                {candleError}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
