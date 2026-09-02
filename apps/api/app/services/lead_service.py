from datetime import datetime, timezone
from pathlib import Path
import sqlite3
from uuid import uuid4

from app.api.schemas import CreateLeadRequest


DB_PATH = Path(__file__).resolve().parents[2] / "data" / "sunrise.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id TEXT PRIMARY KEY,
                phone_number TEXT NOT NULL,
                project_type TEXT DEFAULT 'unknown',
                timeline TEXT DEFAULT 'unknown',
                preferred_language TEXT DEFAULT 'unknown',
                meeting_requested INTEGER DEFAULT 0,
                meeting_confirmed INTEGER DEFAULT 0,
                call_outcome TEXT DEFAULT 'unknown',
                status TEXT DEFAULT 'new',
                call_status TEXT DEFAULT 'calling',
                call_sid TEXT,
                recording_url TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )

        columns = {
            row["name"]
            for row in connection.execute(
                "PRAGMA table_info(leads)"
            ).fetchall()
        }

        if "call_status" not in columns:
            connection.execute(
                """
                ALTER TABLE leads
                ADD COLUMN call_status TEXT DEFAULT 'calling'
                """
            )

        connection.execute(
    """
    UPDATE leads
    SET call_status = CASE
        WHEN status IN (
            'calling',
            'ringing',
            'in_progress',
            'queued'
        )
        THEN status
        WHEN status IN (
            'completed',
            'qualified'
        )
        THEN 'completed'
        WHEN status = 'call_failed'
        THEN 'call_failed'
        WHEN status = 'no_answer'
        THEN 'no_answer'
        ELSE COALESCE(call_status, 'calling')
    END
    WHERE call_status IS NULL
       OR call_status = ''
    """
)

        connection.commit()


def create_lead(request: CreateLeadRequest) -> dict:
    lead_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()

    lead = {
        "id": lead_id,
        "phoneNumber": request.phone_number,
        "projectType": "unknown",
        "timeline": "unknown",
        "preferredLanguage": "unknown",
        "meetingRequested": False,
        "meetingConfirmed": False,
        "callOutcome": "unknown",
        "createdAt": now,
        "updatedAt": now,
        "status": "new",
        "callStatus": "calling",
        "callSid": None,
        "recordingUrl": None,
    }

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO leads (
                id,
                phone_number,
                project_type,
                timeline,
                preferred_language,
                meeting_requested,
                meeting_confirmed,
                call_outcome,
                status,
                call_status,
                call_sid,
                recording_url,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                lead["id"],
                lead["phoneNumber"],
                lead["projectType"],
                lead["timeline"],
                lead["preferredLanguage"],
                int(lead["meetingRequested"]),
                int(lead["meetingConfirmed"]),
                lead["callOutcome"],
                lead["status"],
                lead["callStatus"],
                lead["callSid"],
                lead["recordingUrl"],
                lead["createdAt"],
                lead["updatedAt"],
            ),
        )
        connection.commit()

    return lead


def _row_to_lead(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "phoneNumber": row["phone_number"],
        "projectType": row["project_type"],
        "timeline": row["timeline"],
        "preferredLanguage": row["preferred_language"],
        "meetingRequested": bool(row["meeting_requested"]),
        "meetingConfirmed": bool(row["meeting_confirmed"]),
        "callOutcome": row["call_outcome"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
        "status": row["status"],
        "callStatus": (
            row["call_status"]
            if "call_status" in row.keys()
            else None
        ),
        "callSid": row["call_sid"],
        "recordingUrl": row["recording_url"],
    }


def get_lead(lead_id: str) -> dict | None:
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM leads
            WHERE id = ?
            """,
            (lead_id,),
        ).fetchone()

    return _row_to_lead(row) if row else None


def update_lead_by_phone(
    phone_number: str,
    *,
    project_type: str | None = None,
    timeline: str | None = None,
    preferred_language: str | None = None,
    meeting_requested: bool | None = None,
    meeting_confirmed: bool | None = None,
    call_outcome: str | None = None,
    status: str | None = None,
    call_status: str | None = None,
    call_sid: str | None = None,
    recording_url: str | None = None,
) -> dict | None:

    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM leads
            WHERE phone_number = ?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (phone_number,),
        ).fetchone()

        if row is None:
            return None

        lead = _row_to_lead(row)

        if project_type is not None:
            lead["projectType"] = project_type

        if timeline is not None:
            lead["timeline"] = timeline

        if preferred_language is not None:
            lead["preferredLanguage"] = preferred_language

        if meeting_requested is not None:
            lead["meetingRequested"] = meeting_requested

        if meeting_confirmed is not None:
            lead["meetingConfirmed"] = meeting_confirmed

        if call_outcome is not None:
            lead["callOutcome"] = call_outcome

        if status is not None:
            lead["status"] = status

        if call_status is not None:
            lead["callStatus"] = call_status

        if call_sid is not None:
            lead["callSid"] = call_sid

        if recording_url is not None:
            lead["recordingUrl"] = recording_url

        lead["updatedAt"] = datetime.now(timezone.utc).isoformat()

        connection.execute(
            """
            UPDATE leads
            SET
                project_type = ?,
                timeline = ?,
                preferred_language = ?,
                meeting_requested = ?,
                meeting_confirmed = ?,
                call_outcome = ?,
                status = ?,
                call_status = ?,
                call_sid = ?,
                recording_url = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (
                lead["projectType"],
                lead["timeline"],
                lead["preferredLanguage"],
                int(lead["meetingRequested"]),
                int(lead["meetingConfirmed"]),
                lead["callOutcome"],
                lead["status"],
                lead["callStatus"],
                lead["callSid"],
                lead["recordingUrl"],
                lead["updatedAt"],
                lead["id"],
            ),
        )
        connection.commit()

    return lead


