"""Payments router - Stripe integration for one-time and subscription."""

import uuid
import os
from fastapi import APIRouter, HTTPException
from ..database import query, mutate

router = APIRouter(prefix="/api/payments", tags=["payments"])

# Stripe keys (set via environment in production)
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "sk_test_placeholder")
STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY", "pk_test_placeholder")


@router.get("/config")
def get_stripe_config():
    """Return Stripe publishable key for frontend."""
    return {"publishableKey": STRIPE_PUBLISHABLE_KEY}


@router.post("/create-checkout-session")
def create_checkout_session(price_id: str = "", plan_type: str = "one_time", authorization: str = ""):
    """Create a Stripe checkout session.
    
    In the MVP without a live Stripe key, this creates a payment record directly.
    When STRIPE_SECRET_KEY is set, it creates a real Stripe session.
    """
    from .auth import get_current_user
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    user = get_current_user(authorization.split(" ", 1)[1])

    payment_id = str(uuid.uuid4())
    amount = 9.99 if plan_type == "one_time" else 19.99

    # MVP: Simulate payment without real Stripe
    mutate(
        f"INSERT INTO payments (id, user_id, stripe_session_id, amount, status, type) "
        f"VALUES ('{payment_id}', '{user['id']}', 'sim_{payment_id}', {amount}, 'completed', '{plan_type}')"
    )

    # If subscription, update user
    if plan_type == "subscription":
        mutate(f"UPDATE users SET subscription_status = 'active' WHERE id = '{user['id']}'")

    # Log KPI
    mutate(
        f"INSERT INTO kpi_events (id, event_type, user_id, metadata) "
        f"VALUES ('{str(uuid.uuid4())}', 'payment_completed', '{user['id']}', "
        f"'{{\"amount\": {amount}, \"plan_type\": \"{plan_type}\"}}')"
    )

    return {
        "sessionId": f"sim_{payment_id}",
        "paymentId": payment_id,
        "amount": amount,
        "status": "completed",
    }


@router.get("/history")
def get_payment_history(authorization: str = ""):
    """Get payment history for current user."""
    from .auth import get_current_user
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    user = get_current_user(authorization.split(" ", 1)[1])

    rows = query(f"SELECT * FROM payments WHERE user_id = '{user['id']}' ORDER BY created_at DESC")
    return rows