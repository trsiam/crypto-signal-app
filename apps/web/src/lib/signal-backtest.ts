import type { MarketCandle } from "../hooks/use-market-candles";
import { generateSignalFromCandles } from "./market-signal";

export type BacktestOutcome = "Win" | "Loss" | "Neutral";

export type BacktestTrade = {
  signalIndex: number;
  entryPrice: number;
  exitPrice: number;
  signal: "Buy" | "Sell";
  outcome: BacktestOutcome;
  returnPercent: number;
};

export type BacktestResult = {
  totalSignals: number;
  wins: number;
  losses: number;
  neutral: number;
  winRate: number;
  totalNetReturnPercent: number;
  averageReturnPercent: number;
  trades: BacktestTrade[];
};

function roundTo(value: number, decimalPlaces: number): number {
  const roundedValue = Number(value.toFixed(decimalPlaces));

  return roundedValue === 0 ? 0 : roundedValue;
}

export function backtestSignals(
  candles: MarketCandle[],
  lookback = 35,
  horizon = 1,
  neutralThresholdPercent = 0,
  tradingCostPercent = 0,
): BacktestResult {
  if (!Number.isInteger(lookback) || lookback < 1) {
    throw new Error("lookback must be at least 1 and an integer.");
  }

  if (!Number.isInteger(horizon) || horizon < 1) {
    throw new Error("horizon must be at least 1 and an integer.");
  }

  if (
    !Number.isFinite(neutralThresholdPercent) ||
    neutralThresholdPercent < 0
  ) {
    throw new Error(
      "neutralThresholdPercent must be a finite number greater than or equal to 0.",
    );
  }

  if (!Number.isFinite(tradingCostPercent) || tradingCostPercent < 0) {
    throw new Error(
      "tradingCostPercent must be a finite number greater than or equal to 0.",
    );
  }

  const trades: BacktestTrade[] = [];

  for (
    let signalIndex = lookback - 1;
    signalIndex < candles.length;
    signalIndex += 1
  ) {
    const exitIndex = signalIndex + horizon;

    if (exitIndex >= candles.length) {
      continue;
    }

    const result = generateSignalFromCandles(
      candles.slice(0, signalIndex + 1),
    );

    if (result === null || result.signal === "Hold") {
      continue;
    }

    const entryPrice = candles[signalIndex].close;
    const exitPrice = candles[exitIndex].close;
    const priceIncreased = exitPrice > entryPrice;
    const priceDecreased = exitPrice < entryPrice;
    const priceMovementPercent =
      Math.abs((exitPrice - entryPrice) / entryPrice) * 100;
    let outcome: BacktestOutcome = "Neutral";

    if (priceMovementPercent > neutralThresholdPercent) {
      if (
        (result.signal === "Buy" && priceIncreased) ||
        (result.signal === "Sell" && priceDecreased)
      ) {
        outcome = "Win";
      } else if (priceIncreased || priceDecreased) {
        outcome = "Loss";
      }
    }

    const grossReturnPercent =
      result.signal === "Buy"
        ? ((exitPrice - entryPrice) / entryPrice) * 100
        : ((entryPrice - exitPrice) / entryPrice) * 100;
    const returnPercent = grossReturnPercent - tradingCostPercent;

    trades.push({
      signalIndex,
      entryPrice,
      exitPrice,
      signal: result.signal,
      outcome,
      returnPercent,
    });
  }

  const wins = trades.filter((trade) => trade.outcome === "Win").length;
  const losses = trades.filter((trade) => trade.outcome === "Loss").length;
  const neutral = trades.filter(
    (trade) => trade.outcome === "Neutral",
  ).length;
  const decidedTrades = wins + losses;
  const winRate =
    decidedTrades === 0 ? 0 : roundTo((wins / decidedTrades) * 100, 2);
  const totalNetReturnPercent = trades.reduce(
    (sum, trade) => sum + trade.returnPercent,
    0,
  );
  const averageReturnPercent =
    trades.length === 0
      ? 0
      : roundTo(
          trades.reduce((total, trade) => total + trade.returnPercent, 0) /
            trades.length,
          4,
        );

  return {
    totalSignals: trades.length,
    wins,
    losses,
    neutral,
    winRate,
    totalNetReturnPercent,
    averageReturnPercent,
    trades,
  };
}
