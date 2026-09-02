from fastapi import APIRouter

from app.services.lead_service import get_all_leads, get_lead_stats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/leads")
async def dashboard_leads():
    return get_all_leads()


@router.get("/stats")
async def dashboard_stats():
    return get_lead_stats()
