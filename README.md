# Sunrise Interiors - AI Voice Lead Agent

A production-oriented live voice qualification system for Sunrise Interiors.

Visitors submit their phone number on the website and receive an outbound AI call within seconds. The agent introduces itself, checks whether it is a good time to talk, understands the interior-work requirement, captures the expected start timeline, and offers a designer consultation.

## What it demonstrates

- Real outbound phone calls
- Natural conversational AI voice
- English, Hindi, and Hinglish conversations
- Interruption-aware conversations
- Lead qualification
- Structured extraction of project requirements
- Designer-meeting intent capture
- Exotel call lifecycle tracking
- Call recordings
- Live lead dashboard
- Automatic lead updates after the conversation

## Architecture

`	ext
Visitor
   |
   v
Next.js Landing Page
   |
   | POST /api/leads
   v
FastAPI Backend
   |
   +------------------> SQLite Lead Store
   |
   +------------------> Exotel
                           |
                           v
                    Sarvam Voice Agent
                    STT -> LLM -> TTS
                           |
                           +--> Lead extraction
                           |
                           +--> /api/voice/save-lead
                           |
                           +--> Exotel status callback
                                      |
                                      v
                              FastAPI Backend
                                      |
                                      v
                              Lead + call status
                                      |
                                      v
                              Next.js Dashboard
Project structure
sunrise-ai-voice-agent/
├── apps/
│   ├── api/                 # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/
│   │   │   └── services/
│   │   ├── data/
│   │   ├── .env
│   │   └── pyproject.toml
│   │
│   └── web/                 # Next.js frontend
│       └── app/
│
├── packages/
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── README.md
Tech stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Backend
FastAPI
Python
Pydantic
SQLite
Voice infrastructure
Sarvam Voice Agents
Sarvam STT / LLM / TTS
Exotel telephony
ngrok for local callback tunnelling
Conversation flow

The agent follows a short qualification flow:

introduces itself as calling from Sunrise Interiors.
Checks whether it is a good time for a quick conversation.
Understands what interior work the visitor needs.
Asks when they would like to start.
Offers a conversation with a Sunrise Interiors designer.
Captures whether the visitor agrees.
Extracts structured lead information.
Updates the lead record and call lifecycle.
Stores the Exotel recording when available.

The agent is configured for natural English, Hindi, and Hinglish interaction rather than a rigid IVR-style menu.

Local setup
Prerequisites
Node.js
pnpm
Python
uv
A Sarvam account/API key
An Exotel account with an ExoPhone and voice application
ngrok for local public callbacks
Install frontend dependencies

From the repository root:

pnpm install
Configure API environment

Copy the example configuration:

Copy-Item .env.example apps/api/.env

Then fill in the required credentials:

SARVAM_API_KEY=

EXOTEL_ACCOUNT_SID=
EXOTEL_API_KEY=
EXOTEL_API_TOKEN=
EXOTEL_SUBDOMAIN=https://api.in.exotel.com
EXOTEL_CALLER_ID=
EXOTEL_APP_ID=

PUBLIC_API_URL=

Never commit apps/api/.env.

Start the API
cd apps/api
uv run uvicorn app.main:app --reload --port 8000

API health check:

http://127.0.0.1:8000/health
Start the web app

In another terminal:

pnpm --dir apps/web dev

Open:

http://localhost:3000

Dashboard:

http://localhost:3000/dashboard
Public callback URL

Because Exotel and Sarvam need to reach the local FastAPI application, expose port 8000 through ngrok:

ngrok http 8000

Set the generated HTTPS URL as:

PUBLIC_API_URL=https://your-ngrok-domain

The public URL is used for:

Exotel call status callbacks
Sarvam lead extraction tool callbacks
Production build

Frontend validation:

pnpm --dir apps/web build

The production build should complete without TypeScript or compilation errors.

Lead data captured

Each lead can contain:

Phone number
Project requirement
Expected start timeline
Preferred language
Meeting requested
Meeting confirmed
Call outcome
Call status
Exotel call SID
Recording URL
Created / updated timestamps
Cost

The implementation is designed around a short 60–90 second qualification call.

The major cost components are:

Telephony through Exotel
Sarvam voice-agent infrastructure
Speech recognition
LLM inference
Speech synthesis

Actual per-minute cost depends on the selected telephony plan and Sarvam configuration. The target is to keep the combined call cost within the assignment's Rs. 2-3/min target where possible, with Rs. 5-6/min treated as an acceptable upper range for a higher-quality demo.

Reliability considerations

The backend separates:

Lead lifecycle status
Call lifecycle status
Call outcome

This prevents a lead from being incorrectly marked as qualified merely because an outbound call was initiated.

Exotel status callbacks are used to update call state such as:

Calling
Ringing
In progress
Completed
Busy
Failed
No answer

Sarvam's post-call extraction is used to persist structured conversation information.

Security

Secrets are kept in environment variables.

Do not commit:

apps/api/.env

The repository contains .env.example with empty placeholders only.

Demo

The intended demo flow is:

Open the Sunrise Interiors landing page.
Enter a visitor phone number.
Submit the enquiry.
Show the outbound call arriving.
Have a short natural conversation with the AI.
Provide project requirements and timeline.
Accept or decline the designer consultation.
Show the resulting structured lead in the dashboard.

The dashboard refreshes automatically so call and lead state can be observed without manually refreshing the page.



## Architecture

`	ext
Visitor
   |
   v
