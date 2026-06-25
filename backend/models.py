"""Pydantic models for SpaceSort API."""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str
    password: str
    name: str = ""


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    subscription_status: str
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Spaces ────────────────────────────────────────────────────────────

class SpaceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    dimensions: Optional[str] = None


class SpaceResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    photo_path: Optional[str]
    dimensions: Optional[str]
    status: str
    created_at: str


# ── Plans ─────────────────────────────────────────────────────────────

class PlanResponse(BaseModel):
    id: str
    space_id: str
    user_id: str
    plan_data: dict
    shopping_list: Optional[dict]
    status: str
    created_at: str


class ShoppingItemResponse(BaseModel):
    id: str
    plan_id: str
    product_name: str
    product_url: Optional[str]
    retailer: Optional[str]
    price: Optional[float]
    affiliate_url: Optional[str]
    category: Optional[str]
    quantity: int


# ── Payments ──────────────────────────────────────────────────────────

class CheckoutSession(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str


class PaymentResponse(BaseModel):
    id: str
    amount: float
    status: str
    type: str
    created_at: str


# ── KPI ───────────────────────────────────────────────────────────────

class KPIEvent(BaseModel):
    event_type: str
    metadata: Optional[dict] = None


class KPISummary(BaseModel):
    total_plans: int
    total_users: int
    total_revenue: float
    active_subscriptions: int
    avg_rating: Optional[float]