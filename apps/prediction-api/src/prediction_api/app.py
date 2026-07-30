from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from prediction_api.dependencies import check_postgres, check_redis
from prediction_api.market_data import MarketDataError, get_current_price

app = FastAPI(
    title="Crypto Signal Prediction API",
    version="0.1.0",
)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Crypto Signal Prediction API"}


@app.get("/health")
def health_check() -> JSONResponse:
    postgres_ok = check_postgres()
    redis_ok = check_redis()
    all_healthy = postgres_ok and redis_ok

    return JSONResponse(
        status_code=200 if all_healthy else 503,
        content={
            "status": "ok" if all_healthy else "error",
            "service": "prediction-api",
            "dependencies": {
                "postgres": "ok" if postgres_ok else "error",
                "redis": "ok" if redis_ok else "error",
            },
        },
    )


@app.get("/market/price/{symbol}")
def current_market_price(symbol: str) -> dict[str, str | float]:
    normalized_symbol = symbol.upper()

    if not normalized_symbol.isalnum():
        raise HTTPException(
            status_code=422,
            detail="Symbol must contain only letters and numbers",
        )

    try:
        return get_current_price(normalized_symbol)
    except MarketDataError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc