import httpx
import pytest

from prediction_api.market_data import MarketDataError, get_current_price


def test_get_current_price_returns_normalized_market_data(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def mock_get(*args: object, **kwargs: object) -> httpx.Response:
        request = httpx.Request("GET", "https://api.binance.com")
        return httpx.Response(
            status_code=200,
            json={
                "symbol": "BTCUSDT",
                "price": "63821.80000000",
            },
            request=request,
        )

    monkeypatch.setattr(httpx, "get", mock_get)

    result = get_current_price("btcusdt")

    assert result == {
        "symbol": "BTCUSDT",
        "price": 63821.8,
    }


def test_get_current_price_raises_market_data_error_on_http_failure(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def mock_get(*args: object, **kwargs: object) -> httpx.Response:
        request = httpx.Request("GET", "https://api.binance.com")
        return httpx.Response(
            status_code=400,
            request=request,
        )

    monkeypatch.setattr(httpx, "get", mock_get)

    with pytest.raises(
        MarketDataError,
        match="Could not retrieve market data for INVALID",
    ):
        get_current_price("invalid")