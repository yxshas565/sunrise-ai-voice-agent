# Sunrise Interiors — AI Voice Lead Concierge

> An end-to-end conversational AI voice agent that instantly calls prospective interior-design customers, naturally qualifies their requirements in English, Hindi, and Hinglish, and automatically converts the conversation into a structured lead for the Sunrise Interiors sales/design team.

## Overview

Sunrise Interiors receives prospective customers through a website enquiry form. Instead of leaving the sales team with a phone number and requiring a manual follow-up, this project creates an immediate conversational voice experience.

The workflow is:

```text
Visitor enters phone number
          ↓
Next.js website
          ↓
FastAPI Lead API
          ↓
Exotel outbound call
          ↓
Sarvam Voice Agent
          ↓
Natural conversation with customer
          ↓
Extract project requirements
          ↓
Extract timeline
          ↓
Detect conversation language
          ↓
Determine designer-meeting interest
          ↓
Sarvam on-end webhook
          ↓
FastAPI webhook
          ↓
SQLite lead database
          ↓
Sunrise Interiors dashboard
```

The system is designed around one primary principle:

> **The customer should feel like they are speaking with a helpful design concierge, not interacting with an IVR system.**

The implementation focuses on conversational quality, Indian-language support, low latency, reliable lead capture, and a complete website → phone call → structured lead workflow.

---

## Product Experience

A prospective customer visits the Sunrise Interiors website and enters their phone number.

The system immediately initiates an outbound call.

The AI introduces itself as Shubh from Sunrise Interiors, checks whether the customer has a moment, and naturally discovers:

- What interior work they need
- Which parts of the home they want to work on
- When they expect to start
- Whether they would like to speak with a designer

The agent supports:

- English
- Hindi
- Hinglish / code-mixed conversation
- Natural language switching
- Interruptions
- Short acknowledgements
- Normal conversational variation
- Polite rejection / not-interested responses

Once the conversation ends, the extracted information is automatically sent back to the backend and stored as a structured lead.

---

# Key Features

## 1. Instant Outbound Calling

The customer does not need to manually call a sales number.

Submitting their phone number triggers the outbound workflow:

```text
Website → FastAPI → Exotel → Sarvam Voice Agent → Customer
```

This creates an immediate follow-up experience while the customer's intent is still fresh.

## 2. Natural Conversational Voice AI

The voice agent is intentionally designed to avoid the typical IVR experience.

Instead of:

> "Press 1 for..."

the agent uses short conversational turns such as:

> "Hi, this is Shubh calling from Sunrise Interiors. Is this a good time for a quick minute?"

The agent asks one question at a time and adapts to the customer's responses.

## 3. English, Hindi and Hinglish

Indian customers do not necessarily speak in one language throughout a conversation.

A customer might begin in English:

> "I'm looking for interiors for my 2BHK."

and naturally switch to Hinglish:

> "Haan, kitchen aur living room mainly karwana hai."

The voice agent is configured to detect and follow the customer's actual conversational language rather than forcing the user through a website language selector.

This was an intentional design decision:

> **Language adaptation belongs inside the conversation rather than being another form field for the customer to manage.**

## 4. Interruption Handling

Voice conversations are fundamentally different from text chat.

Customers may interrupt, respond early, hesitate, or speak while the agent is talking.

The agent is therefore configured with interruption handling and conversational eagerness rather than requiring strict turn-by-turn scripted responses.

The goal is a natural exchange rather than a deterministic call tree.

## 5. Intelligent Lead Qualification

The conversation extracts structured information from an otherwise unstructured voice interaction.

### `project_type`

The customer's latest and most specific interior requirement.

Examples:

```text
living room and kitchen renovation
```

or:

```text
Complete 2BHK interiors including kitchen and living room
```

Multiple areas are preserved rather than forcing the customer into a single category.

### `timeline`

The customer's intended project timeline.

Examples:

```text
Next month
```

```text
Two-three months later
```

The system preserves the meaning of the customer's answer instead of reducing it to an arbitrary fixed category.

### `preferred_language`

The language predominantly used by the customer:

