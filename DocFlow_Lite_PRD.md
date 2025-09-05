# DocFlow Lite – Hackathon PRD

## Overview
Early-stage startups move fast, but their documentation often lags behind. This slows down developer onboarding, integrations, and collaboration.  
**DocFlow Lite** solves this by automatically generating, centralizing, and personalizing documentation using Mintlify.

Our hackathon MVP demonstrates:
1. Auto-generation of docs from a GitHub repo.
2. Role-based onboarding flows (Backend Dev, Frontend Dev, Product Manager).
3. A lightweight Q&A assistant powered by an LLM trained on the docs.

---

## Problem Statement
- Startups and teams build APIs quickly, but internal/external docs are messy and inconsistent.
- Onboarding new hires or partners can take days of hand-holding.
- Hackathon teams and agencies also struggle with packaging APIs for quick understanding.

---

## Goals (Hackathon MVP)
- ✅ Connect a GitHub repository and extract metadata (endpoints, functions, README).
- ✅ Auto-generate Mintlify docs from the extracted repo data.
- ✅ Provide role-based “Getting Started” wizard (at least 3 roles).
- ✅ Build a Q&A assistant that can answer simple questions using generated docs.
- ✅ Deliver a polished demo flow: Repo → Docs → Role-based view → Q&A.

---

## Non-Goals
- Comprehensive analytics dashboard (post-hackathon feature).
- Enterprise integrations (Slack, Jira, Notion).
- Advanced Q&A fine-tuning or multi-language support.

---

## Target Users
1. **Startups scaling fast** – onboarding new devs/partners.
2. **Hackathon teams** – need polished APIs in hours, not weeks.
3. **Agencies** – ship clear developer handoffs to clients.

---

## User Stories
- *As a backend developer*, I want to see API endpoints and setup instructions tailored to my role so I can start coding quickly.  
- *As a frontend developer*, I want to know how to connect to backend APIs without sifting through irrelevant details.  
- *As a product manager*, I want a simplified overview of functionality to understand product capabilities.  
- *As a new teammate*, I want to ask questions in plain English and get instant answers from the docs.

---

## Features & Deliverables
### 1. GitHub Repo Integration
- Fetch repo content (README, code files) using GitHub API.
- Parse for endpoints/functions.
- Store metadata in a lightweight database (JSON/SQLite for hackathon).

### 2. Mintlify Docs Generation
- Generate `.mdx` docs dynamically.
- Scaffold a Mintlify docs site from the repo data.

### 3. Role-Based Onboarding Wizard
- Simple React/Next.js frontend.
- Role selector (Backend, Frontend, PM).
- Each role sees curated docs and instructions.

### 4. Q&A Assistant
- Integrate OpenAI API (or equivalent).
- Load generated docs into context (basic string concatenation for MVP).
- Simple chat UI for asking/answering questions.

---

## Tech Stack
- **Frontend**: React / Next.js + TailwindCSS
- **Backend**: Node.js + Express (API integration + parsing)
- **Docs**: Mintlify (docs-as-code generation)
- **Database**: Lightweight (JSON or SQLite for demo)
- **AI**: OpenAI GPT API (context from generated docs)
- **Hosting**: Vercel/Netlify (frontend), Render/Heroku (backend)

---

## Team Roles (4 People)
1. **Backend Integration Lead** – GitHub API + parsing endpoints.
2. **Docs Integration Lead** – Mintlify docs generation pipeline.
3. **Frontend/UI Lead** – Role-based wizard + Q&A UI.
4. **AI/LLM Lead** – Q&A assistant powered by docs.

---

## Hackathon Timeline
- **Hours 0–4**: Architecture setup + GitHub integration stub.
- **Hours 5–12**: Repo parsing + Mintlify doc generation MVP.
- **Hours 12–20**: Build role-based onboarding wizard.
- **Hours 20–30**: Integrate Q&A assistant + connect to docs.
- **Hours 30–36**: Polish UI/UX, debug flows, rehearse pitch.
- **Final Hours**: Prepare submission + demo video.

---

## Success Criteria
- Judges can see a working demo where:
  1. A repo is connected.
  2. Docs are auto-generated.
  3. A role-based onboarding flow is displayed.
  4. Q&A assistant answers a sample question from the docs.

If all 4 steps are shown in the demo, MVP is a success.

---

## Future Roadmap (Post-Hackathon)
- Analytics: Track doc usage, onboarding bottlenecks.
- Integrations: Slack, Jira, Notion for team-wide visibility.
- Custom Templates: Framework-specific onboarding flows.
- Gamification: Progress tracking for new devs.
