# Graph-Based Order-to-Cash Query System

A full-stack analytics platform that unifies fragmented SAP ERP data into an interactive relationship graph and exposes a conversational query interface powered by a large language model. Users can explore the Order-to-Cash business flow visually and ask natural language questions that are dynamically translated into SQL, executed against the live dataset, and returned as plain-English answers grounded entirely in real data.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Dataset and Data Modeling](#dataset-and-data-modeling)
4. [Graph Construction](#graph-construction)
5. [Database Choice: SQLite](#database-choice-sqlite)
6. [LLM Integration and Prompting Strategy](#llm-integration-and-prompting-strategy)
7. [Guardrails](#guardrails)
8. [API Reference](#api-reference)
9. [Key Dataset Insights](#key-dataset-insights)
10. [How to Run Locally](#how-to-run-locally)
11. [Deployment](#deployment)
12. [Tech Stack Summary](#tech-stack-summary)

---

## Project Overview

In enterprise ERP systems, business data is fragmented across dozens of tables with no obvious way to trace how a customer order becomes a payment. This project solves that by:

- Ingesting 18 tables of raw SAP Order-to-Cash JSONL data
- Normalizing and loading it into a structured SQLite database
- Building an in-memory directed graph of 1,142 nodes and 1,778 edges representing the full O2C flow
- Rendering that graph as an interactive force-directed visualization
- Providing a chat interface where users ask questions in plain English and receive data-backed answers

The system is **not** a static FAQ. Every answer is produced by generating a SQL query at runtime, executing it against the live data, and summarizing the results. Nothing is hardcoded.

---

## Architecture Decisions

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│  ┌──────────────────────┐  ┌─────────────────────┐  │
│  │   Force Graph (D3)   │  │    Chat Interface   │  │
│  │   react-force-graph  │  │    (React + TS)     │  │
│  └──────────┬───────────┘  └──────────┬──────────┘  │
└─────────────┼────────────────────────┼──────────────┘
              │ GET /graph             │ POST /query
┌─────────────▼────────────────────────▼──────────────┐
│                Express Backend (Node.js)             │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ ingest.js │  │ graph.js │  │    query.js      │  │
│  │ CSV→SQLite│  │graphology│  │  Groq + SQLite   │  │
│  └─────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│        │             │                 │             │
│  ┌─────▼─────────────▼─────┐  ┌───────▼──────────┐  │
│  │      SQLite (o2c.db)    │  │   Groq API       │  │
│  │   18 normalized tables  │  │ llama-3.3-70b    │  │
│  └─────────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Design Principles

**Separation of concerns across three backend modules:**

- `ingest.js` — owns all data loading. Reads JSONL part files from 18 subfolders, normalizes field types, inserts into SQLite with deduplication. Runs once at server startup.
- `graph.js` — owns the relationship model. Queries SQLite to build a `graphology` MultiDirectedGraph in memory with 11 node types and 12 edge relationships. Exposes `graphToJSON()` for the frontend and `getNodeData()` for per-node expansion.
- `query.js` — owns the LLM pipeline. Takes a natural language message, injects the full schema and dataset facts into a system prompt, calls Groq to generate SQL, executes it, summarizes results, and returns structured JSON.

**Why Node.js over Python for this project:**
The candidate's background is MERN stack (MongoDB, Express, React, Node). Using Python would have meant learning `pandas`, `sqlite3`, `FastAPI`, and `networkx` under a 3-day deadline. Node.js with `better-sqlite3` and `graphology` achieves identical functionality with a fraction of the ramp-up cost. The only meaningful tradeoff is slightly more verbose CSV parsing, which is negligible for JSONL files.

---

## Dataset and Data Modeling

### Source Data

18 folders of JSONL files, each folder containing multiple part files that are combined during ingestion:

| Folder | Table | Rows | Description |
|---|---|---|---|
| `billing_document_headers` + `billing_document_cancellations` | `billing_doc_headers` | 163 | Billing document master — note 80 are cancelled (49%) |
| `billing_document_items` | `billing_doc_items` | 245 | Line items per billing document |
| `business_partners` | `business_partners` | 8 | Customer master data |
| `business_partner_addresses` | `business_partner_addresses` | 8 | Customer addresses |
| `customer_company_assignments` | `customer_companies` | 8 | Company-level customer config |
| `customer_sales_area_assignments` | `customer_sales_arrangements` | 28 | Sales area assignments per customer |
| `journal_entry_items_accounts_receivable` | `journal_entry_items` | 123 | GL accounting entries |
| `outbound_delivery_headers` | `delivery_headers` | 86 | Delivery document headers |
| `outbound_delivery_items` | `delivery_items` | 137 | Delivery line items with plant assignments |
| `payments_accounts_receivable` | `payments` | 120 | Payment clearing records |
| `plants` | `plants` | 44 | Plant master data |
| `product_descriptions` | `product_descriptions` | 69 | Product names |
| `product_plants` | `product_plants` | 3,036 | Product-to-plant assignments |
| `product_storage_locations` | `product_storage_locations` | 16,723 | Storage location inventory |
| `products` | `products` | 69 | Product master data |
| `sales_order_headers` | `sales_order_headers` | 100 | Sales order master |
| `sales_order_items` | `sales_order_items` | 167 | Sales order line items |
| `sales_order_schedule_lines` | `sales_order_schedule_lines` | 179 | Confirmed delivery schedule lines |

### Preprocessing and Normalization

The raw JSONL files required several normalization decisions:

**Boolean fields** — SAP exports boolean-like fields as `true`/`false` strings or integers. All such fields (`billingDocumentIsCancelled`, `businessPartnerIsBlocked`, `isMarkedForArchiving`, etc.) are normalized to `0`/`1` integers via a dedicated `normalizeValue()` function before insert.

**Deduplication across part files** — Each entity is split into multiple part files (e.g., `billing_document_headers` has 2 parts, `product_storage_locations` has 18 parts). All inserts use `INSERT OR IGNORE` with primary key constraints to guarantee deduplication automatically regardless of part file overlap.

**Folder-to-table mapping** — The dataset folder names do not match conventional table names. A `FOLDER_TABLE_MAP` dictionary handles the translation explicitly, including the non-obvious mapping of both `billing_document_headers` and `billing_document_cancellations` into the same `billing_doc_headers` table.

**NULL handling** — Empty strings from the JSONL source are normalized to SQL `NULL` on insert. This is critical because status fields like `overallOrdReltdBillgStatus` are empty strings in the raw data but become `NULL` in SQLite, and LLM-generated SQL must use `IS NULL` rather than `= ''`.

---

## Graph Construction

### Node Model

The graph uses `graphology` `MultiDirectedGraph` with 11 node types, each with a distinct color for visual differentiation:

| Node Type | Color | Source Table | Node ID |
|---|---|---|---|
| SalesOrder | `#378ADD` (blue) | `sales_order_headers` | `salesOrder` |
| SalesOrderItem | `#5BA3E8` (light blue) | `sales_order_items` | `salesOrder_salesOrderItem` |
| DeliveryHeader | `#1D9E75` (green) | `delivery_headers` | `deliveryDocument` |
| DeliveryItem | `#2BC090` (teal) | `delivery_items` | `deliveryDocument_deliveryDocumentItem` |
| BillingDoc | `#7F77DD` (purple) | `billing_doc_headers` | `billingDocument` |
| BillingItem | `#9B8FE8` (lavender) | `billing_doc_items` | `billingDocument_billingDocumentItem` |
| JournalEntry | `#E24B4A` (red) | `journal_entry_items` | `accountingDocument_accountingDocumentItem` |
| Payment | `#639922` (olive) | `payments` | `accountingDocument_accountingDocumentItem` |
| Customer | `#888780` (gray) | `business_partners` | `businessPartner` |
| Product | `#BA7517` (amber) | `product_descriptions` | `product` |
| Plant | `#D85A30` (coral) | `plants` | `plant` |

### Edge Model

12 directed edge types represent business relationships:

```
Customer ──PLACED_ORDER──► SalesOrder
SalesOrder ──HAS_ITEM──► SalesOrderItem
SalesOrderItem ──IS_PRODUCT──► Product
SalesOrder ──FULFILLED_BY──► DeliveryHeader
DeliveryHeader ──HAS_DELIVERY_ITEM──► DeliveryItem
DeliveryItem ──SHIPPED_FROM──► Plant
SalesOrder ──BILLED_AS──► BillingDoc
BillingDoc ──HAS_BILLING_ITEM──► BillingItem
BillingItem ──BILLED_PRODUCT──► Product
BillingDoc ──HAS_JOURNAL_ENTRY──► JournalEntry
JournalEntry ──CLEARED_BY_PAYMENT──► Payment
Customer ──BILLED_TO──► BillingDoc
```

### Core O2C Flow (Happy Path)

```
Customer → SalesOrder → DeliveryHeader → BillingDoc → JournalEntry → Payment
```

### Graph Performance Decision

The full graph has 1,142 nodes. Sending all nodes to the frontend on every load would slow the initial render. The `graphToJSON()` function selects the top 500 nodes by connection degree for the default view, exposing a `/graph/full` endpoint for the complete dataset when needed. This keeps the initial page load fast while still showing the most structurally important nodes.

---

## Database Choice: SQLite

### Why SQLite and not PostgreSQL, MongoDB, or a graph database?

**PostgreSQL** would have required provisioning a managed database instance, setting up connection strings, handling connection pooling, and managing schema migrations — all unnecessary complexity for a read-heavy analytics workload on a fixed dataset that never changes after ingestion.

**MongoDB** is a poor fit because the core workload is relational joins across normalized tables. Storing nested documents would either duplicate data heavily or require application-level joins, both of which are worse than SQL for this use case.

**Neo4j or a native graph database** is an interesting option given the graph modeling requirement, but introduces significant operational overhead: a separate server process, a different query language (Cypher), and more complex free-tier deployment constraints. The LLM is already good at generating SQL; getting it to generate correct Cypher for a dataset it has never seen would require substantially more prompt engineering.

**SQLite with `better-sqlite3`** wins because:
- Single file, zero infrastructure. The database lives at `backend/o2c.sqlite` and travels with the code.
- Synchronous API. `better-sqlite3` exposes a blocking interface that is significantly simpler for Express handlers than async/await connection pools.
- Excellent performance for read-heavy analytical workloads on datasets of this size (< 25,000 rows total across all tables).
- WAL mode (`PRAGMA journal_mode = WAL`) enables concurrent reads without blocking.
- Trivial deployment: Railway copies the file as part of the repo, no separate database service needed.
- The LLM can generate standard SQL that runs against SQLite without modification.

---

## LLM Integration and Prompting Strategy

### Model Choice: Groq + LLaMA 3.3 70B

The assignment specified free-tier LLM APIs. Google Gemini 1.5 Flash was the first choice (1M token context, fast, accurate SQL generation) but the free tier credits were exhausted during development. Groq with `llama-3.3-70b-versatile` was the fallback:

- 14,400 free requests per day
- Sub-second inference on Groq's custom hardware
- LLaMA 3.3 70B produces high-quality SQL for structured schema prompts
- Temperature set to `0.1` for near-deterministic SQL output

### Two-Step Pipeline

Every user query goes through two separate LLM calls:

**Step 1 — SQL Generation:**
The user's message is combined with the full system prompt (schema + dataset facts + rules + examples) and sent to Groq. The model is instructed to return only a JSON object: `{"sql": "...", "explanation": "..."}`. No prose, no markdown fences.

**Step 2 — Result Summarization:**
The SQL is executed against SQLite. The first 20 rows of results are passed back to Groq with the original question: *"User asked X. SQL returned N rows: [data]. Write a clear 2-3 sentence answer with specific numbers and IDs."* This produces grounded natural language responses that cite actual data values.

### System Prompt Design

The system prompt has five sections, each serving a specific purpose:

**1. Schema injection** — All 18 table names and their columns are listed with primary key annotations and data types. This is repeated in every prompt because LLMs have no persistent memory between calls. Without the schema, the model guesses column names and produces SQL that fails on the first run.

**2. Key join relationships** — The most important join paths are spelled out explicitly:
```
billing_doc_items.referenceSdDocument = sales_order_headers.salesOrder
delivery_items.referenceSdDocument = sales_order_headers.salesOrder
billing_doc_headers.accountingDocument = journal_entry_items.accountingDocument
```
This prevents the model from inventing plausible-sounding but incorrect joins.

**3. Critical dataset facts** — Eleven dataset-specific quirks discovered during exploratory analysis are embedded directly in the prompt. Examples:
- `billing_doc_items.referenceSdDocument` contains 8-digit billing reference IDs, NOT sales order IDs. Joining this to `sales_order_headers.salesOrder` always returns zero rows.
- `overallOrdReltdBillgStatus` is `NULL` for all 100 sales orders in this dataset. LLM must use `IS NULL` not `= ''`.
- 65.8% of billing documents are cancelled. Every revenue query must filter `WHERE billingDocumentIsCancelled = 0`.
- 56 journal entries have negative `amountInTransactionCurrency` (these are reversal entries, not errors).

Without this section, the model would generate syntactically valid SQL that produces semantically wrong results — passing a code review but failing a data review.

**4. Strict output rules** — The model is explicitly forbidden from:
- Returning text outside a JSON object
- Using markdown code fences
- Hallucinating table or column names not in the schema
- Joining fields across incompatible ID spaces

**5. Worked examples** — Five complete question/SQL pairs are included as few-shot examples. These demonstrate the correct join patterns for the five most common query types and serve as templates the model can adapt.

### Retry Mechanism

If the generated SQL throws a SQLite error on execution, the error message and failing SQL are sent back to Groq with the instruction to fix it. This single retry pass resolves the majority of SQL errors (typically ambiguous column references or minor syntax issues) without requiring manual intervention.

### JSON Extraction Safety

Groq occasionally includes a brief preamble or trailing text around the JSON object even when instructed not to. The `stripFences()` function removes markdown code fences, and a secondary extraction step strips everything before the first `{` and after the last `}` to ensure clean JSON parsing regardless of model output formatting.

---

## Guardrails

The system uses a **dual-layer guardrail** architecture. Either layer can independently block an off-topic request.

### Layer 1: Pre-LLM Keyword Gate (`guardrails.js`)

Before the message ever reaches Groq, a deterministic keyword check runs:

**Domain keyword check** — The message must contain at least one of 19 domain-relevant terms (order, delivery, billing, invoice, payment, customer, product, plant, sales, journal, material, shipment, revenue, document, sap, erp, account, dispatch, fulfillment). If none are present, the message is rejected immediately.

**Block pattern check** — Even if a domain keyword is present, the message is rejected if it matches any of 18 block patterns (poem, joke, story, weather, capital city, president, etc.). This prevents adversarial prompts like "write a poem about invoices" from reaching the model.

The keyword gate fires before any API call, saving Groq API credits and reducing latency for obviously off-topic requests.

```javascript
function isOffTopic(message = "") {
  const lower = String(message).toLowerCase();
  const hasDomainKeyword = DOMAIN_KEYWORDS.some(word => lower.includes(word));
  const hasBlockPattern  = BLOCK_PATTERNS.some(pattern => lower.includes(pattern));
  return !hasDomainKeyword || hasBlockPattern;
}
```

### Layer 2: LLM-Level Out-of-Scope Detection

For borderline queries that pass the keyword gate (e.g., "what is the history of accounting documents?"), the system prompt instructs the model to return `{"error": "out_of_scope"}` instead of generating SQL. The backend detects this response and returns the domain message without executing any SQL.

### Why Two Layers?

| Scenario | Layer 1 | Layer 2 |
|---|---|---|
| "Write a poem about deliveries" | Blocked (has "poem") | Never reached |
| "What is the capital of France?" | Blocked (no domain keyword) | Never reached |
| "What is the history of ERP accounting?" | Passes (has "erp", "accounting") | Blocked by LLM |
| "Show me revenue by customer" | Passes | Answered normally |

Layer 1 is fast and cheap. Layer 2 catches sophisticated edge cases. Together they handle the full spectrum of misuse.

---

## API Reference

### `GET /health`
Returns server status, graph size, and row counts for all 18 tables.

```json
{
  "status": "ok",
  "nodeCount": 1142,
  "edgeCount": 1778,
  "tables": {
    "billing_doc_headers": 163,
    "sales_order_headers": 100,
    ...
  }
}
```

### `GET /graph`
Returns the top 500 nodes by connection degree plus all edges between them. Used for initial graph render.

### `GET /graph/full`
Returns all 1,142 nodes and 1,778 edges. Use for export or detailed analysis.

### `GET /graph/node/:id`
Returns a single node's attributes plus all its immediate neighbors and connecting edges. Powers the node expansion UI.

### `POST /query`
**Body:** `{ "message": string, "history": [{ "role": string, "text": string }] }`

**Response:**
```json
{
  "answer": "Plain English summary of results...",
  "highlightNodes": ["740556", "740557"],
  "sql": "SELECT ...",
  "rowCount": 50,
  "explanation": "What the query finds"
}
```

If guardrailed:
```json
{
  "answer": "This system is designed to answer questions related to the Order-to-Cash dataset only...",
  "guardrailed": true
}
```

---

## Key Dataset Insights

These facts were discovered through direct analysis of the raw JSONL files and embedded into the LLM system prompt:

1. **65.8% of billing documents are cancelled.** Revenue queries must always filter `billingDocumentIsCancelled = 0`.

2. **`billing_doc_items.referenceSdDocument` is not a sales order ID.** It contains 8-digit billing reference numbers. The correct join path from billing to sales orders is through `delivery_items.referenceSdDocument`.

3. **All 100 sales orders have `NULL` billing status.** `overallOrdReltdBillgStatus` is `NULL` for every row — it cannot be used to determine billing completion.

4. **30 of 167 sales order items are rejected** with reason code `61`. Active order queries must filter these out.

5. **56 of 123 journal entries have negative amounts** — these are accounting reversals for cancelled billing documents, not data errors.

6. **24 active billing documents have no journal entry.** O2C flow traces must use `LEFT JOIN` and handle `NULL` accounting documents gracefully.

7. **Only 4 of 8 customers have billing documents.** Customers `310000108`, `310000109`, `320000107`, and `320000108` have sales orders and deliveries but no billing — their O2C flow is structurally incomplete in the dataset.

8. **12 schedule lines have zero confirmed quantity** across 9 distinct sales orders, indicating unconfirmed availability check results.

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/fde-o2c-graph
cd fde-o2c-graph
```

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
PORT=3001
```

Place the dataset folders inside `backend/data/`:
```
backend/data/
├── billing_document_headers/
├── billing_document_cancellations/
├── billing_document_items/
├── business_partner_addresses/
├── business_partners/
├── customer_company_assignments/
├── customer_sales_area_assignments/
├── journal_entry_items_accounts_receivable/
├── outbound_delivery_headers/
├── outbound_delivery_items/
├── payments_accounts_receivable/
├── plants/
├── product_descriptions/
├── product_plants/
├── product_storage_locations/
├── products/
├── sales_order_headers/
├── sales_order_items/
└── sales_order_schedule_lines/
```

```bash
node index.js
```

The server will ingest all data, build the graph, and start on port 3001. Expected startup output:
```
billing_doc_headers: 3 files found, 163 rows inserted
...
Server ready. Graph has 1142 nodes, 1778 edges.
Backend listening on 3001
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Test the Backend

```bash
# Health check
curl http://localhost:3001/health

# Query test
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d '{"message":"Total revenue by customer","history":[]}'

# Guardrail test
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d '{"message":"Write me a poem","history":[]}'
```

---

## Deployment

### Backend — Railway

1. Push the repository to GitHub (with `backend/data/` included or populated at build time)
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set root directory to `backend/`
4. Add environment variable: `GROQ_API_KEY=gsk_xxx`
5. Railway auto-detects Node.js via `railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node index.js"
```

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → Import repository
2. Set root directory to `frontend/`
3. Add environment variable: `VITE_API_URL=https://your-app.railway.app`
4. `frontend/vercel.json` handles SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Tech Stack Summary

| Layer | Technology | Reason |
|---|---|---|
| Backend runtime | Node.js + Express | Candidate's primary stack, fast API development |
| Database | SQLite via `better-sqlite3` | Zero infrastructure, sync API, ideal for read-heavy analytics |
| Graph library | `graphology` | Lightweight JS-native graph, no separate server required |
| LLM | Groq + LLaMA 3.3 70B | Best free tier: 14,400 req/day, sub-second inference |
| Frontend framework | React + TypeScript + Vite | Type safety, fast HMR, candidate's comfort zone |
| Graph visualization | `react-force-graph-2d` | Canvas-based D3 force simulation, handles 1000+ nodes |
| Styling | Tailwind CSS | Utility-first, rapid UI development |
| Backend hosting | Railway | Git-push deploy, free tier, auto-detects Node |
| Frontend hosting | Vercel | Zero-config React deployment, free tier |