- English
- Hindi
- Hinglish

This is derived from the actual conversation.

### `meeting_requested`

A boolean qualification signal indicating whether the customer explicitly agreed to speak with a Sunrise Interiors designer.

```text
true
false
```

This allows the sales/design team to immediately distinguish interested leads from uninterested conversations.

## 6. Designer Meeting Qualification

The agent asks whether the customer would like to speak with a designer.

If the customer agrees:

```text
meeting_requested = true
status = qualified
```

If the customer declines:

```text
meeting_requested = false
status = completed
```

The agent is explicitly instructed not to continue unnecessary qualification after the meeting decision.

This keeps the conversation short and respectful.

## 7. Automatic Lead Persistence

Extracted information is sent to the backend when the conversation ends.

The FastAPI application receives the structured information and updates the corresponding lead.

The lead is persisted in SQLite.

This means the system is not merely a voice demo—the call produces an actual structured business record.

## 8. Live Dashboard

The dashboard provides a simple operational view of captured leads.

It displays information such as:

- Phone number
- Project requirement
- Timeline
- Conversation language
- Lead status
- Designer meeting interest
- Call status
- Call outcome
- Recording information where available

Example workflow:

```text
Customer conversation
        ↓
AI extraction
        ↓
Structured lead
        ↓
Dashboard
```

---

# Architecture

## High-Level Architecture

```text
                         ┌─────────────────────┐
                         │   Sunrise Website   │
                         │       Next.js       │
                         └──────────┬──────────┘
                                    │
                              POST /api/leads
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │      Backend        │
                         └──────────┬──────────┘
                                    │
                              Outbound Call
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       Exotel        │
                         │    Telephony Layer  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Sarvam Voice Agent  │
                         │  Conversational AI  │
                         └──────────┬──────────┘
                                    │
                           Natural conversation
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Extracted Variables │
                         │ project_type        │
                         │ timeline             │
                         │ preferred_language  │
                         │ meeting_requested    │
                         └──────────┬──────────┘
                                    │
                             On-end webhook
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │ /api/voice/save-lead│
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       SQLite        │
                         │    Lead Storage     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      Dashboard      │
                         │       Next.js       │
                         └─────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js | Customer-facing website and dashboard |
| UI | Tailwind CSS | Responsive interface |
| Backend | FastAPI | API, webhook processing and orchestration |
| Database | SQLite | Lightweight persistent lead storage |
| Voice AI | Sarvam Voice Agents | Conversational Indian-language voice AI |
| Telephony | Exotel | Indian outbound calling infrastructure |
| Tunnelling | ngrok | Public webhook endpoint during local development |
| Runtime | Python / Node.js | Backend and frontend execution |
| Version Control | Git + GitHub | Source control |

---

# Why Sarvam?

The core challenge is not simply generating speech.

The agent must handle:

- Indian English
- Hindi
- Hinglish
- Code-switching
- Conversational interruptions
- Natural Indian voice interaction
- Low-latency realtime communication

A generic STT → LLM → TTS pipeline could be assembled manually, but that would introduce additional engineering complexity across:

- Audio streaming
- STT
- LLM orchestration
- Conversation state
- TTS
- Barge-in handling
- Latency management
- Telephony integration
- Language switching
- Webhooks

Sarvam Voice Agents provides an integrated voice-agent layer designed for Indian-language conversational experiences.

This makes it a strong fit for the central requirement of this project rather than building every realtime voice layer independently.

---

# Why Exotel?

The project requires an actual phone call rather than a browser-only voice simulation.

Exotel provides the telephony infrastructure needed to:

- Initiate outbound calls
- Connect the call to the voice agent
- Handle Indian telephone numbers
- Receive call status callbacks
- Provide recording information where configured

The resulting architecture separates responsibilities cleanly:

```text
Sarvam → Conversation intelligence
Exotel → Telephony
FastAPI → Business/application logic
SQLite → Lead persistence
Next.js → User interface
```

---

# Voice Agent Design

The agent is configured as:

**Sunrise Interiors Design Concierge**

Voice persona:

**Shubh**

The agent is instructed to behave as a:

> Warm, professional AI design concierge.

The conversational design follows several principles.

### One question at a time

The agent avoids overwhelming customers with multiple qualification questions in a single turn.

### Short responses

Voice responses are intentionally concise to reduce latency and make the interaction feel conversational.

### Natural acknowledgements

The agent uses brief acknowledgements instead of immediately firing another scripted question.

### Customer-led language

The agent follows the customer's English/Hindi/Hinglish usage.

### No forced script

The conversation is guided by objectives rather than being implemented as a rigid decision tree.

### Respectful ending

Once the designer-meeting decision is made, the agent closes naturally without unnecessary additional qualification.

---

# Conversation Flow

A typical conversation follows this structure:

```text
1. Greeting
      ↓
