import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("GET /api/health", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 when the prediction API is healthy", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: "ok",
            service: "prediction-api",
            dependencies: {
              postgres: "ok",
              redis: "ok",
            },
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

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      service: "web",
      dependencies: {
        predictionApi: {
          status: "ok",
          service: "prediction-api",
          dependencies: {
            postgres: "ok",
            redis: "ok",
          },
        },
      },
    });
  });

  it("returns 502 when the prediction API returns an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 503,
        }),
      ),
    );

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      status: "error",
      service: "web",
      dependency: "prediction-api",
    });
  });
});