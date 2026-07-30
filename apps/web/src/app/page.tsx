"use client";

import { useEffect, useState } from "react";

type MarketPrice = {
  symbol: string;
  price: number;
};

export default function Home() {
  const [marketPrice, setMarketPrice] = useState<MarketPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMarketPrice() {
      try {
        const response = await fetch("/api/market/price/BTCUSDT", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load the Bitcoin price");
        }

        const data: MarketPrice = await response.json();

        setMarketPrice(data);
      } catch {
        setError("Live market data is currently unavailable.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadMarketPrice();
  }, []);

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
            The first working feature of your crypto signal application.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            Bitcoin price
          </p>

          {isLoading && (
            <p className="mt-4 text-xl text-zinc-300">
              Loading live market price...
            </p>
          )}

          {error && (
            <p className="mt-4 text-xl text-red-400">
              {error}
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
            </div>
          )}
        </section>
      </div>
    </main>
  );
}