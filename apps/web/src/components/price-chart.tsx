import type { MarketCandle } from "../hooks/use-market-candles";
import {
  calculateMacd,
  calculateRsi,
  calculateSma,
} from "../lib/technical-indicators";

type PriceChartProps = {
  candles: MarketCandle[];
};

const chartWidth = 800;
const chartHeight = 280;
const chartPadding = 24;
const rsiWidth = 800;
const rsiHeight = 160;
const rsiPadding = 24;
const macdWidth = 800;
const macdHeight = 200;
const macdPadding = 24;

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

  const movingAverages = calculateSma(closingPrices, 20);

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

  const rsiValues = calculateRsi(closingPrices, 14);

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

  const macdValues = calculateMacd(closingPrices);
  const macdLineValues = macdValues.map((point) => point.macd);
  const macdSignalValues = macdValues.map((point) => point.signal);
  const macdHistogramValues = macdValues.map((point) => point.histogram);
  const macdAvailableValues = macdValues
    .map((point) => {
      if (
        point.macd === null ||
        point.signal === null ||
        point.histogram === null
      ) {
        return null;
      }

      return [point.macd, point.signal, point.histogram];
    })
    .filter((value): value is [number, number, number] => value !== null);

  const macdMinValue = macdAvailableValues.length
    ? Math.min(0, ...macdAvailableValues.flat())
    : 0;
  const macdMaxValue = macdAvailableValues.length
    ? Math.max(0, ...macdAvailableValues.flat())
    : 0;
  const macdRange = macdMaxValue - macdMinValue || 1;
  const macdDrawableWidth = macdWidth - macdPadding * 2;
  const macdDrawableHeight = macdHeight - macdPadding * 2;

  const macdLinePoints = candles
    .map((_, index) => {
      const macdLine = macdLineValues[index];

      if (macdLine === null) {
        return null;
      }

      const x =
        macdPadding +
        (index / (candles.length - 1)) * macdDrawableWidth;
      const normalizedValue = (macdLine - macdMinValue) / macdRange;
      const y = macdPadding + (1 - normalizedValue) * macdDrawableHeight;

      return `${x},${y}`;
    })
    .filter((point): point is string => point !== null)
    .join(" ");

  const macdSignalPoints = candles
    .map((_, index) => {
      const signalLine = macdSignalValues[index];

      if (signalLine === null) {
        return null;
      }

      const x =
        macdPadding +
        (index / (candles.length - 1)) * macdDrawableWidth;
      const normalizedValue = (signalLine - macdMinValue) / macdRange;
      const y = macdPadding + (1 - normalizedValue) * macdDrawableHeight;

      return `${x},${y}`;
    })
    .filter((point): point is string => point !== null)
    .join(" ");

  const macdHistogramBars = candles
    .map((_, index) => {
      const histogram = macdHistogramValues[index];

      if (histogram === null) {
        return null;
      }

      const x =
        macdPadding +
        (index / (candles.length - 1)) * macdDrawableWidth;
      const yZero =
        macdPadding +
        (1 - (0 - macdMinValue) / macdRange) * macdDrawableHeight;
      const normalizedValue = (histogram - macdMinValue) / macdRange;
      const y = macdPadding + (1 - normalizedValue) * macdDrawableHeight;
      const height = Math.abs(yZero - y);
      const barY = histogram >= 0 ? y : yZero;

      return { x, y: barY, height, positive: histogram >= 0 };
    })
    .filter(
      (
        bar,
      ): bar is {
        x: number;
        y: number;
        height: number;
        positive: boolean;
      } => bar !== null,
    );

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

      {candles.length >= 35 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
            <span className="font-medium uppercase tracking-wider text-zinc-400">
              MACD 12, 26, 9
            </span>

            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                <span>MACD</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                <span>Signal</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
                <span>Histogram</span>
              </span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${macdWidth} ${macdHeight}`}
            role="img"
            aria-label="MACD 12 26 9 chart"
            className="h-auto w-full"
          >
            <line
              x1={macdPadding}
              y1={macdPadding + (1 - (0 - macdMinValue) / macdRange) * macdDrawableHeight}
              x2={macdWidth - macdPadding}
              y2={macdPadding + (1 - (0 - macdMinValue) / macdRange) * macdDrawableHeight}
              stroke="currentColor"
              className="text-zinc-700"
            />

            {macdHistogramBars.map((bar, index) => (
              <rect
                key={`${index}-${bar.x}`}
                x={bar.x - 3}
                y={bar.y}
                width="6"
                height={bar.height}
                fill="currentColor"
                className={bar.positive ? "text-emerald-500" : "text-rose-500"}
              />
            ))}

            <polyline
              points={macdLinePoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-sky-400"
            />

            <polyline
              points={macdSignalPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-orange-400"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
