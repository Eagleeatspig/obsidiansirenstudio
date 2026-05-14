# Dual-Mode Studio Overhaul

This is a large, multi-system change. Confirming the plan before I burn credits, since you mentioned a tight budget. I'll batch everything into one efficient pass once you approve.

## 1. Portal Landing (`/`)
Replace current `/` hero with a true portal:
- Centered prompt: "Where does your journey begin?"
- Two large cards: **The Weaver's Path** → `/studio/fiction`, **The Scholar's Sanctum** → `/studio/academic`
- Logo (transparent PNG) centered above, film-grain overlay across body, amethyst/silver palette
- Move existing 4-window marketing content down as secondary preview

## 2. Two Dashboards with "Any-Stage" Quick Start
- `/studio/fiction` (Creative): Quick Start grid — Spark / Sculpture / Vision / Final Polish — links to existing `/planning`, `/formatting`, `/studio` (covers), `/sanctuary`
- `/studio/academic` (Scholar): Quick Start grid — Inquiry / Thesis / Citation / Defense — links to new `/research/vault`, `/research/scriptorium`, `/research/citations`, `/sanctuary`
- Mode toggle in sidebar (persists in localStorage) swaps which set of links is shown

## 3. Scholar's Sanctum (Academic Tools)
- **Source Vault** (`/research/vault`): Supabase Storage bucket `research-sources`, list + drag-drop PDF upload, RLS by user
- **Scriptorium** (`/research/scriptorium`): textarea editor + sidebar Research Assistant chat. Server function calls Lovable AI Gateway (`google/gemini-2.5-flash`) with extracted PDF text from user's vault as system context (RAG-lite — full text stuffed into prompt; no embeddings to keep cost down)
- **Citation Engine** (`/research/citations`): paste source metadata, one-click MLA/APA/Chicago formatting via AI gateway

## 4. Sidebar & Navigation
- Lay-language labels: Home, Planning & Drafting, Book Formatting, Cover Studio, Expert Services, Research Vault, Scriptorium, Citations, Ask Obsidian, Settings
- Mode-aware: Fiction mode shows fiction links, Academic mode shows research links, shared utilities always visible
- Active state: amethyst glow + silver text (CSS update)

## 5. Dual-Branded Page Headers
Reusable `<PageHeader topLabel bigTitle />` component:
- Top: small silver uppercase normal-language label
- Bottom: large amethyst Cormorant Garamond fantastical name
Apply to all studio pages.

## 6. Ask Obsidian & Settings
- `/help` (Ask Obsidian): static FAQ accordion (8–10 entries) + AI-powered question box using Lovable AI
- `/settings`: editable username + email + dark/light toggle, persisted to `profiles` table

## 7. Auth + Branding Polish
- Supabase Email + Google login at `/auth` (signup/login tabs); protect studio routes via `_authenticated` layout
- Profiles table auto-created on signup (trigger)
- Clean logo usage: drop the multiply/blend hacks, use the transparent PNG directly with subtle drop-shadow
- Set the 'S' quill icon as favicon (extract from uploaded logo)
- Film grain: SVG-noise CSS overlay on body, fixed, 4–6% opacity

## Database (one migration)
- `profiles` (user_id, username, email, theme) + RLS + signup trigger
- `research_sources` (user_id, file_path, title, extracted_text) + RLS
- Storage bucket `research-sources` (private) + RLS

## Tech Notes
- PDF text extraction: use `pdfjs-dist` in browser at upload time; store extracted text in `research_sources.extracted_text` so server functions can stuff it into AI context without re-parsing
- AI: Lovable AI Gateway via `createServerFn`; non-streaming for citations, streaming for Research Assistant
- All new server work as `createServerFn` (TanStack), not edge functions
- Film grain: pure CSS using inline SVG turbulence — no asset

## What I will NOT do this round (to keep scope tight)
- Embeddings/vector search for the Research Assistant (full-text stuffing only — fine for ≤~30 pages of source PDFs)
- Realtime collaboration on the scriptorium
- Light theme polish beyond a working toggle (dark remains primary)

Reply "go" to execute, or tell me what to cut/add.
