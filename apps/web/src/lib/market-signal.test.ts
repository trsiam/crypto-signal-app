import { describe, expect, it } from "vitest";

import type { MarketCandle } from "../hooks/use-market-candles";
import { generateSignalFromCandles } from "./market-signal";

function createCandle(index: number, close: number): MarketCandle {
  const openTime = index * 3_600_000;

  return {
    open_time: openTime,
    open: close - 0.5,
    high: close + 1,
    low: close - 1,
    close,
    volume: 1_000 + index,
    close_time: openTime + 3_599_999,
  };
}

describe("generateSignalFromCandles", () => {
  it("returns null for empty candles", () => {
    expect(generateSignalFromCandles([])).toBeNull();
  });

  it("returns null when history is insufficient for complete MACD values", () => {
    const candles = Array.from({ length: 30 }, (_, index) =>
      createCandle(index, 100 + index ** 2),
    );

    expect(generateSignalFromCandles(candles)).toBeNull();
  });

  it("returns a strong bullish signal for steadily increasing candles", () => {
    const candles = Array.from({ length: 40 }, (_, index) =>
      createCandle(index, 100 + index ** 2),
    );

    const result = generateSignalFromCandles(candles);

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      direction: "Bullish",
      signal: "Buy",
      score: 3,
      confidence: 90,
      risk: "Low",
    });
  });

  it("returns a strong bearish signal for steadily decreasing candles", () => {
    const candles = Array.from({ length: 40 }, (_, index) =>
      createCandle(index, 2_000 - index ** 2),
    );

    const result = generateSignalFromCandles(candles);

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      direction: "Bearish",
      signal: "Sell",
      score: -3,
      confidence: 90,
      risk: "Low",
    });
  });

  it("includes bullish reasons from the indicators and signal engine", () => {
    const candles = Array.from({ length: 40 }, (_, index) =>
      createCandle(index, 100 + index ** 2),
    );

    const result = generateSignalFromCandles(candles);

    expect(result).not.toBeNull();
    expect(result?.reasons).toEqual([
      "Price is above SMA 20.",
      "RSI shows bullish momentum.",
      "MACD confirms bullish momentum.",
    ]);
  });
});
