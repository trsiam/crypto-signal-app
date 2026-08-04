// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { BacktestResult } from "../lib/signal-backtest";
import { BacktestCard } from "./backtest-card";

afterEach(() => {
  cleanup();
});

const backtestResult: BacktestResult = {
  totalSignals: 10,
  wins: 6,
  losses: 3,
  neutral: 1,
  winRate: 66.67,
  averageReturnPercent: 1.2345,
  trades: [],
};

describe("BacktestCard", () => {
  it("displays all historical performance information", () => {
    render(
      <BacktestCard
        result={backtestResult}
        symbol="BTCUSDT"
        timeframe="1h"
        horizon={1}
        neutralThresholdPercent={0.1}
        tradingCostPercent={0.1}
      />,
    );

    expect(screen.getByText("Historical performance")).toBeVisible();
    expect(screen.getByText("BTCUSDT")).toBeVisible();
    expect(screen.getByText("1h / 1 candle ahead")).toBeVisible();
    expect(screen.getByText("Total signals")).toBeVisible();
    expect(screen.getByText("Wins")).toBeVisible();
    expect(screen.getByText("Losses")).toBeVisible();
    expect(screen.getByText("Neutral")).toBeVisible();
    expect(screen.getByText("Historical win rate")).toBeVisible();
    expect(screen.getByText("Average net return")).toBeVisible();
    expect(screen.getByText("66.67%")).toBeVisible();
    expect(screen.getByText("1.2345%")).toBeVisible();
    expect(screen.getByText("Neutral threshold: 0.1%")).toBeVisible();
    expect(screen.getByText("Trading cost: 0.1%")).toBeVisible();
    expect(
      screen.getByText("Returns shown after estimated trading costs."),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Historical results do not guarantee future performance.",
      ),
    ).toBeVisible();
  });

  it("uses plural horizon text", () => {
    render(
      <BacktestCard
        result={backtestResult}
        symbol="BTCUSDT"
        timeframe="1h"
        horizon={3}
        neutralThresholdPercent={0.1}
        tradingCostPercent={0.1}
      />,
    );

    expect(screen.getByText("1h / 3 candles ahead")).toBeVisible();
  });

  it("uses high win-rate styling", () => {
    render(
      <BacktestCard
        result={{ ...backtestResult, winRate: 60 }}
        symbol="BTCUSDT"
        timeframe="1h"
        horizon={1}
        neutralThresholdPercent={0.1}
        tradingCostPercent={0.1}
      />,
    );

    expect(screen.getByText("60%")).toHaveClass("text-emerald-400");
  });

  it("uses medium win-rate styling", () => {
    render(
      <BacktestCard
        result={{ ...backtestResult, winRate: 50 }}
        symbol="BTCUSDT"
        timeframe="1h"
        horizon={1}
        neutralThresholdPercent={0.1}
        tradingCostPercent={0.1}
      />,
    );

    expect(screen.getByText("50%")).toHaveClass("text-amber-400");
  });

  it("uses low win-rate styling", () => {
    render(
      <BacktestCard
        result={{ ...backtestResult, winRate: 49.99 }}
        symbol="BTCUSDT"
        timeframe="1h"
        horizon={1}
        neutralThresholdPercent={0.1}
        tradingCostPercent={0.1}
      />,
    );

    expect(screen.getByText("49.99%")).toHaveClass("text-rose-400");
  });
});