2. Check whether it is a good time
      ↓
3. Discover interior work required
      ↓
4. Understand project timeline
      ↓
5. Offer designer consultation
      ↓
6. Capture meeting interest
      ↓
7. Natural closing
      ↓
8. Extract structured lead variables
      ↓
9. Send variables to backend
      ↓
10. Update lead
```

The exact wording is intentionally flexible so that the interaction remains conversational.

---

# Backend API

## Create Lead

```http
POST /api/leads
```

Creates a lead and initiates an outbound call.

The backend:

1. Validates the submitted phone number.
2. Creates or updates the lead.
3. Calls Exotel.
4. Stores the Exotel call SID.
5. Stores the initial call status.
6. Returns the lead ID and calling state.

## Get Lead

```http
GET /api/leads/{lead_id}
```

Returns the current lead information.

## Save Voice Lead

```http
POST /api/voice/save-lead
```

Receives the structured information extracted by Sarvam after the conversation.

The endpoint handles:

- JSON payloads
- Form payloads
- Agent variable values
- Boolean normalization
- Indian phone-number normalization
- Lead matching
- Lead qualification
- Database updates

## Exotel Status Callback

```http
POST /api/voice/exotel/status
```

Receives telephony lifecycle events from Exotel.

Supported states are normalized into application-level states such as:

```text
calling
ringing
in_progress
completed
call_failed
no_answer
```

The endpoint also captures recording information when provided by Exotel.

## Dashboard APIs

```http
GET /api/dashboard/leads
GET /api/dashboard/stats
```

These endpoints expose structured lead and dashboard information to the frontend.

---

# Data Flow and Lead Matching

One important reliability requirement is ensuring that the voice-extracted data updates the correct website lead.

The initial website submission creates the lead and associates the Exotel call with that lead.

When the voice agent finishes, the extracted variables are posted to the backend.

The backend normalizes the phone number when available and updates the corresponding lead.

If a phone number is not included in the voice-agent payload, the backend includes a fallback to the latest lead so the extracted information is not silently discarded.

---

# Boolean Normalization

Voice-agent systems can return values in different representations.

For example, a boolean may arrive as:

```text
"true"
```

instead of a native JSON boolean.

The backend explicitly normalizes values such as:

```text
1
true
yes
y
on
```

into a boolean `true`.

This prevents a valid designer-meeting request from being incorrectly stored as `false`.

---

# Phone Number Normalization

Indian numbers can arrive in different forms.

The backend normalizes common formats such as:

```text
+917022805441
07022805441
7022805441
```

into the application's canonical Indian format.

This makes lead matching more reliable between the website, telephony provider and voice-agent webhook.

---

# Error Handling

The backend handles failures across the outbound call flow.

Examples include:

- Exotel connection failures
- Exotel HTTP errors
- Invalid Exotel responses
- XML parsing failures
- Missing call identifiers
- Missing voice-agent payload fields
- Unknown call statuses
- Missing matching leads

If Exotel rejects an outbound call, the lead is marked appropriately rather than leaving the system in a false "calling" state.

---

# Call Status Lifecycle

The application maps Exotel's telephony lifecycle into business-friendly states.

```text
queued
  ↓
calling
  ↓
ringing
  ↓
in_progress
  ↓
