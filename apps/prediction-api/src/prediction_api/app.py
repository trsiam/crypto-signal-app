from fastapi import FastAPI
from fastapi.responses import JSONResponse

from prediction_api.dependencies import check_postgres, check_redis

app = FastAPI(
    title="Crypto Signal Prediction API",
    version="0.1.0",
)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "Crypto Signal Prediction API",
    }


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