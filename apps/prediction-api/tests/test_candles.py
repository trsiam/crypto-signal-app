import httpx
import pytest

from prediction_api.candles import CandleDataError, get_candles


def test_get_candles_returns_normalized_candle_data(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def mock_get(*args: object, **kwargs: object) -> httpx.Response:
        request = httpx.Request("GET", "https://api.binance.com")

        return httpx.Response(
            status_code=200,
            json=[
                [
                    1785513600000,
                    "62716.57",
                    "62931.79",
                    "62709.01",
                    "62870.88",
                    "857.24803",
                    1785517199999,
                ],
            ],
            request=request,
        )

    monkeypatch.setattr(httpx, "get", mock_get)

    result = get_candles("btcusdt", "1h", 1)

    assert result == [
        {
            "open_time": 1785513600000,
            "open": 62716.57,
            "high": 62931.79,
            "low": 62709.01,
            "close": 62870.88,
            "volume": 857.24803,
            "close_time": 1785517199999,
        }
    ]


def test_get_candles_raises_error_when_binance_request_fails(
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
        CandleDataError,
        match="Could not retrieve candle data for INVALID",
    ):
        get_candles("invalid")