completed
```

Failure paths include:

```text
busy
failed
no_answer
canceled
```

These are converted into application-level call and outcome states.

---

# Security and Configuration

Secrets are not hard-coded into the source code.

Environment variables are used for configuration, including:

```env
EXOTEL_ACCOUNT_SID=
EXOTEL_API_KEY=
EXOTEL_API_TOKEN=
EXOTEL_SUBDOMAIN=https://api.in.exotel.com
EXOTEL_CALLER_ID=
EXOTEL_APP_ID=
PUBLIC_API_URL=
```

A `.env.example` file documents the required configuration without exposing credentials.

The real `.env` file is excluded from version control.

---

# Local Development

## Prerequisites

Install:

- Node.js
- npm
- Python
- Git

The project contains two applications:

```text
apps/
├── api/
└── web/
```

## Backend Setup

Navigate to:

```powershell
cd apps/api
```

Install the project dependencies and configure the required environment variables.

The backend uses:

- FastAPI
- Uvicorn
- Pydantic Settings
- HTTPX
- python-multipart

Start the API with:

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

## Frontend Setup

Navigate to:

```powershell
cd apps/web
```

Install dependencies:

```powershell
npm install
```

Start development mode:

```powershell
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

---

# Webhook Development

Because Exotel and Sarvam need to reach the locally running FastAPI server, the backend is exposed using ngrok.

The local backend:

```text
127.0.0.1:8000
```

is exposed through a public HTTPS URL.

The public API URL is configured through the environment.

The relevant webhooks are:

```text
/api/voice/save-lead
/api/voice/exotel/status
```

For production deployment, these endpoints should be hosted on a permanent HTTPS backend rather than a development tunnel.

---

# Exotel Configuration

The Exotel application connects the call through the configured voice-agent flow.

Conceptually:

```text
Call Start
    ↓
Sarvam Voicebot
    ↓
Hangup
```

The Exotel integration is responsible for initiating and transporting the telephone call.

The outbound backend request supplies:

- Customer number
- ExoPhone caller ID
- Exotel flow URL
- Call type
- Status callback URL

The resulting Exotel call SID is stored against the lead.

---

# Sarvam Configuration

The Sarvam agent is configured with:

- Shubh voice
- English + Hindi
- Automatic language detection
- Quick language switching
- Interruptions enabled
- Conversational eagerness
- Natural Indian voice settings
- Maximum call duration
- Voice-agent output variables
- On-end lead-saving tool

The voice agent extracts:

```text
project_type
timeline
preferred_language
meeting_requested
```

These variables are then sent to:

```text
POST /api/voice/save-lead
```

---

# Sarvam Output Variable Lifecycle

The lead extraction follows a lifecycle rather than trying to persist every sentence during the call.

```text
Call starts
    ↓
Conversation happens
    ↓
Agent gathers information
    ↓
Call ends
    ↓
Output variables are extracted
    ↓
On-end hook runs
    ↓
Backend receives structured values
    ↓
Lead is updated
```

This keeps the realtime conversation focused on the customer while allowing structured business data to be produced at the end.

---

# Database

SQLite is used for the current implementation.

This is appropriate for the assignment because:

- It is lightweight
- Requires no separate database server
- Works well for a local demonstration
- Provides persistent structured storage
- Keeps setup simple

The data model stores lead information including:

```text
id
phoneNumber
projectType
timeline
preferredLanguage
meetingRequested
meetingConfirmed
status
callStatus
callSid
callOutcome
recordingUrl
createdAt
updatedAt
```

For a larger production deployment, SQLite should be replaced with a managed relational database such as PostgreSQL.

The application/service layer is separated sufficiently that this can be done without redesigning the complete product.

---

# Frontend

The frontend contains two primary experiences.

## Customer Website

The landing page provides:

- Sunrise Interiors branding
- Interior design positioning
- Lead capture form
- Phone number submission
- Calling state
- Call-success state
- Navigation to the dashboard

The website intentionally remains simple.

The assignment prioritizes the quality of the call experience over complex visual design, so engineering effort was focused on the realtime voice workflow.

