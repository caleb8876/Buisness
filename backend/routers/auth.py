"""Authentication router - signup, login, profile."""

import uuid
import hashlib
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from jose import jwt, JWTError

from ..database import query, mutate
from ..models import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Simple JWT secret (rotate in production)
JWT_SECRET = secrets.token_hex(32)
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 48


def hash_password(password: str) -> str:
    """Hash password with SHA-256 + salt."""
    salt = secrets.token_hex(8)
    h = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{h}"


def verify_password(password: str, stored: str) -> bool:
    salt, h = stored.split(":", 1)
    return hashlib.sha256((salt + password).encode()).hexdigest() == h


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(token: str) -> dict:
    """Decode JWT and return user dict."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        rows = query(f"SELECT * FROM users WHERE id = '{user_id}'")
        if not rows:
            raise HTTPException(status_code=401, detail="User not found")
        return rows[0]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/signup", response_model=TokenResponse)
def signup(data: UserCreate):
    # Check if email exists
    existing = query(f"SELECT id FROM users WHERE email = '{data.email}'")
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    pw_hash = hash_password(data.password)
    mutate(
        f"INSERT INTO users (id, email, password_hash, name) "
        f"VALUES ('{user_id}', '{data.email}', '{pw_hash}', '{data.name}')"
    )

    user = query(f"SELECT * FROM users WHERE id = '{user_id}'")[0]
    token = create_token(user_id)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            subscription_status=user["subscription_status"],
            created_at=user["created_at"],
        ),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin):
    rows = query(f"SELECT * FROM users WHERE email = '{data.email}'")
    if not rows:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = rows[0]
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            subscription_status=user["subscription_status"],
            created_at=user["created_at"],
        ),
    )


@router.get("/me", response_model=UserResponse)
def get_profile(authorization: str = ""):
    """Get current user profile. Pass token as 'Bearer <token>' in Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.split(" ", 1)[1]
    user = get_current_user(token)
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        subscription_status=user["subscription_status"],
        created_at=user["created_at"],
    )