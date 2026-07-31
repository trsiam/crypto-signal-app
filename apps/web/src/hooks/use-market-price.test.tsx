// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMarketPrice } from "./use-market-price";

describe("useMarketPrice", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("loads the initial market price", async () => {
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

    const { result } = renderHook(() => useMarketPrice("BTCUSDT"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.marketPrice).toBeNull();

    await waitFor(() => {
      expect(result.current.marketPrice).toEqual({
        symbol: "BTCUSDT",
        price: 64869.84,
      });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it("changes the selected symbol and loads its price", async () => {
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

    const { result } = renderHook(() => useMarketPrice("BTCUSDT"));

    await waitFor(() => {
      expect(result.current.marketPrice?.symbol).toBe("BTCUSDT");
    });

    act(() => {
      result.current.changeSymbol("ETHUSDT");
    });

    await waitFor(() => {
      expect(result.current.marketPrice).toEqual({
        symbol: "ETHUSDT",
        price: 3210.5,
      });
    });

    expect(result.current.selectedSymbol).toBe("ETHUSDT");
  });
  it("keeps the previous price when an automatic refresh fails", async () => {
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

  const { result } = renderHook(() => useMarketPrice("BTCUSDT"));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(result.current.marketPrice).toEqual({
    symbol: "BTCUSDT",
    price: 64869.84,
  });

  await act(async () => {
    await vi.advanceTimersByTimeAsync(5_000);
    await Promise.resolve();
  });

  expect(result.current.marketPrice).toEqual({
    symbol: "BTCUSDT",
    price: 64869.84,
  });

  expect(result.current.error).toBe(
    "The latest refresh failed. Showing the last available price.",
  );
});

it("refreshes the price manually", async () => {
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

  const { result } = renderHook(() => useMarketPrice("BTCUSDT"));

  await waitFor(() => {
    expect(result.current.marketPrice?.price).toBe(64869.84);
  });

  await act(async () => {
    result.current.refreshPrice();
  });

  await waitFor(() => {
    expect(result.current.marketPrice?.price).toBe(64910.25);
  });

  expect(fetchMock).toHaveBeenCalledTimes(2);
});
});