## Dashboard

The dashboard provides a CRM-style view of captured leads.

It allows the user to quickly understand:

```text
Who called?
What do they need?
When do they want to start?
What language did they use?
Are they qualified?
Do they want a designer?
What happened to the call?
```

This demonstrates that the AI conversation produces actionable business information rather than merely generating speech.

---

# Production Considerations

The current implementation is designed as a production-oriented prototype for the assignment.

Several decisions were made specifically to keep the architecture easy to evolve.

### Clear separation of concerns

```text
Frontend
   ↓
API
   ↓
Telephony
   ↓
Voice AI
   ↓
Webhooks
   ↓
Persistence
```

Each layer has a defined responsibility.

### Environment-based secrets

Credentials are not committed to Git.

### Typed backend contracts

FastAPI and Pydantic provide request validation and structured API responses.

### Persistent lead state

Lead information is stored rather than remaining only in memory.

### Call lifecycle tracking

The application records both voice-agent completion and telephony status.

### Production build validation

The Next.js application is verified with a real production build before submission.

---

# Cost Considerations

The project was designed with the assignment's target cost in mind.

Sarvam Voice Agents pricing is currently approximately:

```text
₹3.50 / minute
```

The actual final cost can depend on the specific account/plan, call duration, telephony charges and deployment configuration.

The expected conversation is approximately:

```text
60–90 seconds
```

which keeps the voice-agent component within the assignment's intended cost range.

For a production deployment, telephony and infrastructure costs should be measured alongside the voice-agent cost to calculate the complete cost per qualified lead.

---

# Alternatives Considered

## Generic STT + LLM + TTS Pipeline

A custom pipeline could use:

```text
Telephony
   ↓
STT
   ↓
LLM
   ↓
TTS
   ↓
Telephony
```

This provides maximum control but introduces significant engineering overhead around:

- Streaming audio
- Turn detection
- Barge-in
- Conversation state
- Latency
- Indian-language quality
- Code switching
- Telephony codecs
- Error handling
- Realtime orchestration

For this project, the main differentiator is Indian conversational voice quality rather than building every layer from scratch.

Therefore, an integrated voice-agent platform was preferred.

## Browser-Based Voice Chat

A browser voice assistant would avoid telephony complexity.

However, the assignment specifically asks for an AI call after the customer shares their phone number.

Therefore, browser-only voice interaction would not satisfy the central product experience.

---

# Why This Architecture?

The architecture optimizes for the actual business workflow:

```text
Lead capture
    +
Immediate contact
    +
Natural qualification
    +
Structured extraction
    +
Sales-ready information
```

Rather than building an isolated AI chatbot, this implementation connects the AI directly to a lead-generation workflow.

The AI therefore becomes an operational component of the business process.

---

# Reliability Improvements Implemented During Development

The implementation went through several integration and debugging iterations.

Important reliability issues addressed included:

## Public webhook routing

The local backend needed a publicly reachable endpoint for Sarvam/Exotel callbacks.

The ngrok tunnel was correctly pointed at:

```text
127.0.0.1:8000
```

This allowed external callbacks to reliably reach FastAPI.

## Sarvam variable mapping

The output variables were explicitly mapped into the on-end API tool as agent variables rather than fixed literal values.

The final mapping is:

```text
project_type
timeline
preferred_language
meeting_requested
```

This allows values generated during the actual conversation to reach the backend.

## Boolean handling

The voice platform may provide boolean-like values as strings.

The backend therefore normalizes these values before storing them.

This ensures:

```text
"true"
```

is treated as:

```text
true
```

rather than incorrectly becoming:

```text
false
```

## Exotel callback handling

The backend accepts the relevant Exotel callback fields and maps telephony statuses into application-level states.

Recording URLs are also captured when supplied.

---

# Testing and Validation

The project was tested end-to-end rather than only checking that the frontend rendered.

The final successful live flow demonstrated:

