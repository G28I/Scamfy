import time

from backend.app.core.config import settings
from fastapi import HTTPException, Request, status

_request_history: dict[str, list[float]] = {}


def check_rate_limit(request: Request) -> None:
    now = time.time()
    window_start = now - 60.0

    # Evict expired timestamps and idle keys across all tracked IPs
    idle_keys = []
    for ip, timestamps in _request_history.items():
        valid_ts = [t for t in timestamps if t > window_start]
        if not valid_ts:
            idle_keys.append(ip)
        else:
            _request_history[ip] = valid_ts

    for ip in idle_keys:
        del _request_history[ip]

    # Resolve client identity: if authenticated internal BFF, use forwarded client IP
    internal_secret = request.headers.get("X-Internal-Secret")
    if internal_secret and internal_secret == settings.INTERNAL_API_SECRET:
        client_ip = request.headers.get("X-Client-IP") or (
            request.client.host if request.client else "127.0.0.1"
        )
    else:
        client_ip = request.client.host if request.client else "127.0.0.1"

    history = _request_history.get(client_ip, [])

    if len(history) >= settings.RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Maximum 60 requests per minute allowed.",
            headers={"Retry-After": "60"},
        )

    history.append(now)
    _request_history[client_ip] = history
