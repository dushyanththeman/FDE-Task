# Graph-Based Order-to-Cash Query System

## Architecture
This project is a full-stack analytics platform for SAP Order-to-Cash data.
The backend is built with Node.js and Express, using SQLite (`better-sqlite3`) for persistent storage and `graphology` for an in-memory relationship graph.
The frontend is a React + TypeScript Vite application that renders an interactive force-directed graph using `react-force-graph-2d` and provides a chat interface for natural-language analytics.
Gemini 1.5 Flash is used to translate user questions into SQL and summarize results.

## Database Choice: SQLite
- Zero infrastructure setup with a single-file embedded database.
- Synchronous `better-sqlite3` API is ideal for read-heavy analytical workloads.
- Handles the full 17+ table SAP dataset efficiently in one local store.
- Avoids connection pooling and operational complexity.
- Easy to deploy alongside backend code on Railway.

## Graph Model
The graph uses `graphology` `MultiDirectedGraph` and models business flow across Order-to-Cash entities.

Node types:
- SalesOrder
- SalesOrderItem
- DeliveryHeader
- DeliveryItem
- BillingDoc
- BillingItem
- JournalEntry
- Payment
- Customer
- Product
- Plant

Edge relationships:
- Customer -> SalesOrder (`PLACED_ORDER`)
- SalesOrder -> SalesOrderItem (`HAS_ITEM`)
- SalesOrderItem -> Product (`IS_PRODUCT`)
- SalesOrder -> DeliveryHeader (`FULFILLED_BY`)
- DeliveryHeader -> DeliveryItem (`HAS_DELIVERY_ITEM`)
- DeliveryItem -> Plant (`SHIPPED_FROM`)
- SalesOrder -> BillingDoc (`BILLED_AS`)
- BillingDoc -> BillingItem (`HAS_BILLING_ITEM`)
- BillingItem -> Product (`BILLED_PRODUCT`)
- BillingDoc -> JournalEntry (`HAS_JOURNAL_ENTRY`)
- JournalEntry -> Payment (`CLEARED_BY_PAYMENT`)
- Customer -> BillingDoc (`BILLED_TO`)

Core O2C flow:
Customer -> SalesOrder -> DeliveryHeader -> BillingDoc -> JournalEntry -> Payment

## LLM Prompting Strategy
- Full schema injection in every prompt so SQL generation stays grounded.
- JSON-only output contract: `{"sql":"...","explanation":"..."}`.
- Explicit status code semantics (`C`, `A`, `B`, cancelled flag) embedded in prompt.
- Retry-on-error loop: SQL errors are fed back to Gemini for one correction pass.
- Conversation context: last 5 messages included for continuity.
- Two-step response: (1) SQL generation/execution, (2) result summarization in plain language.

## Guardrails
- Pre-LLM keyword gate blocks clearly off-topic requests before model invocation.
- LLM prompt includes explicit out-of-scope behavior: `{"error":"out_of_scope"}`.
- Dual-layer protection reduces API cost and increases safety.

## How to Run Locally
1. Clone the repository.
2. Place dataset folders inside `backend/data/` (all required subfolders with `.jsonl` parts).
3. Start backend:
   - `cd backend`
   - `npm install`
   - `node index.js`
4. Start frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
5. Open [http://localhost:5173](http://localhost:5173).

## Deployment
- Backend: Railway (set `GEMINI_API_KEY` and deploy with `backend/railway.toml`).
- Frontend: Vercel (set `VITE_API_URL` to Railway backend URL, rewrite configured via `frontend/vercel.json`).
