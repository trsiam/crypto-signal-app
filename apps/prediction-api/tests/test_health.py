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