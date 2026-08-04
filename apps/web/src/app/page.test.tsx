// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MarketCandle } from "../hooks/use-market-candles";
import Home from "./page";

const {
  backtestSignalsMock,
  generateSignalFromCandlesMock,
  useMarketCandlesMock,
} = vi.hoisted(() => ({
    backtestSignalsMock: vi.fn(),
    generateSignalFromCandlesMock: vi.fn(),
    useMarketCandlesMock: vi.fn(),
  }));

vi.mock("../hooks/use-market-candles", () => ({
  useMarketCandles: useMarketCandlesMock,
}));

vi.mock("../lib/market-signal", () => ({
  generateSignalFromCandles: generateSignalFromCandlesMock,
}));

vi.mock("../lib/signal-backtest", () => ({
  backtestSignals: backtestSignalsMock,
}));

const mockCandle: MarketCandle = {
  open_time: 1_700_000_000_000,
  open: 64_800,
  high: 65_100,
  low: 64_700,
  close: 65_000,
  volume: 1_250,
  close_time: 1_700_003_599_999,
};

const sufficientCandles = Array.from(
  { length: 35 },
  (_, index) => ({
    ...mockCandle,
    open_time: mockCandle.open_time + index * 3_600_000,
    close_time: mockCandle.close_time + index * 3_600_000,
  }),
);

