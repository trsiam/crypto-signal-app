// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { PriceChart } from "./price-chart";

afterEach(() => {
  cleanup();
});

const candles = Array.from({ length: 20 }, (_, index) => {
  const close = 100 + index;

  return {
    open: close - 1,
    high: close + 2,
    low: close - 2,
    close,
    volume: 1000 + index,
    closeTime: 1_700_000_000_000 + index * 60_000,
  };
});

describe("PriceChart", () => {
  it("renders the closing-price legend", () => {
    render(<PriceChart candles={candles} />);

    expect(screen.getByText("Closing price")).toBeInTheDocument();
  });

  it("renders the SMA 20 legend", () => {
    render(<PriceChart candles={candles} />);

    expect(screen.getByText("SMA 20")).toBeInTheDocument();
  });

  it("renders the accessible chart image with aria-label", () => {
    render(<PriceChart candles={candles} />);

    expect(
      screen.getByRole("img", {
        name: "Historical closing-price chart",
      }),
    ).toBeInTheDocument();
  });

  it("shows the low and high labels", () => {
    render(<PriceChart candles={candles} />);

    expect(screen.getByText("Low: $100")).toBeInTheDocument();
    expect(screen.getByText("High: $119")).toBeInTheDocument();
  });

  it("shows the not-enough-data message when fewer than 2 candles are passed", () => {
    render(<PriceChart candles={candles.slice(0, 1)} />);

    expect(
      screen.getByText("Not enough candle data to draw the chart."),
    ).toBeInTheDocument();
  });
});
