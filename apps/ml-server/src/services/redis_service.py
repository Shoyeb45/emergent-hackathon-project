import redis
from redis.exceptions import TimeoutError as RedisTimeoutError
import logging
from typing import Optional
import os

logger = logging.getLogger(__name__)


class RedisClient:
    _instance: Optional["RedisClient"] = None

    def __init__(self):
        host = os.getenv("REDIS_HOST", "localhost")
        port = int(os.getenv("REDIS_PORT", "6379"))
        password = os.getenv("REDIS_PASSWORD") or None
        self.redis = redis.Redis(
            host=host,
            port=port,
            password=password,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
        )
        self._is_connected = False
        self._connect()

    def _connect(self):
        try:
            self.redis.ping()
            self._is_connected = True
            logger.info("Redis client connected and ready")
        except redis.RedisError as e:
            self._is_connected = False
            logger.error("Redis connection failed", exc_info=e)

    @classmethod
    def get_instance(cls) -> "RedisClient":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def is_ready(self) -> bool:
        return self._is_connected

    def get(self, key: str) -> Optional[str]:
        return self.redis.get(key)

    def set(self, key: str, value: str, ttl_seconds: int):
        self.redis.setex(key, ttl_seconds, value)

    def set_session(self, session_id: str, value: str):
        self.set(session_id, value, 20 * 60)

    def delete(self, key: str):
        self.redis.delete(key)

    def xadd_event(
        self,
        stream_key: str,
        event_type: str,
        payload: dict,
        max_len: Optional[int] = 10000,
    ) -> Optional[str]:
        import json
        import time
        try:
            fields = {
                "event": event_type,
                "payload": json.dumps(payload, default=str),
                "ts": str(time.time()),
            }
            kwargs = {}
            if max_len:
                kwargs["maxlen"] = max_len
                kwargs["approximate"] = True
            msg_id = self.redis.xadd(stream_key, fields, **kwargs)
            return msg_id
        except redis.RedisError as e:
            logger.error("Redis XADD event failed", exc_info=e)
            return None

    def create_consumer_group(
        self, stream_key: str, group_name: str, start_id: str = "0"
    ) -> bool:
        try:
            self.redis.xgroup_create(
                stream_key, group_name, id=start_id, mkstream=True
            )
            logger.info("Consumer group %s created for stream %s", group_name, stream_key)
            return True
        except redis.RedisError as e:
            if "BUSYGROUP" in str(e):
                logger.debug("Consumer group %s already exists", group_name)
                return True
            logger.error("Redis XGROUP CREATE failed", exc_info=e)
            return False

    def read_from_group(
        self,
        stream_key: str,
        group_name: str,
        consumer_name: str,
        count: int = 1,
        block_ms: int = 5000,
    ):
        try:
            result = self.redis.xreadgroup(
                groupname=group_name,
                consumername=consumer_name,
                streams={stream_key: ">"},
                count=count,
                block=block_ms,
            )
            if not result:
                return []
            messages = result[0][1] if result else []
            return [(msg_id, dict(fields)) for msg_id, fields in messages]
        except RedisTimeoutError:
            # Block timeout with no messages - normal, not an error
            return []
        except redis.RedisError as e:
            logger.error("Redis XREADGROUP failed", exc_info=e)
            return []

    def acknowledge(self, stream_key: str, group_name: str, message_id: str) -> bool:
        try:
            self.redis.xack(stream_key, group_name, message_id)
            return True
        except redis.RedisError as e:
            logger.error("Redis XACK failed for %s", message_id, exc_info=e)
            return False

    def health_check(self) -> bool:
        try:
            return self.redis.ping() is True
        except redis.RedisError as e:
            logger.error("Redis health check failed", exc_info=e)
            return False

    def close(self):
        try:
            self.redis.close()
            logger.info("Redis connection closed gracefully")
        except redis.RedisError as e:
            logger.error("Error closing Redis connection", exc_info=e)
