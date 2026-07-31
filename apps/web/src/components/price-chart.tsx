import type { MarketCandle } from "../hooks/use-market-candles";

type PriceChartProps = {
  candles: MarketCandle[];
};

const chartWidth = 800;
const chartHeight = 280;
const chartPadding = 24;

export function PriceChart({ candles }: PriceChartProps) {
  if (candles.length < 2) {
    return (
      <p className="text-sm text-zinc-500">
        Not enough candle data to draw the chart.
      </p>
    );
  }

  const closingPrices = candles.map((candle) => candle.close);
  const minimumPrice = Math.min(...closingPrices);
  const maximumPrice = Math.max(...closingPrices);
  const priceRange = maximumPrice - minimumPrice || 1;

  const drawableWidth = chartWidth - chartPadding * 2;
  const drawableHeight = chartHeight - chartPadding * 2;

  const points = candles
    .map((candle, index) => {
      const x =
        chartPadding +
        (index / (candles.length - 1)) * drawableWidth;

      const normalizedPrice =
        (candle.close - minimumPrice) / priceRange;

      const y =
        chartPadding +
        (1 - normalizedPrice) * drawableHeight;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label="Historical closing-price chart"
        className="h-auto w-full"
      >
        <line
          x1={chartPadding}
          y1={chartPadding}
          x2={chartPadding}
          y2={chartHeight - chartPadding}
          stroke="currentColor"
          className="text-zinc-700"
        />

        <line
          x1={chartPadding}
          y1={chartHeight - chartPadding}
          x2={chartWidth - chartPadding}
          y2={chartHeight - chartPadding}
          stroke="currentColor"
          className="text-zinc-700"
        />

        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-400"
        />
      </svg>

      <div className="mt-3 flex justify-between text-xs text-zinc-500">
        <span>
          Low: $
          {minimumPrice.toLocaleString("en-US", {
            maximumFractionDigits: 2,
          })}
        </span>

        <span>
          High: $
          {maximumPrice.toLocaleString("en-US", {
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}