def update_lead_by_call_sid(
    call_sid: str,
    *,
    status: str | None = None,
    call_outcome: str | None = None,
    recording_url: str | None = None,
) -> dict | None:

    valid_transitions = {
        "calling": {
            "calling",
            "ringing",
            "in_progress",
            "completed",
            "call_failed",
            "no_answer",
        },
        "ringing": {
            "ringing",
            "in_progress",
            "completed",
            "call_failed",
            "no_answer",
        },
        "in_progress": {
            "in_progress",
            "completed",
            "call_failed",
            "no_answer",
        },
        "completed": {
            "completed",
        },
        "call_failed": {
            "call_failed",
        },
        "no_answer": {
            "no_answer",
        },
    }

    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM leads
            WHERE call_sid = ?
            LIMIT 1
            """,
            (call_sid,),
        ).fetchone()

        if row is None:
            return None

        lead = _row_to_lead(row)

        if status is not None:
            current_status = lead["callStatus"] or "calling"

            allowed = valid_transitions.get(
                current_status,
                {status},
            )

            if status in allowed:
                lead["callStatus"] = status

        if call_outcome is not None:
            lead["callOutcome"] = call_outcome

        if recording_url is not None:
            lead["recordingUrl"] = recording_url

        lead["updatedAt"] = datetime.now(timezone.utc).isoformat()

        connection.execute(
            """
            UPDATE leads
            SET
                call_status = ?,
                call_outcome = ?,
                recording_url = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (
                lead["callStatus"],
                lead["callOutcome"],
                lead["recordingUrl"],
                lead["updatedAt"],
                lead["id"],
            ),
        )
        connection.commit()

    return lead


def get_all_leads() -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT *
            FROM leads
            ORDER BY created_at DESC
            """
        ).fetchall()

    return [_row_to_lead(row) for row in rows]


def get_lead_stats() -> dict:
    with get_connection() as connection:
        total = connection.execute(
            """
            SELECT COUNT(*)
            FROM leads
            """
        ).fetchone()[0]

        qualified = connection.execute(
            """
            SELECT COUNT(*)
            FROM leads
            WHERE status = 'qualified'
            """
        ).fetchone()[0]

        meetings = connection.execute(
            """
            SELECT COUNT(*)
            FROM leads
            WHERE meeting_requested = 1
            """
        ).fetchone()[0]

        completed = connection.execute(
            """
            SELECT COUNT(*)
            FROM leads
            WHERE call_status = 'completed'
            """
        ).fetchone()[0]

        failed = connection.execute(
            """
            SELECT COUNT(*)
            FROM leads
            WHERE call_status IN (
                'call_failed',
                'no_answer'
            )
            """
        ).fetchone()[0]

        in_progress = connection.execute(
            """
            SELECT COUNT(*)
            FROM leads
            WHERE call_status IN (
                'calling',
                'ringing',
                'in_progress'
            )
            """
        ).fetchone()[0]

    return {
        "totalLeads": total,
        "qualifiedLeads": qualified,
        "meetingsRequested": meetings,
        "completedCalls": completed,
        "failedCalls": failed,
        "activeCalls": in_progress,
    }


init_db()