Sunrise Interiors Web App
   |
   | POST /api/leads
   v
FastAPI Backend
   |
   +--> SQLite Lead Store
   |
   +--> Exotel Outbound Call
            |
            v
       Sarvam Voice Agent
            |
            +--> Speech recognition
            +--> Hindi / Hinglish / English understanding
            +--> Natural Indian voice response
            +--> Lead qualification
            +--> Designer consultation intent
            |
            +--> save_lead_details
                     |
                     v
              FastAPI /api/voice/save-lead
   |
   +--> Exotel status callback
   |
   +--> Recording URL
   |
   v
Dashboard
Lead Qualification

The agent captures:

Interior work / project type
Expected project start timeline
Preferred language
Designer consultation interest
Meeting confirmation
Call status
Call outcome
Recording URL

The system is designed to handle English, Hindi and Hinglish naturally rather than forcing the caller through a rigid IVR-style flow.

Why These Technologies
Sarvam AI

Chosen for its Indian-language speech capabilities, natural code-mixed Hindi/Hinglish handling, telephony-oriented voice stack and low-latency voice-agent runtime.

Exotel

Chosen as the telephony layer for Indian outbound calling, caller ID, call routing, recordings and call-status callbacks.

FastAPI

Provides a lightweight API layer for lead creation, call orchestration, Sarvam tool callbacks and Exotel status callbacks.

Next.js

Provides the public lead-capture experience and internal lead dashboard.

SQLite

Used for the assignment deployment because it keeps the system simple and self-contained while still providing persistent structured lead data.

Cost

The target is to keep the complete voice interaction within the assignment's expected ₹2–₹3/min range where possible, with an upper acceptable range of approximately ₹5–₹6/min depending on telephony and voice-agent usage.

Sarvam Voice Agents provides a bundled agent runtime, while Exotel provides the telephony layer. Actual production cost depends on call duration, telephony plan and the selected Sarvam configuration.

Demo Flow
Open the Sunrise Interiors landing page.
Enter a visitor phone number.
Submit the form.
The backend creates the lead and initiates the outbound call.
The AI introduces itself as Sunrise Interiors.
It checks whether the caller has a minute.
It understands the required interior work.
It asks when the project is expected to start.
It offers a designer consultation.
The captured lead information appears in the dashboard.
Call status and recording information are retained when available.
Production Considerations

For a production deployment, the SQLite store can be replaced with PostgreSQL, authentication can be added to the dashboard, webhook authentication/signature verification can be enforced, and the lead/call correlation can be backed by a durable call identifier rather than phone-number matching alone.

Demo Credentials / Configuration

All credentials are supplied through environment variables.

Never commit the real .env file.

Copy .env.example and provide:

SARVAM_API_KEY
EXOTEL_ACCOUNT_SID
EXOTEL_API_KEY
EXOTEL_API_TOKEN
EXOTEL_SUBDOMAIN
EXOTEL_CALLER_ID
EXOTEL_APP_ID
PUBLIC_API_URL
Project Structure
sunrise-ai-voice-agent/
├── apps/
│   ├── api/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── services/
│   │   │   └── main.py
│   │   └── pyproject.toml
│   │
│   └── web/
│       ├── app/
│       │   ├── dashboard/
│       │   └── page.tsx
│       └── package.json
│
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
└── README.md

