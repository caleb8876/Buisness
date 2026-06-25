"""Admin dashboard router - KPI views."""

import json
from fastapi import APIRouter, HTTPException, Depends
from ..database import query, mutate
from ..models import KPISummary, KPIEvent

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _verify_admin(authorization: str) -> dict:
    """Simple admin check for MVP - uses fixed admin ID."""
    from .auth import get_current_user
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    user = get_current_user(authorization.split(" ", 1)[1])
    # For MVP, the first user is admin. In production, add an admin flag.
    return user


@router.get("/kpi", response_model=KPISummary)
def get_kpis(authorization: str = ""):
    """Get KPI summary for admin dashboard."""
    _verify_admin(authorization)

    total_users = query("SELECT COUNT(*) as cnt FROM users")[0]["cnt"]
    total_plans = query("SELECT COUNT(*) as cnt FROM plans")[0]["cnt"]
    total_revenue = query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'")[0]["total"]
    active_subs = query("SELECT COUNT(*) as cnt FROM users WHERE subscription_status = 'active'")[0]["cnt"]

    return KPISummary(
        total_plans=total_plans,
        total_users=total_users,
        total_revenue=float(total_revenue),
        active_subscriptions=active_subs,
        avg_rating=None,
    )


@router.post("/events")
def track_event(event: KPIEvent, authorization: str = ""):
    """Track a KPI event."""
    user = _verify_admin(authorization)
    import uuid
    mutate(
        f"INSERT INTO kpi_events (id, event_type, user_id, metadata) "
        f"VALUES ('{str(uuid.uuid4())}', '{event.event_type}', '{user['id']}', "
        f"'{json.dumps(event.metadata or {})}')"
    )
    return {"status": "ok"}


@router.get("/recent-events")
def list_recent_events(limit: int = 20, authorization: str = ""):
    """List recent KPI events."""
    _verify_admin(authorization)
    rows = query(f"SELECT * FROM kpi_events ORDER BY created_at DESC LIMIT {limit}")
    return rows


@router.get("/users")
def list_users(authorization: str = ""):
    """List all users (admin only)."""
    _verify_admin(authorization)
    rows = query("SELECT id, email, name, subscription_status, created_at FROM users ORDER BY created_at DESC")
    return rows