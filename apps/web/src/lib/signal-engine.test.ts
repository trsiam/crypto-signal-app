import { describe, expect, it } from "vitest";

import { evaluateSignal } from "./signal-engine";

describe("evaluateSignal", () => {
  it("returns a strong bullish result", () => {
    const result = evaluateSignal({
      currentPrice: 110,
      sma20: 100,
      rsi14: 60,
      macd: 2,
      macdSignal: 1,
      histogram: 1,
    });

    expect(result).toEqual({
      score: 3,
      direction: "Bullish",
      signal: "Buy",
      confidence: 90,
      risk: "Low",
      reasons: [
        "Price is above SMA 20.",
        "RSI shows bullish momentum.",
        "MACD confirms bullish momentum.",
      ],
    });
  });

  it("returns a strong bearish result", () => {
    const result = evaluateSignal({
      currentPrice: 90,
      sma20: 100,
      rsi14: 40,
      macd: -2,
      macdSignal: -1,
      histogram: -1,
    });

    expect(result).toEqual({
      score: -3,
      direction: "Bearish",
      signal: "Sell",
      confidence: 90,
      risk: "Low",
      reasons: [
        "Price is below SMA 20.",
        "RSI shows bearish momentum.",
        "MACD confirms bearish momentum.",
      ],
    });
  });

  it("returns a neutral result", () => {
    const result = evaluateSignal({
      currentPrice: 100,
      sma20: 100,
      rsi14: 50,
      macd: 1,
      macdSignal: 1,
      histogram: 0,
    });

    expect(result).toEqual({
      score: 0,
      direction: "Neutral",
      signal: "Hold",
      confidence: 50,
      risk: "High",
      reasons: [
        "Price is equal to SMA 20.",
        "RSI is neutral.",
        "MACD is neutral.",
      ],
    });
  });

  it("returns a mixed bullish result for score 2", () => {
    const result = evaluateSignal({
      currentPrice: 110,
      sma20: 100,
      rsi14: 60,
      macd: 1,
      macdSignal: 1,
      histogram: 0,
    });

    expect(result.score).toBe(2);
    expect(result.direction).toBe("Bullish");
    expect(result.signal).toBe("Buy");
    expect(result.confidence).toBe(75);
    expect(result.risk).toBe("Medium");
  });

  it("returns a mixed bearish result for score -2", () => {
    const result = evaluateSignal({
      currentPrice: 90,
      sma20: 100,
      rsi14: 40,
      macd: 1,
      macdSignal: 1,
      histogram: 0,
    });

    expect(result.score).toBe(-2);
    expect(result.direction).toBe("Bearish");
    expect(result.signal).toBe("Sell");
    expect(result.confidence).toBe(75);
    expect(result.risk).toBe("Medium");
  });

  it("returns a neutral hold result for weak score 1", () => {
    const result = evaluateSignal({
      currentPrice: 110,
      sma20: 100,
      rsi14: 50,
      macd: 1,
      macdSignal: 1,
      histogram: 0,
    });

    expect(result.score).toBe(1);
    expect(result.direction).toBe("Neutral");
    expect(result.signal).toBe("Hold");
    expect(result.confidence).toBe(60);
    expect(result.risk).toBe("High");
  });
});
