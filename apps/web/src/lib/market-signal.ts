import type { MarketCandle } from "../hooks/use-market-candles";
import {
  calculateMacd,
  calculateRsi,
  calculateSma,
} from "./technical-indicators";
import { evaluateSignal, type SignalResult } from "./signal-engine";

export function generateSignalFromCandles(
  candles: MarketCandle[],
): SignalResult | null {
  if (candles.length === 0) {
    return null;
  }

  const closeValues = candles.map((candle) => candle.close);
  const smaValues = calculateSma(closeValues, 20);
  const rsiValues = calculateRsi(closeValues, 14);
  const macdValues = calculateMacd(closeValues);
  const latestIndex = closeValues.length - 1;

  const currentPrice = closeValues[latestIndex];
  const sma20 = smaValues[latestIndex];
  const rsi14 = rsiValues[latestIndex];
  const latestMacd = macdValues[latestIndex];

  if (
    currentPrice === undefined ||
    sma20 == null ||
    rsi14 == null ||
    latestMacd === undefined ||
    latestMacd.macd == null ||
    latestMacd.signal == null ||
    latestMacd.histogram == null
  ) {
    return null;
  }

  return evaluateSignal({
    currentPrice,
    sma20,
    rsi14,
    macd: latestMacd.macd,
    macdSignal: latestMacd.signal,
    histogram: latestMacd.histogram,
  });
}
