from fastapi import APIRouter, HTTPException, status

from app.api.schemas import CreateLeadRequest, CreateLeadResponse
from app.api.voice import trigger_outbound_call
from app.services.lead_service import (
    create_lead,
    get_lead,
    update_lead_by_phone,
)

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.post(
    "",
    response_model=CreateLeadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_lead_endpoint(request: CreateLeadRequest):
    lead = create_lead(request)

    try:
        call = trigger_outbound_call(
            phone_number=request.phone_number,
            lead_id=lead["id"],
        )
    except HTTPException as exc:
        update_lead_by_phone(
            request.phone_number,
            call_status="call_failed",
            call_outcome="failed",
        )
        raise exc

    update_lead_by_phone(
        request.phone_number,
        call_status=call.get("call_status") or "calling",
        call_sid=call.get("call_sid"),
    )

    return CreateLeadResponse(
        lead_id=lead["id"],
        status="calling",
    )


@router.get("/{lead_id}")
async def get_lead_endpoint(lead_id: str):
    lead = get_lead(lead_id)

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    return lead