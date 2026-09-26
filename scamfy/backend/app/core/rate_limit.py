import time
from collections import defaultdict

from backend.app.core.config import settings
from fastapi import HTTPException, Request, status

_request_history: dict[str, list[float]] = defaultdict(list)


def check_rate_limit(request: Request) -> None:
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    window_start = now - 60.0

    # Retain only timestamps from the last 60 seconds
    history = [t for t in _request_history[client_ip] if t > window_start]

    if len(history) >= settings.RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Maximum 60 requests per minute allowed.",
            headers={"Retry-After": "60"},
        )

    history.append(now)
    _request_history[client_ip] = history
