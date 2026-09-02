from pydantic import BaseModel, Field


class CreateLeadRequest(BaseModel):
    phone_number: str = Field(
        ...,
        min_length=10,
        max_length=20,
        description="Visitor phone number, preferably in E.164 format.",
        examples=["+919876543210"],
    )


class CreateLeadResponse(BaseModel):
    lead_id: str
    status: str
