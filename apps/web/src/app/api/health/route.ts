import { NextResponse } from "next/server";

const PREDICTION_API_URL =
  process.env.PREDICTION_API_URL ?? "http://127.0.0.1:8001";

export async function GET() {
  try {
    const response = await fetch(`${PREDICTION_API_URL}/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "error",
          service: "web",
          dependency: "prediction-api",
        },
        { status: 502 },
      );
    }

    const predictionApiHealth = await response.json();

    return NextResponse.json({
      status: "ok",
      service: "web",
      dependencies: {
        predictionApi: predictionApiHealth,
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        service: "web",
        dependency: "prediction-api",
      },
      { status: 503 },
    );
  }
}