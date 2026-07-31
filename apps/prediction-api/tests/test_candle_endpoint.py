from fastapi.testclient import TestClient

from prediction_api.app import app
from prediction_api.candles import CandleDataError

client = TestClient(app)


def test_candle_endpoint_returns_historical_data(monkeypatch) -> None:
    def mock_get_candles(
        symbol: str,
        interval: str,
        limit: int,
    ) -> list[dict[str, int | float]]:
        assert symbol == "BTCUSDT"
        assert interval == "1h"
        assert limit == 2

        return [
            {
                "open_time": 1785513600000,
                "open": 62716.57,
                "high": 62931.79,
                "low": 62709.01,
                "close": 62870.88,
                "volume": 857.24803,
                "close_time": 1785517199999,
            },
            {
                "open_time": 1785517200000,
                "open": 62870.87,
                "high": 63301.68,
                "low": 62800.0,
                "close": 63245.44,
                "volume": 856.72938,
                "close_time": 1785520799999,
            },
        ]

    monkeypatch.setattr(
        "prediction_api.app.get_candles",
        mock_get_candles,
    )

    response = client.get(
        "/market/candles/BTCUSDT?interval=1h&limit=2"
    )

    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["close"] == 62870.88


def test_candle_endpoint_rejects_invalid_limit() -> None:
    response = client.get(
        "/market/candles/BTCUSDT?interval=1h&limit=0"
    )

    assert response.status_code == 422
    assert response.json() == {
        "detail": "Limit must be between 1 and 1000"
    }


def test_candle_endpoint_returns_502_when_provider_fails(
    monkeypatch,
) -> None:
    def mock_get_candles(
        symbol: str,
        interval: str,
        limit: int,
    ) -> list[dict[str, int | float]]:
        raise CandleDataError(
            f"Could not retrieve candle data for {symbol}"
        )

    monkeypatch.setattr(
        "prediction_api.app.get_candles",
        mock_get_candles,
    )

    response = client.get(
        "/market/candles/BTCUSDT?interval=1h&limit=2"
    )

    assert response.status_code == 502
    assert response.json() == {
        "detail": "Could not retrieve candle data for BTCUSDT"
    }