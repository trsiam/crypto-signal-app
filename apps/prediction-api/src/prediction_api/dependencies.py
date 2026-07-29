import psycopg
from redis import Redis
from redis.exceptions import RedisError

from prediction_api.config import get_settings


def check_postgres() -> bool:
    settings = get_settings()

    try:
        with (
            psycopg.connect(
                settings.database_url,
                connect_timeout=3,
            ) as connection,
            connection.cursor() as cursor,
        ):
            cursor.execute("SELECT 1")
            return cursor.fetchone() == (1,)
    except psycopg.Error:
        return False


def check_redis() -> bool:
    settings = get_settings()

    try:
        client = Redis.from_url(
            settings.redis_url,
            socket_connect_timeout=3,
            decode_responses=True,
        )
        return bool(client.ping())
    except RedisError:
        return False