```text
Website submission
       ↓
POST /api/leads
       ↓
Exotel outbound call
       ↓
Sarvam conversation
       ↓
Hinglish interaction
       ↓
Project requirement extraction
       ↓
Timeline extraction
       ↓
Language detection
       ↓
Designer meeting decision
       ↓
Sarvam save-lead callback
       ↓
FastAPI webhook
       ↓
SQLite update
       ↓
Dashboard display
```

A real successful conversation produced structured information equivalent to:

```text
Project:
living room and kitchen renovation

Timeline:
two-three months later

Language:
hinglish

Designer meeting:
requested

Lead status:
qualified

Call status:
completed
```

This validates the complete integration rather than only individual components.

---

# Frontend Production Validation

The Next.js production build was successfully executed using:

```powershell
npm run build
```

The final build completed successfully with:

```text
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

Routes verified:

```text
/
 /_not-found
/dashboard
```

This confirms that the frontend compiles successfully as a production application.

---

# Git and Version Control

The project is maintained using Git and GitHub.

Repository:

```text
yxshas565/sunrise-ai-voice-agent
```

The final working implementation was committed and pushed to the `main` branch.

The repository was verified to have a clean working tree and the local `main` branch is synchronized with the remote branch.

Temporary development helper files were also removed before the final checkpoint.

---

# Project Structure

```text
sunrise-ai-voice-agent/
│
├── apps/
│   │
│   ├── api/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── dashboard.py
│   │   │   │   ├── leads.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── voice.py
│   │   │   │
│   │   │   └── services/
│   │   │       └── lead_service.py
│   │   │
│   │   ├── main.py
│   │   ├── pyproject.toml
│   │   └── .env.example
│   │
│   └── web/
│       ├── app/
│       │   ├── dashboard/
│       │   ├── page.tsx
│       │   └── ...
│       ├── package.json
│       └── ...
│
├── .gitignore
├── README.md
└── ...
```

---

# API Responsibilities

```text
apps/api/app/api/leads.py
    Lead creation and retrieval

apps/api/app/api/voice.py
    Voice-agent webhook
    Exotel callback
    Outbound call orchestration

apps/api/app/api/dashboard.py
    Dashboard data endpoints

apps/api/app/services/lead_service.py
    Lead persistence and updates

apps/api/main.py
    FastAPI application
    CORS
    Router registration
    Health endpoint
```

---

# Frontend Responsibilities

```text
apps/web/app/page.tsx
    Customer-facing landing page
    Phone capture
    Calling experience

apps/web/app/dashboard/
    Lead dashboard
```

The frontend communicates with the FastAPI backend rather than directly exposing telephony credentials.

---

# Production Deployment Path

The current project can be evolved from local prototype to production deployment.

A production architecture could become:

```text
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │ Next.js Hosting │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ FastAPI Service │
              │ HTTPS           │
              └────────┬────────┘
                       │
              ┌────────┴─────────┐
              ▼                  ▼
         PostgreSQL          Exotel
                                  │
                                  ▼
                             Sarvam AI
```

For a larger production deployment, recommended upgrades would include:

- PostgreSQL instead of SQLite
- Managed backend hosting
- Permanent HTTPS webhook endpoints
- Centralized structured logging
- Authentication for the dashboard
- Rate limiting
- Monitoring and alerting
- Secret management
- Automated tests
- CI/CD
- Database backups
- Retry/idempotency handling for webhooks
- Production analytics
- Role-based dashboard access

These are deployment-scale improvements rather than requirements for the assignment's local demonstration.

---

# Future Improvements

Potential next-stage improvements include:

## Conversation Transcript

Store the complete transcript alongside structured lead fields.

This would allow sales teams to review exactly what the customer said.

## CRM Integration

The current SQLite lead layer could be replaced or extended with:

- Salesforce
- HubSpot
- Zoho
- Custom CRM
- Internal sales systems

The same extracted variables could then be pushed directly into the CRM.

## Calendar Integration

A designer consultation could automatically create a calendar event after the customer selects an available time.

## Follow-up Automation

If a customer is interested but does not schedule a meeting, the system could automatically initiate a follow-up workflow.

## Analytics

Future analytics could measure:

- Calls initiated
- Calls answered
- Average call duration
- Qualified leads
- Designer meeting requests
- Conversion rate
- Language distribution
- No-answer rate

## Human Handoff

The agent could transfer high-intent customers directly to a human sales/design representative when appropriate.

---

# Design Philosophy

This project deliberately avoids treating voice AI as "just another chatbot."

The important output is not the generated audio.

The important output is:

```text
A real customer conversation
          ↓
