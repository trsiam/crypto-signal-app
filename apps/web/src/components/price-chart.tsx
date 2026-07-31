import type { MarketCandle } from "../hooks/use-market-candles";

type PriceChartProps = {
  candles: MarketCandle[];
};

const chartWidth = 800;
const chartHeight = 280;
const chartPadding = 24;
const rsiWidth = 800;
const rsiHeight = 160;
const rsiPadding = 24;

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

  const movingAverages = candles.map((candle, index) => {
    if (index < 19) {
      return null;
    }

    const recentCandles = candles.slice(index - 19, index + 1);
    const totalClose = recentCandles.reduce(
      (sum, currentCandle) => sum + currentCandle.close,
      0,
    );

    return totalClose / 20;
  });

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

  const movingAveragePoints = candles
    .map((candle, index) => {
      const movingAverage = movingAverages[index];

      if (movingAverage === null) {
        return null;
      }

      const x =
        chartPadding +
        (index / (candles.length - 1)) * drawableWidth;

      const normalizedPrice =
        (movingAverage - minimumPrice) / priceRange;

      const y =
        chartPadding +
        (1 - normalizedPrice) * drawableHeight;

      return `${x},${y}`;
    })
    .filter((point): point is string => point !== null)
    .join(" ");

  const priceChanges = candles.slice(1).map((candle, index) => {
    const previousClose = candles[index].close;
    const change = candle.close - previousClose;

    return {
      gain: change > 0 ? change : 0,
      loss: change < 0 ? Math.abs(change) : 0,
    };
  });

  const rsiValues = candles.map((_, index) => {
    if (index < 14) {
      return null;
    }

    const recentChanges = priceChanges.slice(index - 13, index + 1);
    const averageGain =
      recentChanges.reduce((sum, change) => sum + change.gain, 0) / 14;
    const averageLoss =
      recentChanges.reduce((sum, change) => sum + change.loss, 0) / 14;

    if (averageLoss === 0) {
      return 100;
    }

    return 100 - 100 / (1 + averageGain / averageLoss);
  });

  const rsiDrawableWidth = rsiWidth - rsiPadding * 2;
  const rsiDrawableHeight = rsiHeight - rsiPadding * 2;

  const rsiPoints = candles
    .map((_, index) => {
      const rsi = rsiValues[index];

      if (rsi === null) {
        return null;
      }

      const x = rsiPadding + (index / (candles.length - 1)) * rsiDrawableWidth;
      const normalizedRsi = rsi / 100;
      const y = rsiPadding + (1 - normalizedRsi) * rsiDrawableHeight;

      return `${x},${y}`;
    })
    .filter((point): point is string => point !== null)
    .join(" ");

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span>Closing price</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span>SMA 20</span>
        </div>
      </div>

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

        <polyline
          points={movingAveragePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-400"
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

      {candles.length >= 15 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-4 flex items-center justify-between gap-4 text-xs text-zinc-500">
            <span className="font-medium uppercase tracking-wider text-zinc-400">
              RSI 14
            </span>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                <span>RSI 14</span>
              </span>
              <span>70</span>
              <span>30</span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${rsiWidth} ${rsiHeight}`}
            role="img"
            aria-label="RSI 14 chart"
            className="h-auto w-full"
          >
            <line
              x1={rsiPadding}
              y1={rsiPadding + (1 - 0.7) * rsiDrawableHeight}
              x2={rsiWidth - rsiPadding}
              y2={rsiPadding + (1 - 0.7) * rsiDrawableHeight}
              stroke="currentColor"
              className="text-zinc-700"
            />

            <line
              x1={rsiPadding}
              y1={rsiPadding + (1 - 0.3) * rsiDrawableHeight}
              x2={rsiWidth - rsiPadding}
              y2={rsiPadding + (1 - 0.3) * rsiDrawableHeight}
              stroke="currentColor"
              className="text-zinc-700"
            />

            <polyline
              points={rsiPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-violet-400"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
