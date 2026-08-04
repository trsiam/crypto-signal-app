import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MarketCandle } from "../hooks/use-market-candles";
import { generateSignalFromCandles } from "./market-signal";
import { backtestSignals } from "./signal-backtest";
import type { SignalResult } from "./signal-engine";

vi.mock("./market-signal", () => ({
  generateSignalFromCandles: vi.fn(),
}));

const generateSignalMock = vi.mocked(generateSignalFromCandles);

const buySignal: SignalResult = {
  direction: "Bullish",
  signal: "Buy",
  confidence: 90,
  risk: "Low",
  score: 3,
  reasons: [
    "Price is above SMA 20.",
    "RSI shows bullish momentum.",
    "MACD confirms bullish momentum.",
  ],
};

const sellSignal: SignalResult = {
  direction: "Bearish",
  signal: "Sell",
  confidence: 90,
  risk: "Low",
  score: -3,
  reasons: [
    "Price is below SMA 20.",
    "RSI shows bearish momentum.",
    "MACD confirms bearish momentum.",
  ],
};

const holdSignal: SignalResult = {
  direction: "Neutral",
  signal: "Hold",
  confidence: 50,
  risk: "High",
  score: 0,
  reasons: [
    "Price is equal to SMA 20.",
    "RSI is neutral.",
    "MACD is neutral.",
  ],
};

function createCandle(index: number, close: number): MarketCandle {
  const openTime = index * 3_600_000;

  return {
    open_time: openTime,
    open: close,
    high: close + 1,
    low: close - 1,
    close,
    volume: 1_000 + index,
    close_time: openTime + 3_599_999,
  };
}

beforeEach(() => {
  generateSignalMock.mockReset();
});

