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
import { afterEach, describe, expect, it, vi } from "vitest";

import Home from "./page";

vi.mock("../hooks/use-market-candles", () => ({
  useMarketCandles: () => ({
    candles: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    refreshCandles: vi.fn(),
  }),
}));

describe("Home page", () => {
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
});