from typing import Any

import httpx

BINANCE_API_URL = "https://api.binance.com/api/v3/ticker/price"


class MarketDataError(Exception):
    """Raised when live market data cannot be retrieved."""


def get_current_price(symbol: str) -> dict[str, Any]:
    normalized_symbol = symbol.upper()

    try:
        response = httpx.get(
            BINANCE_API_URL,
            params={"symbol": normalized_symbol},
            timeout=5.0,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise MarketDataError(
            f"Could not retrieve market data for {normalized_symbol}"
        ) from exc

    data = response.json()

    return {
        "symbol": data["symbol"],
        "price": float(data["price"]),
    }