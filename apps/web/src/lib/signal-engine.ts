export type SignalDirection = "Bullish" | "Bearish" | "Neutral";

export type TradingSignal = "Buy" | "Sell" | "Hold";

export type SignalRisk = "Low" | "Medium" | "High";

export type SignalInput = {
  currentPrice: number;
  sma20: number;
  rsi14: number;
  macd: number;
  macdSignal: number;
  histogram: number;
};

export type SignalResult = {
  direction: SignalDirection;
  signal: TradingSignal;
  confidence: number;
  risk: SignalRisk;
  score: number;
  reasons: string[];
};

export function evaluateSignal(input: SignalInput): SignalResult {
  let score = 0;
  const reasons: string[] = [];

  if (input.currentPrice > input.sma20) {
    score += 1;
    reasons.push("Price is above SMA 20.");
  } else if (input.currentPrice < input.sma20) {
    score -= 1;
    reasons.push("Price is below SMA 20.");
  } else {
    reasons.push("Price is equal to SMA 20.");
  }

  if (input.rsi14 >= 55) {
    score += 1;
    reasons.push("RSI shows bullish momentum.");
  } else if (input.rsi14 <= 45) {
    score -= 1;
    reasons.push("RSI shows bearish momentum.");
  } else {
    reasons.push("RSI is neutral.");
  }

  if (input.macd > input.macdSignal && input.histogram > 0) {
    score += 1;
    reasons.push("MACD confirms bullish momentum.");
  } else if (input.macd < input.macdSignal && input.histogram < 0) {
    score -= 1;
    reasons.push("MACD confirms bearish momentum.");
  } else {
    reasons.push("MACD is neutral.");
  }

  const absoluteScore = Math.abs(score);
  const confidence =
    absoluteScore === 3
      ? 90
      : absoluteScore === 2
        ? 75
        : absoluteScore === 1
          ? 60
          : 50;
  const risk: SignalRisk =
    absoluteScore === 3 ? "Low" : absoluteScore === 2 ? "Medium" : "High";

  if (score >= 2) {
    return {
      direction: "Bullish",
      signal: "Buy",
      confidence,
      risk,
      score,
      reasons,
    };
  }

if (score <= -2) {
  return {
    direction: "Bearish",
    signal: "Sell",
    confidence,
    risk,
    score,
    reasons,
  };
}

  return {
    direction: "Neutral",
    signal: "Hold",
    confidence,
    risk,
    score,
    reasons,
  };
}
