import { NextResponse } from "next/server";

const PREDICTION_API_URL =
  process.env.PREDICTION_API_URL ?? "http://127.0.0.1:8001";

type RouteContext = {
  params: Promise<{
    symbol: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { symbol } = await context.params;
  const requestUrl = new URL(request.url);

  const interval = requestUrl.searchParams.get("interval") ?? "1h";
  const limit = requestUrl.searchParams.get("limit") ?? "100";

  const backendUrl = new URL(
    `${PREDICTION_API_URL}/market/candles/${encodeURIComponent(symbol)}`,
  );

  backendUrl.searchParams.set("interval", interval);
  backendUrl.searchParams.set("limit", limit);

  try {
    const response = await fetch(backendUrl, {
      cache: "no-store",
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, {
        status: response.status,
      });
    }

    return NextResponse.json(data, {
      status: 200,
    });
  } catch {
    return NextResponse.json(
      {
        detail: "Prediction API is unavailable",
      },
      {
        status: 503,
      },
    );
  }
}