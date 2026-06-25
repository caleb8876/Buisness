"""Plans router - space upload, plan generation, shopping lists."""

import uuid
import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from ..database import query, mutate
from ..models import SpaceCreate, SpaceResponse, PlanResponse, ShoppingItemResponse

router = APIRouter(prefix="/api/plans", tags=["plans"])


def _get_user(authorization: str) -> dict:
    """Extract user from auth header (simple token for now)."""
    from .auth import get_current_user
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    return get_current_user(authorization.split(" ", 1)[1])


@router.post("/spaces", response_model=SpaceResponse)
def create_space(
    title: str = Form(...),
    description: str = Form(""),
    dimensions: str = Form(""),
    authorization: str = "",
):
    """Create a new space entry."""
    user = _get_user(authorization)
    space_id = str(uuid.uuid4())

    mutate(
        f"INSERT INTO spaces (id, user_id, title, description, dimensions, status) "
        f"VALUES ('{space_id}', '{user['id']}', '{title}', '{description}', '{dimensions}', 'pending')"
    )

    row = query(f"SELECT * FROM spaces WHERE id = '{space_id}'")[0]
    return SpaceResponse(
        id=row["id"], user_id=row["user_id"], title=row["title"],
        description=row["description"], photo_path=row["photo_path"],
        dimensions=row["dimensions"], status=row["status"],
        created_at=row["created_at"],
    )


@router.get("/spaces", response_model=list[SpaceResponse])
def list_spaces(authorization: str = ""):
    """List all spaces for the current user."""
    user = _get_user(authorization)
    rows = query(f"SELECT * FROM spaces WHERE user_id = '{user['id']}' ORDER BY created_at DESC")
    return [
        SpaceResponse(
            id=r["id"], user_id=r["user_id"], title=r["title"],
            description=r["description"], photo_path=r["photo_path"],
            dimensions=r["dimensions"], status=r["status"],
            created_at=r["created_at"],
        )
        for r in rows
    ]


@router.get("/spaces/{space_id}", response_model=SpaceResponse)
def get_space(space_id: str, authorization: str = ""):
    """Get a specific space."""
    user = _get_user(authorization)
    rows = query(f"SELECT * FROM spaces WHERE id = '{space_id}' AND user_id = '{user['id']}'")
    if not rows:
        raise HTTPException(status_code=404, detail="Space not found")
    r = rows[0]
    return SpaceResponse(
        id=r["id"], user_id=r["user_id"], title=r["title"],
        description=r["description"], photo_path=r["photo_path"],
        dimensions=r["dimensions"], status=r["status"],
        created_at=r["created_at"],
    )


@router.post("/generate/{space_id}", response_model=PlanResponse)
def generate_plan(space_id: str, authorization: str = ""):
    """Generate an organization plan for a space.
    
    For the MVP, this creates a template plan. AI integration (via the AI Product Engineer)
    will replace the template with actual AI-generated content.
    """
    user = _get_user(authorization)
    rows = query(f"SELECT * FROM spaces WHERE id = '{space_id}' AND user_id = '{user['id']}'")
    if not rows:
        raise HTTPException(status_code=404, detail="Space not found")

    space = rows[0]

    # Template plan data (MVP - AI will replace this)
    plan_data = {
        "layout": {
            "zones": [
                {"name": "Zone 1 - Primary Storage", "description": "Main storage area for frequently used items"},
                {"name": "Zone 2 - Secondary Storage", "description": "Seasonal/occasional items"},
                {"name": "Zone 3 - Display", "description": "Items for visual appeal"},
            ],
            "recommendations": [
                "Install adjustable shelving to maximize vertical space",
                "Use clear bins for visibility and easy access",
                "Add drawer dividers for small items",
                "Label everything for maintainability",
            ],
        },
        "space_title": space["title"],
        "space_description": space["description"],
    }

    # Template shopping list (MVP)
    shopping_list = {
        "items": [
            {"product_name": "Clear Storage Bins (Set of 6)", "retailer": "Amazon", "price": 34.99, "category": "storage"},
            {"product_name": "Adjustable Shelving Unit", "retailer": "IKEA", "price": 89.99, "category": "furniture"},
            {"product_name": "Drawer Dividers (Pack of 8)", "retailer": "The Container Store", "price": 14.99, "category": "organization"},
            {"product_name": "Label Maker & Labels", "retailer": "Amazon", "price": 24.99, "category": "labels"},
            {"product_name": "Hangers - Velvet (Pack of 30)", "retailer": "Target", "price": 19.99, "category": "closet"},
        ],
        "total_estimated": 184.95,
    }

    plan_id = str(uuid.uuid4())
    mutate(
        f"INSERT INTO plans (id, space_id, user_id, plan_data, shopping_list, status) "
        f"VALUES ('{plan_id}', '{space_id}', '{user['id']}', "
        f"'{json.dumps(plan_data).replace(chr(39), chr(39)+chr(39))}', "
        f"'{json.dumps(shopping_list).replace(chr(39), chr(39)+chr(39))}', 'active')"
    )

    # Update space status
    mutate(f"UPDATE spaces SET status = 'planned' WHERE id = '{space_id}'")

    # Log KPI event
    mutate(
        f"INSERT INTO kpi_events (id, event_type, user_id, metadata) "
        f"VALUES ('{str(uuid.uuid4())}', 'plan_generated', '{user['id']}', "
        f"'{json.dumps({'space_id': space_id})}')"
    )

    row = query(f"SELECT * FROM plans WHERE id = '{plan_id}'")[0]
    return PlanResponse(
        id=row["id"], space_id=row["space_id"], user_id=row["user_id"],
        plan_data=json.loads(row["plan_data"]),
        shopping_list=json.loads(row["shopping_list"]),
        status=row["status"], created_at=row["created_at"],
    )


@router.get("/", response_model=list[PlanResponse])
def list_plans(authorization: str = ""):
    """List all plans for the current user."""
    user = _get_user(authorization)
    rows = query(f"SELECT * FROM plans WHERE user_id = '{user['id']}' ORDER BY created_at DESC")
    result = []
    for r in rows:
        result.append(PlanResponse(
            id=r["id"], space_id=r["space_id"], user_id=r["user_id"],
            plan_data=json.loads(r["plan_data"]),
            shopping_list=json.loads(r["shopping_list"]),
            status=r["status"], created_at=r["created_at"],
        ))
    return result


@router.get("/{plan_id}", response_model=PlanResponse)
def get_plan(plan_id: str, authorization: str = ""):
    """Get a specific plan."""
    user = _get_user(authorization)
    rows = query(f"SELECT * FROM plans WHERE id = '{plan_id}' AND user_id = '{user['id']}'")
    if not rows:
        raise HTTPException(status_code=404, detail="Plan not found")
    r = rows[0]
    return PlanResponse(
        id=r["id"], space_id=r["space_id"], user_id=r["user_id"],
        plan_data=json.loads(r["plan_data"]),
        shopping_list=json.loads(r["shopping_list"]),
        status=r["status"], created_at=r["created_at"],
    )