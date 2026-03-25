# AI Coding Sessions — Claude (claude.ai)

> These logs document the actual prompting workflow, debugging iterations,
> and analytical reasoning used throughout the FDE Task project.
> Two Claude sessions were used: one for initial system design ,
> and one for data validation and system prompt correction .

---

## Session 1 — Backend Architecture & Data Ingestion Design

**Tool:** Claude (claude.ai)
**Focus:** Structuring the Express backend, SQLite ingestion pipeline, schema design

### What was asked

Designed the full backend from scratch — including table schemas for all 17
SAP Order-to-Cash entities, the JSONL ingestion pipeline (`ingest.js`), and
the folder-to-table mapping strategy.

### Key Prompts

```
"How should I structure a Node.js backend for a SAP Order-to-Cash system
that ingests JSONL files into SQLite and exposes a /query endpoint powered
by an LLM?"
```

```
"Design the SQLite schema for these SAP O2C tables: sales orders, deliveries,
billing documents, journal entries, payments, business partners, products, plants."
```

### Outcome

- Modular file structure: `ingest.js`, `query.js`, `graph.js`, `index.js`
- 17 table schemas with correct primary keys and column types
- `FOLDER_TABLE_MAP` to route each JSONL folder to the right table
- `INSERT OR IGNORE` strategy for idempotent ingestion
- INTEGER normalization for boolean fields (`billingDocumentIsCancelled`, etc.)
- WAL journal mode for SQLite performance

### Iteration Insight

Initial schema didn't distinguish boolean columns — Claude identified which
fields needed integer coercion (0/1) vs raw text, and built the `INTEGER_COLUMNS`
Set to handle this uniformly during ingestion.

---

## Session 2 — LLM Query Layer & System Prompt Engineering

**Tool:** Claude (claude.ai)
**Focus:** Designing the `SYSTEM_PROMPT` in `query.js` — the core of the NL→SQL pipeline

### What was asked

Built the system prompt that instructs the Groq LLM (llama-3.3-70b-versatile)
how to translate natural language questions into correct SQLite queries over the
O2C dataset.

### Key Prompts

```
"Write a system prompt for an LLM that converts natural language questions
into SQL queries over this SAP O2C SQLite schema. It must return only JSON
with keys: sql, explanation. Include join relationships, status codes, and
guardrails for out-of-scope questions."
```

```
"Add critical dataset facts to the prompt so the LLM doesn't hallucinate —
things like billing status always being empty, referenceSdDocument not being
a sales order ID, and the correct join path from billing to sales orders."
```

### Outcome

- Structured output enforced: `{"sql": "...", "explanation": "..."}`
- Out-of-scope guardrail: returns `{"error": "out_of_scope"}`
- Status code legend embedded: `overallDeliveryStatus C/A/B`,
  `billingDocumentIsCancelled 0/1`, `overallGoodsMovementStatus A/C`
- Key join relationships documented inline
- 10 critical dataset facts to prevent common LLM errors
- Auto-retry on SQL execution error (re-prompts with error message)
- JSON fence stripping (`stripFences`) to handle LLM markdown wrapping

### Iteration Insight

Early versions of the prompt let the LLM join `billing_doc_items.referenceSdDocument`
to `sales_order_headers.salesOrder` — this always returns 0 rows because
`referenceSdDocument` contains 8-digit billing reference IDs, not 6-digit SO IDs.
Added an explicit fact and STRICT RULE to prevent this.

---

## Session 3 — Graph Modeling

**Tool:** Claude (claude.ai)
**Focus:** Building the graph layer (`graph.js`) for the frontend visualization

### What was asked

```
"Build a graph representation of the O2C data from SQLite. Nodes should be
business partners, sales orders, delivery documents, billing documents.
Edges should represent the relationships between them."
```

### Outcome

- 1,142 nodes, 1,778 edges in the final graph
- Node types: `businessPartner`, `salesOrder`, `deliveryDocument`,
  `billingDocument`, `journalEntry`, `payment`, `product`, `plant`
- Edge types represent O2C flow: customer→order→delivery→billing→journal→payment
- `/health` endpoint exposes node/edge counts + all table row counts for verification
- `/graph` endpoint returns full graph for frontend D3/visualization rendering

### Design Decision

Used soldToParty as the bridge between sales orders and billing documents
(since `billing_doc_items.referenceSdDocument` cannot be joined to sales orders
directly). This is reflected in both graph edges and LLM query examples.

---

## Session 4 — Data Validation & System Prompt Correction

**Tool:** Claude (claude.ai)
**Focus:** Systematically testing query outputs, finding wrong hardcoded facts,
and generating corrected Cursor prompts

### Context

After the backend was deployed, a full validation pass was run against the
actual SQLite data loaded from all 49 JSONL files. The LLM's system prompt
contained several hardcoded facts written against a different/larger dataset.

### Validation Methodology

1. Loaded all 49 JSONL files into a local SQLite instance
2. Ran every query the LLM produced against the real data
3. Compared LLM answer vs ground truth from direct SQL
4. Identified wrong facts, wrong SQL patterns, and wrong interpretations
5. Generated a Cursor prompt to fix all issues without breaking working queries

### Queries Tested & Results

