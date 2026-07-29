from fastapi import FastAPI

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
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "prediction-api",
    }