# Prediction API

FastAPI service for the Crypto Signal Prediction Web App.

## Current Endpoints

- `GET /` - basic API information
- `GET /health` - service health check
- `GET /docs` - interactive Swagger API documentation

## Run Locally

From the repository root, run:

    uv run --project apps/prediction-api uvicorn prediction_api.app:app --app-dir apps/prediction-api/src --reload --port 8001

Then open:

    http://127.0.0.1:8001

## Development Checks

Compile the Python source:

    uv run --project apps/prediction-api python -m compileall apps/prediction-api/src

Run Ruff:

    uv run --project apps/prediction-api ruff check apps/prediction-api/src

## Project Role

This service will eventually own:

- Technical-indicator calculations
- Feature engineering
- Prediction inference
- Model training and evaluation
- Backtesting
- Confidence calibration
- Model versioning

It will not own the public web interface or browser sessions.