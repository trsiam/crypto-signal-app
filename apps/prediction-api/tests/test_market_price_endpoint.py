from fastapi.testclient import TestClient

from prediction_api.app import app
from prediction_api.market_data import MarketDataError

client = TestClient(app)


def test_market_price_endpoint_returns_current_price(
    monkeypatch,
) -> None:
    def mock_get_current_price(symbol: str) -> dict[str, str | float]:
        assert symbol == "BTCUSDT"

        return {
            "symbol": "BTCUSDT",
            "price": 64869.84,
        }

    monkeypatch.setattr(
        "prediction_api.app.get_current_price",
        mock_get_current_price,
    )

    response = client.get("/market/price/BTCUSDT")

    assert response.status_code == 200
    assert response.json() == {
        "symbol": "BTCUSDT",
        "price": 64869.84,
    }


def test_market_price_endpoint_returns_502_when_market_data_fails(
    monkeypatch,
) -> None:
    def mock_get_current_price(symbol: str) -> dict[str, str | float]:
        raise MarketDataError(
            f"Could not retrieve market data for {symbol}"
        )

    monkeypatch.setattr(
        "prediction_api.app.get_current_price",
        mock_get_current_price,
    )

    response = client.get("/market/price/BTCUSDT")

    assert response.status_code == 502
    assert response.json() == {
        "detail": "Could not retrieve market data for BTCUSDT"
    }

def test_market_price_endpoint_normalizes_lowercase_symbol(
    monkeypatch,
) -> None:
    def mock_get_current_price(symbol: str) -> dict[str, str | float]:
        assert symbol == "BTCUSDT"

        return {
            "symbol": "BTCUSDT",
            "price": 64869.84,
        }

    monkeypatch.setattr(
        "prediction_api.app.get_current_price",
        mock_get_current_price,
    )

    response = client.get("/market/price/btcusdt")

    assert response.status_code == 200
    assert response.json() == {
        "symbol": "BTCUSDT",
        "price": 64869.84,
    }


def test_market_price_endpoint_rejects_invalid_symbol() -> None:
    response = client.get("/market/price/BTC-USDT")

    assert response.status_code == 422
    assert response.json() == {
        "detail": "Symbol must contain only letters and numbers"
    }