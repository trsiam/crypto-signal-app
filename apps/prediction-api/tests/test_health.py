from unittest.mock import patch

from fastapi.testclient import TestClient

from prediction_api.app import app


client = TestClient(app)


@patch("prediction_api.app.check_postgres", return_value=True)
@patch("prediction_api.app.check_redis", return_value=True)
def test_health_endpoint_when_dependencies_are_healthy(
    _mock_redis: object,
    _mock_postgres: object,
) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "prediction-api",
        "dependencies": {
            "postgres": "ok",
            "redis": "ok",
        },
    }

@patch("prediction_api.app.check_postgres", return_value=False)
@patch("prediction_api.app.check_redis", return_value=True)
def test_health_endpoint_when_postgres_is_unavailable(
    _mock_redis: object,
    _mock_postgres: object,
) -> None:
    response = client.get("/health")

    assert response.status_code == 503
    assert response.json() == {
        "status": "error",
        "service": "prediction-api",
        "dependencies": {
            "postgres": "error",
            "redis": "ok",
        },
    }

@patch("prediction_api.app.check_postgres", return_value=True)
@patch("prediction_api.app.check_redis", return_value=False)
def test_health_endpoint_when_redis_is_unavailable(
    _mock_redis: object,
    _mock_postgres: object,
) -> None:
    response = client.get("/health")

    assert response.status_code == 503
    assert response.json() == {
        "status": "error",
        "service": "prediction-api",
        "dependencies": {
            "postgres": "ok",
            "redis": "error",
        },
    }