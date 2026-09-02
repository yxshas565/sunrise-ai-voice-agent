from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.leads import router as leads_router
from app.api.voice import router as voice_router
from app.api.dashboard import router as dashboard_router


app = FastAPI(
    title="Sunrise Interiors AI Voice Agent",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(leads_router)
app.include_router(voice_router)
app.include_router(dashboard_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "sunrise-ai-voice-agent-api",
    }