| Query | LLM Answer | Correct Answer | Status |
|---|---|---|---|
| % billing docs cancelled | 49.08% cancelled, 50.92% active | ✅ Correct | PASS |
| Customers with no billing docs | 4 customers (310000108, 310000109, 320000107, 320000108) | ✅ Correct | PASS |
| Unconfirmed schedule lines (qty=0) | 9 sales orders | ✅ Correct (12 lines across 9 orders) | PASS |
| O2C trace for SO 740506 | Missing broken flow context | ⚠️ Incomplete | PARTIAL |
| Payments with no journal entry | 0 (all matched) | ✅ Correct direction, but fact #7 in prompt was wrong | FIXED |
| Cancellation pairs | 0 rows | ❌ Wrong SQL join direction | FIXED |
| Revenue with/without cancelled | Labels swapped | ❌ Misread column names | FIXED |
| Total payments vs billed | -17,245 paid vs 37,038 billed | ❌ Cross-join inflation | FIXED |
| Shared clearing docs | 44 | ✅ Correct (we had estimated 10 — LLM was right) | VERIFIED |
| GMS status 'A' interpretation | "goods movement completed" | ❌ Opposite meaning | FIXED |
| Billed qty per product | 0 rows | ❌ Wrong join path on referenceSdDocument | FIXED |
| Products never billed | 50 rows | ❌ Wrong join path, should be 2 | FIXED |
| Delivered-not-billed SQL | Returns all 86 SOs | ❌ NOT IN subquery excludes nothing | FIXED |
| SO vs billing per customer | Nelson SO = 1.99M (inflated) | ❌ Cross-join with many billing docs | FIXED |

### Key Bugs Found & Fixed

**Bug 1 — Cross-join inflation on aggregate queries**
Joining `sales_order_headers` to `billing_doc_headers` via `soldToParty`
in a flat JOIN inflates SUM values when a customer has many billing docs.
Fix: Use correlated subqueries per customer.

**Bug 2 — The forbidden join (billing_doc_items.referenceSdDocument)**
Any join of `billing_doc_items.referenceSdDocument` to `sales_order_headers.salesOrder`
returns 0 rows silently. The field contains 8-digit billing references,
not 6-digit SO IDs. Added to STRICT RULES in system prompt.

**Bug 3 — Aggregate totals via multi-table joins**
Joining payments → journal → billing to get aggregate totals causes
many-to-many cross joins. Fix: Use independent subqueries for each table.

**Bug 4 — GMS status code misread**
`overallGoodsMovementStatus = 'A'` means NOT started (pending), not completed.
The LLM described it as "completed" — added explicit status code table.

**Bug 5 — Hardcoded facts in system prompt were wrong**
The prompt claimed 243 billing docs (160 cancelled). Actual: 163 (80 cancelled).
Also claimed only 76/120 payments link to journal entries. Actual: all 120 link.
All facts were re-derived from SQL and corrected.

### Corrected System Prompt Facts (verified against live DB)

```
billing_doc_headers:  163 total | 80 cancelled (49.1%) | 83 active (50.9%)
sales_order_headers:  100 total | 86 delivery status C | 14 status A
delivery_headers:     86 total  | 83 GMS=A (pending)   | 3 GMS=C (moved)
journal_entry_items:  123 total | 56 negative amounts  | 3 no clearing doc
payments:             120 total | all link to journal   | 44 clearing docs shared
sales_order_items:    167 total | 30 rejected (code 61)
schedule_lines:       179 total | 12 with qty=0 (across 9 orders)
billing_doc_items:    245 total | 55 distinct products  | 80 cancellation pairs
products never billed: 2 (BODYPERFUME 120ML BLANC, HAIR REMOVAL CREAM 100G)
customers no billing:  4 (310000108, 310000109, 320000107, 320000108)
active billing no journal: 24 docs
```

### Safety Check — All SQL Examples Verified

After corrections, all 18 SQL examples in the updated system prompt were
executed against the live DB. All returned correct results with no errors.
4 additional issues were caught in the safety pass:

1. EC1 expected count was 10 — actual is 80 (our earlier sample was LIMIT 10)
2. EC14 expected 10 products — actual is 55 (earlier LIMIT 10 was a sample)
3. EC8 count of 44 was correct — we had wrongly tried to change it to 10
4. EXISTING "delivered not billed" example SQL was silently wrong — fixed

---

## Session 5 — Prompt Engineering for Cursor Corrections

**Tool:** Claude (claude.ai)
**Focus:** Writing precise Cursor prompts to fix `query.js` without breaking
anything that already worked

### Approach

Rather than editing `query.js` directly, Claude generated structured Cursor
prompts that:
- Quoted the exact wrong SQL pattern
- Showed the correct replacement with explanation
- Included verified example queries with known correct row counts
- Added new STRICT RULES to prevent the same class of error recurring
- Added corrected CRITICAL DATASET FACTS with exact numbers from live DB

### Prompt Structure Used

Each fix followed this pattern:
```
PROBLEM: [what the LLM was doing wrong]
ROOT CAUSE: [why it was wrong at the SQL/schema level]
WRONG SQL: [exact bad pattern]
CORRECT SQL: [verified replacement]
CORRECT FACTS: [exact numbers from live DB]
Add this example: [Q/A pair with verified row counts]
Add to STRICT RULES: [explicit prohibition]
```

### Why This Worked

- Grounding every fix in actual SQL output eliminated ambiguity
- Separating "wrong SQL patterns" from "wrong hardcoded facts" kept
  fixes targeted — changing a fact doesn't affect SQL logic and vice versa
- Running a safety pass after all corrections caught 4 regressions before
  they reached production