describe("backtestSignals", () => {
  it("throws a clear error for an invalid lookback", () => {
    expect(() => backtestSignals([], 0, 1)).toThrow(
      "lookback must be at least 1",
    );
  });

  it("throws a clear error for an invalid horizon", () => {
    expect(() => backtestSignals([], 1, 0)).toThrow(
      "horizon must be at least 1",
    );
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "throws a clear error for an invalid neutral threshold of %s",
    (neutralThresholdPercent) => {
      expect(() =>
        backtestSignals([], 1, 1, neutralThresholdPercent),
      ).toThrow(
        "neutralThresholdPercent must be a finite number greater than or equal to 0.",
      );
    },
  );

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "throws a clear error for an invalid trading cost of %s",
    (tradingCostPercent) => {
      expect(() =>
        backtestSignals([], 1, 1, 0, tradingCostPercent),
      ).toThrow(
        "tradingCostPercent must be a finite number greater than or equal to 0.",
      );
    },
  );

  it("returns an empty result when candles are insufficient", () => {
    const candles = [createCandle(0, 100), createCandle(1, 105)];

    expect(backtestSignals(candles, 3, 1)).toEqual({
      totalSignals: 0,
      wins: 0,
      losses: 0,
      neutral: 0,
      winRate: 0,
      averageReturnPercent: 0,
      trades: [],
    });
  });

  it("records a winning Buy trade", () => {
    generateSignalMock.mockReturnValue(buySignal);
    const candles = [createCandle(0, 100), createCandle(1, 110)];

    const result = backtestSignals(candles, 1, 1);

    expect(result.trades).toHaveLength(1);
    expect(result.trades[0]).toMatchObject({
      entryPrice: 100,
      exitPrice: 110,
      signal: "Buy",
      outcome: "Win",
      returnPercent: 10,
    });
    expect(result.wins).toBe(1);
    expect(result.losses).toBe(0);
    expect(result.winRate).toBe(100);
  });

  it("records a losing Buy trade", () => {
    generateSignalMock.mockReturnValue(buySignal);
    const candles = [createCandle(0, 100), createCandle(1, 90)];

    const result = backtestSignals(candles, 1, 1);

    expect(result.trades[0]).toMatchObject({
      outcome: "Loss",
      returnPercent: -10,
    });
    expect(result.winRate).toBe(0);
  });

  it("records a winning Sell trade", () => {
    generateSignalMock.mockReturnValue(sellSignal);
    const candles = [createCandle(0, 100), createCandle(1, 90)];

    const result = backtestSignals(candles, 1, 1);

    expect(result.trades[0]).toMatchObject({
      signal: "Sell",
      outcome: "Win",
      returnPercent: 10,
    });
  });

  it("records a losing Sell trade", () => {
    generateSignalMock.mockReturnValue(sellSignal);
    const candles = [createCandle(0, 100), createCandle(1, 110)];

    const result = backtestSignals(candles, 1, 1);

    expect(result.trades[0]).toMatchObject({
      signal: "Sell",
      outcome: "Loss",
      returnPercent: -10,
    });
  });

  it("subtracts the trading cost from a Buy trade return", () => {
    generateSignalMock.mockReturnValue(buySignal);
    const candles = [createCandle(0, 100), createCandle(1, 110)];

    const result = backtestSignals(candles, 1, 1, 0, 0.25);

    expect(result.trades[0].returnPercent).toBeCloseTo(9.75);
  });

  it("subtracts the trading cost from a Sell trade return", () => {
    generateSignalMock.mockReturnValue(sellSignal);
    const candles = [createCandle(0, 100), createCandle(1, 90)];

    const result = backtestSignals(candles, 1, 1, 0, 0.25);

    expect(result.trades[0].returnPercent).toBeCloseTo(9.75);
  });

  it("keeps a profitable gross trade outcome after costs reduce its net return", () => {
    generateSignalMock.mockReturnValue(buySignal);
    const candles = [createCandle(0, 100), createCandle(1, 100.1)];

    const result = backtestSignals(candles, 1, 1, 0, 0.2);

    expect(result.trades[0].outcome).toBe("Win");
    expect(result.trades[0].returnPercent).toBeCloseTo(-0.1);
  });

  it("preserves the previous return when the trading cost is zero", () => {
    generateSignalMock.mockReturnValue(buySignal);
    const candles = [createCandle(0, 100), createCandle(1, 110)];

    const result = backtestSignals(candles, 1, 1, 0, 0);

    expect(result.trades[0].returnPercent).toBe(10);
  });

  it("records a neutral trade without affecting win rate", () => {
    generateSignalMock.mockReturnValue(buySignal);
    const candles = [createCandle(0, 100), createCandle(1, 100)];

    const result = backtestSignals(candles, 1, 1);

    expect(result.trades[0]).toMatchObject({
      outcome: "Neutral",
      returnPercent: 0,
    });
    expect(result.neutral).toBe(1);
    expect(result.wins).toBe(0);
    expect(result.losses).toBe(0);
    expect(result.winRate).toBe(0);
  });

  it("classifies a tiny upward move for a Buy signal as Neutral", () => {
    generateSignalMock.mockReturnValue(buySignal);
    const candles = [createCandle(0, 100), createCandle(1, 100.1)];

    const result = backtestSignals(candles, 1, 1, 0.1);

    expect(result.trades[0]).toMatchObject({
      signal: "Buy",
      outcome: "Neutral",
    });
    expect(result.trades[0].returnPercent).toBeCloseTo(0.1);
  });

  it("classifies a tiny downward move for a Sell signal as Neutral", () => {
    generateSignalMock.mockReturnValue(sellSignal);
    const candles = [createCandle(0, 100), createCandle(1, 99.9)];

    const result = backtestSignals(candles, 1, 1, 0.1);

    expect(result.trades[0]).toMatchObject({
      signal: "Sell",
      outcome: "Neutral",
    });
    expect(result.trades[0].returnPercent).toBeCloseTo(0.1);
  });

  it("classifies a move exactly equal to the threshold as Neutral", () => {
    generateSignalMock.mockReturnValue(buySignal);
    const candles = [createCandle(0, 100), createCandle(1, 100.5)];

    const result = backtestSignals(candles, 1, 1, 0.5);

    expect(result.trades[0].outcome).toBe("Neutral");
  });

  it("evaluates a move greater than the threshold as Win or Loss", () => {
    generateSignalMock.mockReturnValue(buySignal);
    const candles = [createCandle(0, 100), createCandle(1, 99.4)];

    const result = backtestSignals(candles, 1, 1, 0.5);

    expect(result.trades[0].outcome).toBe("Loss");
    expect(result.trades[0].returnPercent).toBeCloseTo(-0.6);
  });

  it("ignores Hold signals", () => {
    generateSignalMock.mockReturnValue(holdSignal);
    const candles = [createCandle(0, 100), createCandle(1, 110)];

    const result = backtestSignals(candles, 1, 1);

    expect(result.totalSignals).toBe(0);
    expect(result.trades).toEqual([]);
  });

  it("uses the close exactly horizon candles after the signal", () => {
    generateSignalMock.mockReturnValue(buySignal);
    const candles = [
      createCandle(0, 100),
      createCandle(1, 75),
      createCandle(2, 110),
    ];

    const result = backtestSignals(candles, 1, 2);

    expect(result.trades).toHaveLength(1);
    expect(result.trades[0].entryPrice).toBe(100);
    expect(result.trades[0].exitPrice).toBe(110);
  });

  it("rounds only the summary win rate and average return", () => {
    generateSignalMock.mockReturnValue(buySignal);
    const candles = [
      createCandle(0, 100),
      createCandle(1, 110),
      createCandle(2, 121),
      createCandle(3, 108.9),
    ];

    const result = backtestSignals(candles, 1, 1);

    expect(result.trades).toHaveLength(3);
    expect(result.wins).toBe(2);
    expect(result.losses).toBe(1);
    expect(result.winRate).toBe(66.67);
    expect(result.averageReturnPercent).toBe(3.3333);
  });
});
