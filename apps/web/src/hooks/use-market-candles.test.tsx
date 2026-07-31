// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMarketCandles } from "./use-market-candles";

const candle = {
  open_time: 1785513600000,
  open: 62716.57,
  high: 62931.79,
  low: 62709.01,
  close: 62870.88,
  volume: 857.24803,
  close_time: 1785517199999,
};

describe("useMarketCandles", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("loads historical candle data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([candle]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useMarketCandles({
        symbol: "BTCUSDT",
        interval: "1h",
        limit: 100,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.candles).toEqual([]);

    await waitFor(() => {
      expect(result.current.candles).toEqual([candle]);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeInstanceOf(Date);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/market/candles/BTCUSDT?interval=1h&limit=100",
      {
        cache: "no-store",
      },
    );
  });

  it("shows an error when the initial request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 502,
        }),
      ),
    );

    const { result } = renderHook(() =>
      useMarketCandles({
        symbol: "BTCUSDT",
      }),
    );

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Historical market data is currently unavailable.",
      );
    });

    expect(result.current.candles).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("refreshes the candle data manually", async () => {
    const updatedCandle = {
      ...candle,
      close: 63245.44,
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([candle]), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([updatedCandle]), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useMarketCandles({
        symbol: "BTCUSDT",
      }),
    );

    await waitFor(() => {
      expect(result.current.candles).toEqual([candle]);
    });

    await act(async () => {
      result.current.refreshCandles();
    });

    await waitFor(() => {
      expect(result.current.candles).toEqual([updatedCandle]);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});