describe("Home page", () => {
  beforeEach(() => {
    useMarketCandlesMock.mockReset();
    useMarketCandlesMock.mockReturnValue({
      candles: [],
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastUpdated: null,
      refreshCandles: vi.fn(),
    });

    generateSignalFromCandlesMock.mockReset();
    generateSignalFromCandlesMock.mockReturnValue(null);

    backtestSignalsMock.mockReset();
    backtestSignalsMock.mockReturnValue({
      totalSignals: 10,
      wins: 6,
      losses: 3,
      neutral: 1,
      winRate: 66.67,
      averageReturnPercent: 1.2345,
      trades: [],
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("loads and displays the Bitcoin price", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            symbol: "BTCUSDT",
            price: 64869.84,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      ),
    );

    render(<Home />);

    expect(
      screen.getByText("Loading live market price..."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("BTCUSDT")).toBeInTheDocument();
    });

    expect(screen.getByText("$64,869.84")).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it("loads Ethereum after the user changes the symbol", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            symbol: "BTCUSDT",
            price: 64869.84,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            symbol: "ETHUSDT",
            price: 3210.5,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();

    render(<Home />);

    await screen.findByText("BTCUSDT");

    await user.selectOptions(
      screen.getByLabelText("Cryptocurrency"),
      "ETHUSDT",
    );

    await waitFor(() => {
      expect(screen.getByText("ETHUSDT")).toBeInTheDocument();
    });

    expect(screen.getByText("$3,210.50")).toBeInTheDocument();
  });

  it("keeps the previous price visible when a refresh fails", async () => {
    vi.useFakeTimers();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            symbol: "BTCUSDT",
            price: 64869.84,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 502,
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    render(<Home />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("$64,869.84")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
      await Promise.resolve();
    });

    expect(
      screen.getByText(
        "The latest refresh failed. Showing the last available price.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("$64,869.84")).toBeInTheDocument();
  });

  it("shows a refresh indicator during a background update", async () => {
    vi.useFakeTimers();

    let resolveRefresh: ((response: Response) => void) | undefined;

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            symbol: "BTCUSDT",
            price: 64869.84,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveRefresh = resolve;
          }),
      );

    vi.stubGlobal("fetch", fetchMock);

    render(<Home />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("$64,869.84")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });

    expect(screen.getByText("Refreshing price...")).toBeInTheDocument();
    expect(screen.getByText("$64,869.84")).toBeInTheDocument();

    await act(async () => {
      resolveRefresh?.(
        new Response(
          JSON.stringify({
            symbol: "BTCUSDT",
            price: 64910.25,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

      await Promise.resolve();
    });

    expect(
      screen.queryByText("Refreshing price..."),
    ).not.toBeInTheDocument();

    expect(screen.getByText("$64,910.25")).toBeInTheDocument();
  });

  it("shows an error when the initial market request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 502,
        }),
      ),
    );

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText("Live market data is currently unavailable."),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("BTCUSDT")).not.toBeInTheDocument();
    expect(screen.queryByText(/Last updated:/)).not.toBeInTheDocument();
  });

  it("refreshes the price when the user clicks Refresh now", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            symbol: "BTCUSDT",
            price: 64869.84,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            symbol: "BTCUSDT",
            price: 64910.25,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();

    render(<Home />);

    await screen.findByText("$64,869.84");

    await user.click(
      screen.getByRole("button", {
        name: "Refresh now",
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("$64,910.25")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("displays a generated live signal", () => {
    useMarketCandlesMock.mockReturnValue({
      candles: [mockCandle],
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastUpdated: null,
      refreshCandles: vi.fn(),
    });
    generateSignalFromCandlesMock.mockReturnValue({
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
    });

    render(<Home />);

    expect(screen.getByText("Live signal")).toBeVisible();
    expect(screen.getByText("Bullish")).toBeVisible();
    expect(screen.getByText("90%")).toBeVisible();
    expect(screen.getByText("Low risk")).toBeVisible();
    expect(screen.getByText("Price is above SMA 20.")).toBeVisible();
    expect(screen.getByText("RSI shows bullish momentum.")).toBeVisible();
    expect(
      screen.getByText("MACD confirms bullish momentum."),
    ).toBeVisible();

    const buyElements = screen.getAllByText("Buy");
    expect(buyElements).toHaveLength(2);
    buyElements.forEach((element) => expect(element).toBeVisible());
  });

  it("displays the signal-loading message", () => {
    useMarketCandlesMock.mockReturnValue({
      candles: [],
      isLoading: true,
      isRefreshing: false,
      error: null,
      lastUpdated: null,
      refreshCandles: vi.fn(),
    });
    generateSignalFromCandlesMock.mockReturnValue(null);

    render(<Home />);

    expect(screen.getByText("Calculating live signal...")).toBeVisible();
  });

  it("displays the insufficient-history message", () => {
    useMarketCandlesMock.mockReturnValue({
      candles: [mockCandle],
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastUpdated: null,
      refreshCandles: vi.fn(),
    });
    generateSignalFromCandlesMock.mockReturnValue(null);

    render(<Home />);

    expect(
      screen.getByText("Not enough market history to calculate a signal."),
    ).toBeVisible();
    expect(
      screen.getByText("Not enough market history to run the backtest."),
    ).toBeVisible();
    expect(
      screen.queryByText("Historical performance"),
    ).not.toBeInTheDocument();
  });

  it("displays historical performance for the selected symbol and timeframe", () => {
    useMarketCandlesMock.mockReturnValue({
      candles: sufficientCandles,
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastUpdated: null,
      refreshCandles: vi.fn(),
    });

    render(<Home />);

    expect(screen.getByText("Historical performance")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "BTCUSDT" }),
    ).toBeVisible();
    expect(screen.getByText("1h / 1 candle ahead")).toBeVisible();
    expect(backtestSignalsMock).toHaveBeenCalledWith(
      sufficientCandles,
      35,
      1,
      0.1,
    );
  });

  it("updates historical performance when the timeframe changes", async () => {
    const updatedTimeframeCandles = [...sufficientCandles];
    useMarketCandlesMock.mockImplementation(
      ({ interval }: { interval: string }) => ({
        candles:
          interval === "4h"
            ? updatedTimeframeCandles
            : sufficientCandles,
        isLoading: false,
        isRefreshing: false,
        error: null,
        lastUpdated: null,
        refreshCandles: vi.fn(),
      }),
    );
    const user = userEvent.setup();

    render(<Home />);

    await user.click(screen.getByRole("button", { name: "4h" }));

    expect(screen.getByText("4h / 1 candle ahead")).toBeVisible();
    expect(useMarketCandlesMock).toHaveBeenLastCalledWith({
      symbol: "BTCUSDT",
      interval: "4h",
      limit: 100,
    });
    expect(backtestSignalsMock).toHaveBeenLastCalledWith(
      updatedTimeframeCandles,
      35,
      1,
      0.1,
    );
  });
});
