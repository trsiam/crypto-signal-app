from typing import Any

import httpx

BINANCE_KLINES_URL = "https://api.binance.com/api/v3/klines"


class CandleDataError(Exception):
    """Raised when historical candle data cannot be retrieved."""


def get_candles(
    symbol: str,
    interval: str = "1h",
    limit: int = 100,
) -> list[dict[str, Any]]:
    normalized_symbol = symbol.upper()

    try:
        response = httpx.get(
            BINANCE_KLINES_URL,
            params={
                "symbol": normalized_symbol,
                "interval": interval,
                "limit": limit,
            },
            timeout=10.0,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise CandleDataError(
            f"Could not retrieve candle data for {normalized_symbol}"
        ) from exc

    candles = response.json()

    return [
        {
            "open_time": candle[0],
            "open": float(candle[1]),
            "high": float(candle[2]),
            "low": float(candle[3]),
            "close": float(candle[4]),
            "volume": float(candle[5]),
            "close_time": candle[6],
        }
        for candle in candles
    ]