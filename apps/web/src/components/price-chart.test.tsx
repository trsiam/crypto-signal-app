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

const rsiCandles = Array.from({ length: 14 }, (_, index) => {
  const close = 200 + index;

  return {
    open: close - 1,
    high: close + 2,
    low: close - 2,
    close,
    volume: 2000 + index,
    closeTime: 1_700_100_000_000 + index * 60_000,
  };
});

const macdCandles = Array.from({ length: 34 }, (_, index) => {
  const close = 300 + index;

  return {
    open: close - 1,
    high: close + 2,
    low: close - 2,
    close,
    volume: 3000 + index,
    closeTime: 1_700_200_000_000 + index * 60_000,
  };
});

const macdVisibleCandles = Array.from({ length: 40 }, (_, index) => {
  const close = 400 + index;

  return {
    open: close - 1,
    high: close + 2,
    low: close - 2,
    close,
    volume: 4000 + index,
    closeTime: 1_700_300_000_000 + index * 60_000,
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

  it("renders the RSI 14 panel when enough candles are passed", () => {
    render(<PriceChart candles={candles} />);

    expect(screen.getAllByText("RSI 14")).toHaveLength(2);
    expect(
      screen.getByRole("img", {
        name: "RSI 14 chart",
      }),
    ).toBeVisible();
    expect(screen.getByText("70")).toBeVisible();
    expect(screen.getByText("30")).toBeVisible();
  });

  it("does not render the RSI panel when only 14 candles are passed", () => {
    render(<PriceChart candles={rsiCandles} />);

    expect(
      screen.queryByRole("img", {
        name: "RSI 14 chart",
      }),
    ).not.toBeInTheDocument();
  });

  it("renders the MACD panel when enough candles are passed", () => {
    render(<PriceChart candles={macdVisibleCandles} />);

    expect(screen.getByText("MACD 12, 26, 9")).toBeVisible();
    expect(screen.getByText("MACD")).toBeVisible();
    expect(screen.getByText("Signal")).toBeVisible();
    expect(screen.getByText("Histogram")).toBeVisible();
    expect(
      screen.getByRole("img", {
        name: "MACD 12 26 9 chart",
      }),
    ).toBeVisible();
  });

  it("does not render the MACD panel when only 34 candles are passed", () => {
    render(<PriceChart candles={macdCandles} />);

    expect(
      screen.queryByRole("img", {
        name: "MACD 12 26 9 chart",
      }),
    ).not.toBeInTheDocument();
  });
});
