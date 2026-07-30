import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("GET /api/market/price/[symbol]", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns market price data from the prediction API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            symbol: "BTCUSDT",
            price: 64756.2,
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

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({
        symbol: "BTCUSDT",
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      symbol: "BTCUSDT",
      price: 64756.2,
    });
  });

  it("forwards prediction API error responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            detail: "Symbol must contain only letters and numbers",
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

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({
        symbol: "BTC-USDT",
      }),
    });

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      detail: "Symbol must contain only letters and numbers",
    });
  });

  it("returns 503 when the prediction API is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Connection failed")),
    );

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({
        symbol: "BTCUSDT",
      }),
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      detail: "Prediction API is unavailable",
    });
  });
});