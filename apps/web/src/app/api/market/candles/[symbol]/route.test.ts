import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("GET /api/market/candles/[symbol]", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns candle data from the prediction API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              open_time: 1785513600000,
              open: 62716.57,
              high: 62931.79,
              low: 62709.01,
              close: 62870.88,
              volume: 857.24803,
              close_time: 1785517199999,
            },
          ]),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      ),
    );

    const response = await GET(
      new Request(
        "http://localhost/api/market/candles/BTCUSDT?interval=1h&limit=1",
      ),
      {
        params: Promise.resolve({
          symbol: "BTCUSDT",
        }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        open_time: 1785513600000,
        open: 62716.57,
        high: 62931.79,
        low: 62709.01,
        close: 62870.88,
        volume: 857.24803,
        close_time: 1785517199999,
      },
    ]);
  });

  it("forwards prediction API validation errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            detail: "Limit must be between 1 and 1000",
          }),
          {
            status: 422,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      ),
    );

    const response = await GET(
      new Request(
        "http://localhost/api/market/candles/BTCUSDT?interval=1h&limit=0",
      ),
      {
        params: Promise.resolve({
          symbol: "BTCUSDT",
        }),
      },
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      detail: "Limit must be between 1 and 1000",
    });
  });

  it("returns 503 when the prediction API is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Connection failed")),
    );

    const response = await GET(
      new Request(
        "http://localhost/api/market/candles/BTCUSDT?interval=1h&limit=1",
      ),
      {
        params: Promise.resolve({
          symbol: "BTCUSDT",
        }),
      },
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      detail: "Prediction API is unavailable",
    });
  });
});