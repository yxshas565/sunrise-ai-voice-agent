from pathlib import Path
from typing import Optional
from xml.etree import ElementTree

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.services.lead_service import (
    update_lead_by_call_sid,
    update_lead_by_phone,
)

router = APIRouter(prefix="/api/voice", tags=["voice"])


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        extra="ignore",
    )

    exotel_account_sid: str
    exotel_api_key: str
    exotel_api_token: str
    exotel_subdomain: str = "https://api.in.exotel.com"
    exotel_caller_id: str
    exotel_app_id: str
    public_api_url: str


settings = Settings()


class SaveLeadRequest(BaseModel):
    phone_number: Optional[str] = None
    project_type: Optional[str] = None
    timeline: Optional[str] = None
    preferred_language: Optional[str] = None
    meeting_requested: bool = False
    meeting_confirmed: bool = False


def trigger_outbound_call(phone_number: str, lead_id: str) -> dict:
    endpoint = (
        f"{settings.exotel_subdomain.rstrip('/')}"
        f"/v1/Accounts/{settings.exotel_account_sid}/Calls/connect"
    )

    flow_url = (
        f"http://my.exotel.com/"
        f"{settings.exotel_account_sid}"
        f"/exoml/start_voice/{settings.exotel_app_id}"
    )

    status_callback = (
        f"{settings.public_api_url.rstrip('/')}"
        f"/api/voice/exotel/status"
    )

    payload = {
        "From": (
            "0" + phone_number[-10:]
            if phone_number.startswith("+91")
            else phone_number
        ),
        "CallerId": settings.exotel_caller_id,
        "Url": flow_url,
        "CallType": "trans",
        "StatusCallback": status_callback,
    }

    try:
        response = httpx.post(
            endpoint,
            auth=(settings.exotel_api_key, settings.exotel_api_token),
            data=payload,
            timeout=20.0,
        )
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not reach Exotel: {exc}",
        ) from exc

    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Exotel rejected the call: {response.text[:1000]}",
        )

    try:
        root = ElementTree.fromstring(response.text)
        call_sid = root.findtext(".//sid") or root.findtext(".//Sid")
        call_status = (
            root.findtext(".//status")
            or root.findtext(".//Status")
            or "queued"
        )
    except ElementTree.ParseError:
        call_sid = None
        call_status = "queued"

    return {
        "success": True,
        "call_sid": call_sid,
        "call_status": call_status,
        "lead_id": lead_id,
    }


def map_exotel_status(status: Optional[str]) -> tuple[str, Optional[str]]:
    if not status:
        return "calling", None

    normalized = status.strip().lower().replace("_", "-")

    mapping = {
        "queued": ("calling", None),
        "initiated": ("calling", None),
        "ringing": ("ringing", None),
        "in-progress": ("in_progress", None),
        "in progress": ("in_progress", None),
        "answered": ("in_progress", None),
        "completed": ("completed", "completed"),
        "busy": ("call_failed", "busy"),
        "failed": ("call_failed", "failed"),
        "no-answer": ("no_answer", "no_answer"),
        "no answer": ("no_answer", "no_answer"),
        "canceled": ("call_failed", "canceled"),
        "cancelled": ("call_failed", "cancelled"),
    }

    return mapping.get(normalized, ("calling", None))


@router.post("/save-lead")
async def save_lead(request: SaveLeadRequest):
    normalized_phone = None

    if request.phone_number:
        normalized_phone = request.phone_number.strip()

        if normalized_phone.startswith("0") and len(normalized_phone) == 11:
            normalized_phone = "+91" + normalized_phone[1:]

        elif normalized_phone.isdigit() and len(normalized_phone) == 10:
            normalized_phone = "+91" + normalized_phone

    if normalized_phone:
        lead = update_lead_by_phone(
            normalized_phone,
            project_type=request.project_type,
            timeline=request.timeline,
            preferred_language=request.preferred_language,
            meeting_requested=request.meeting_requested,
            meeting_confirmed=request.meeting_confirmed,
            call_outcome=(
                "interested"
                if request.meeting_requested
                else "not_interested"
            ),
            status=(
                "qualified"
                if request.meeting_requested
                else "completed"
            ),
            call_status="completed",
        )
    else:
        from app.services.lead_service import get_all_leads

        leads = get_all_leads()

        lead = None

        if leads:
            latest_lead = max(
                leads,
                key=lambda item: item["createdAt"],
            )

            lead = update_lead_by_phone(
                latest_lead["phoneNumber"],
                project_type=request.project_type,
                timeline=request.timeline,
                preferred_language=request.preferred_language,
                meeting_requested=request.meeting_requested,
                meeting_confirmed=request.meeting_confirmed,
                call_outcome=(
                    "interested"
                    if request.meeting_requested
                    else "not_interested"
                ),
                status=(
                    "qualified"
                    if request.meeting_requested
                    else "completed"
                ),
                call_status="completed",
            )

    if lead is None:
        return {
            "success": False,
            "message": "No lead found for this call.",
        }

    return {
        "success": True,
        "message": "Lead details saved successfully.",
        "lead_id": lead["id"],
        "project_type": lead["projectType"],
        "timeline": lead["timeline"],
        "preferred_language": lead["preferredLanguage"],
        "meeting_requested": lead["meetingRequested"],
        "meeting_confirmed": lead["meetingConfirmed"],
        "status": lead["status"],
        "call_status": lead["callStatus"],
    }

@router.post("/exotel/status")
async def exotel_status(request: Request):
    form = await request.form()

    callsid = (
        form.get("callsid")
        or form.get("CallSid")
        or form.get("callSid")
    )

    status = form.get("status") or form.get("Status")

    recordingurl = (
        form.get("recordingurl")
        or form.get("RecordingUrl")
        or form.get("recordingUrl")
    )

    dateupdated = (
        form.get("dateupdated")
        or form.get("DateUpdated")
        or form.get("dateUpdated")
    )

    print(
        "EXOTEL STATUS:",
        {
            "callsid": callsid,
            "status": status,
            "recordingurl": recordingurl,
            "dateupdated": dateupdated,
        },
    )

    product_status, outcome = map_exotel_status(status)

    updated_lead = None

    if callsid:
        updated_lead = update_lead_by_call_sid(
            str(callsid),
            status=product_status,
            call_outcome=outcome,
            recording_url=str(recordingurl) if recordingurl else None,
        )

    return {
        "success": True,
        "updated": updated_lead is not None,
        "status": product_status,
    }
