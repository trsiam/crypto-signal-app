// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { SignalResult } from "../lib/signal-engine";
import { SignalCard } from "./signal-card";

afterEach(() => {
  cleanup();
});

const buySignal: SignalResult = {
  signal: "Buy",
  direction: "Bullish",
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
  signal: "Sell",
  direction: "Bearish",
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
  signal: "Hold",
  direction: "Neutral",
  confidence: 50,
  risk: "High",
  score: 0,
  reasons: [
    "Price is equal to SMA 20.",
    "RSI is neutral.",
    "MACD is neutral.",
  ],
};

function getSignalBadge(text: string): HTMLElement {
  const badge = screen
    .getAllByText(text)
    .find((element) => element.classList.contains("rounded-full"));

  if (!badge) {
    throw new Error(`Could not find the ${text} signal badge.`);
  }

  return badge;
}

describe("SignalCard", () => {
  it("renders a Buy signal and all of its details", () => {
    render(
      <SignalCard signal={buySignal} symbol="BTCUSDT" timeframe="1h" />,
    );

    expect(screen.getByText("Live signal")).toBeVisible();
    expect(screen.getByText("BTCUSDT")).toBeVisible();
    expect(screen.getByText("1h")).toBeVisible();
    expect(screen.getByText("Bullish")).toBeVisible();
    expect(screen.getByText("90%")).toBeVisible();
    expect(screen.getByText("Low risk")).toBeVisible();
    expect(screen.getByText("3")).toBeVisible();
    expect(screen.getByText("Price is above SMA 20.")).toBeVisible();
    expect(screen.getByText("RSI shows bullish momentum.")).toBeVisible();
    expect(
      screen.getByText("MACD confirms bullish momentum."),
    ).toBeVisible();

    const buyElements = screen.getAllByText("Buy");
    expect(buyElements).toHaveLength(2);
    buyElements.forEach((element) => expect(element).toBeVisible());
  });

  it("renders a Sell signal with bearish badge styling", () => {
    render(
      <SignalCard signal={sellSignal} symbol="ETHUSDT" timeframe="4h" />,
    );

    expect(screen.getAllByText("Sell")[0]).toBeVisible();
    expect(screen.getByText("Bearish")).toBeVisible();
    expect(getSignalBadge("Sell")).toHaveClass("bg-rose-500", "text-white");
  });

  it("renders a Hold signal with neutral badge styling", () => {
    render(
      <SignalCard signal={holdSignal} symbol="SOLUSDT" timeframe="1d" />,
    );

    expect(screen.getAllByText("Hold")[0]).toBeVisible();
    expect(screen.getByText("Neutral")).toBeVisible();
    expect(getSignalBadge("Hold")).toHaveClass(
      "bg-amber-400",
      "text-zinc-950",
    );
  });

  it("uses bullish styling for the Buy badge", () => {
    render(
      <SignalCard signal={buySignal} symbol="BTCUSDT" timeframe="1h" />,
    );

    expect(getSignalBadge("Buy")).toHaveClass(
      "bg-emerald-500",
      "text-zinc-950",
    );
  });
});