Useful understanding of customer intent
          ↓
Structured lead information
          ↓
Actionable business workflow
```

The voice layer is therefore treated as the interface between the customer and the business's lead qualification process.

---

# Demo

The recommended demonstration flow is:

1. Open Sunrise Interiors website
2. Enter a customer phone number
3. Submit the enquiry
4. Receive the live outbound call
5. Have a natural English/Hindi/Hinglish conversation
6. Answer project and timeline questions
7. Accept or decline a designer consultation
8. Open the dashboard
9. Show the automatically extracted lead

The most important part of the demo is the live phone interaction.

---

# Assignment Requirements Coverage

| Requirement | Implementation |
|---|---|
| Website / local host | Next.js |
| Phone number capture | Implemented |
| Immediate AI call | Exotel outbound call |
| Sunrise Interiors introduction | Implemented |
| Good-time check | Implemented |
| Ask interior work required | Implemented |
| Ask project timeline | Implemented |
| Offer designer meeting | Implemented |
| Confirm meeting interest | Implemented |
| Natural responses | Implemented |
| Interruptions | Enabled |
| Questions / conversational variation | Supported by voice-agent design |
| Polite not-interested flow | Implemented |
| 60–90 second target | Agent configured for concise conversations |
| English | Supported |
| Hindi | Supported |
| Hinglish | Supported |
| Natural Indian voice | Sarvam voice configuration |
| Low latency | Realtime voice-agent architecture |
| Lead extraction | Implemented |
| Meeting qualification | Implemented |
| Dashboard | Implemented |
| Transcript | Future enhancement |
| Production-style architecture | Implemented as prototype architecture |

---

# Final Result

The completed system demonstrates a complete AI-powered lead qualification loop:

```text
┌─────────────────────────────────────────────┐
│                                             │
│          SUNRISE INTERIORS WEBSITE          │
│                                             │
│        Customer submits phone number        │
│                     │                       │
└─────────────────────┼───────────────────────┘
                      │
                      ▼
             ┌────────────────┐
             │    FASTAPI     │
             │ Lead Creation  │
             └───────┬────────┘
                     │
                     ▼
             ┌────────────────┐
             │    EXOTEL      │
             │   Phone Call   │
             └───────┬────────┘
                     │
                     ▼
             ┌────────────────┐
             │    SARVAM      │
             │ Voice Agent    │
             └───────┬────────┘
                     │
              Natural conversation
                     │
                     ▼
          ┌────────────────────────┐
          │ Structured Extraction  │
          │                        │
          │ Project                │
          │ Timeline               │
          │ Language               │
          │ Meeting Interest       │
          └───────────┬────────────┘
                      │
                      ▼
             ┌────────────────┐
             │ FastAPI Webhook│
             └───────┬────────┘
                     │
                     ▼
             ┌────────────────┐
             │     SQLite     │
             │  Lead Storage  │
             └───────┬────────┘
                     │
                     ▼
             ┌────────────────┐
             │   Dashboard    │
             │                │
             │ Qualified Lead │
             │ Requirements   │
             │ Timeline       │
             │ Language       │
             │ Meeting Status │
             └────────────────┘
```

The result is an end-to-end conversational AI system that transforms a simple phone-number submission into an immediate human-like voice interaction and a structured, actionable interior-design lead.

---

# Built For

**Sunrise Interiors — Live Voice Agent Demo**

Built as an end-to-end conversational AI voice solution focused on:

- Natural Indian voice interaction
- English / Hindi / Hinglish conversations
- Immediate lead engagement
- Automated qualification
- Structured lead extraction
- Designer-meeting conversion
- Operational dashboard visibility
- Production-oriented backend architecture
