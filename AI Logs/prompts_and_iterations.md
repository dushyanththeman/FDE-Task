# Prompt Engineering & Iteration Log

> Documents the evolution of prompts used throughout the project —
> from initial vague attempts to precise, verified production prompts.

---

## 1. System Prompt Evolution (query.js)

### Version 1 — Initial Draft

**Prompt given to Claude:**
```
Write a system prompt for an LLM that converts natural language to SQL
over a SAP Order-to-Cash SQLite database.
```

**Problems:**
- No join relationship guidance → LLM guessed joins incorrectly
- No status code legend → LLM used wrong filter values
- No output format constraint → LLM returned markdown, plain text, mixed formats
- No domain guardrail → LLM answered non-O2C questions

---

### Version 2 — Schema + Join Relationships Added

**What changed:**
- Added full schema with column names
- Added KEY JOIN RELATIONSHIPS section
- Added status code legend (C/A/B for delivery, 0/1 for cancelled)
- Enforced JSON output: `{"sql": "...", "explanation": "..."}`
- Added `{"error": "out_of_scope"}` for non-O2C questions

**Remaining problems:**
- Hardcoded dataset facts were wrong (copied from a different dataset size)
- `billing_doc_items.referenceSdDocument` join trap not documented
- `overallOrdReltdBillgStatus` described as empty string, but is actually NULL

---

### Version 3 — Critical Dataset Facts Added

**What changed:**
- Added 10 numbered facts about dataset-specific quirks
- Added explicit warning about billing_doc_items.referenceSdDocument
- Added STRICT RULES section
- Added 5 verified example Q&A pairs

**Problems discovered through testing:**
- Fact #3: "243 total billing docs, 160 cancelled" → **WRONG** (actual: 163 total, 80 cancelled)
- Fact #7: "only 76/120 payments link to journal entries" → **WRONG** (all 120 link)
- Fact #1: described `overallOrdReltdBillgStatus` as `''` → **WRONG** (it is SQL NULL)
- GMS status 'A' not defined → LLM described it as "completed" (opposite meaning)
- No warning about cross-join inflation when aggregating across tables

---

### Version 4 — Fully Corrected (Final)

**What changed (all verified against live DB):**

```
FACT 1:  overallOrdReltdBillgStatus IS NULL for all 100 SOs (not empty string)
FACT 3:  163 total billing docs | 80 cancelled (49.1%) | 83 active (50.9%)
FACT 7:  All 120 payments link to journal via clearingAccountingDocument
FACT 8:  12 zero-qty schedule lines across 9 distinct orders
NEW:     overallGoodsMovementStatus A=NOT started, C=complete
NEW:     24 active billing docs have no journal entry
NEW:     80 cancellation pairs exist (all cancelled docs have replacements)
NEW:     55 distinct products in active billing docs
NEW:     Only 2 products ordered but never billed
NEW:     3 sales orders delivered but stuck (customers have zero billing)
NEW:     76 unique clearing docs | 44 shared by 2 payments | 32 used by 1
```

**New STRICT RULES added:**
```
- NEVER join billing_doc_items.referenceSdDocument to sales_order_headers.salesOrder
- NEVER filter overallOrdReltdBillgStatus = '' — use IS NULL or avoid entirely
- ALWAYS use LEFT JOIN in O2C traces (24 active billing docs have no journal)
- NEVER join payments+journal+billing in flat JOIN for aggregate totals
- NEVER join sales_order_headers to billing_doc_headers via soldToParty
  in flat JOIN for aggregation — use correlated subqueries
- When GMS='A', state goods movement is PENDING not completed
```

**New example queries added (all verified):**
- Cancellation pairs (self-join with correct direction)
- Revenue with vs without cancelled (independent column aggregation)
- Payments vs billed total (independent subqueries, no cross-join)
- Billed quantity per product (correct join through billing_doc_headers)
- Products never billed (material-level NOT IN, not delivery join)
- Delivered-not-billed (soldToParty linkage, not referenceSdDocument)
- Customer SO vs billing comparison (correlated subqueries per customer)

---

## 2. Query Debugging Workflow

### Standard debugging loop used throughout:

```
1. Send natural language question to /query endpoint
2. Log raw LLM output (RAW LLM OUTPUT console.log in query.js)
3. Inspect returned SQL
4. Run SQL directly against SQLite to verify row count and values
5. Compare with ground truth derived from independent queries
6. If wrong: identify root cause (wrong join? wrong fact? wrong interpretation?)
7. Update system prompt with specific fix + verified example
8. Re-test same question + adjacent questions to check for regressions
```

### Example — Payments vs Billed Total Debug

**Question asked:** "Do total payments match total billed amount?"

**LLM SQL produced:**
```sql
SELECT SUM(p.amountInTransactionCurrency) as total_paid,
       SUM(bh.totalNetAmount) as total_billed
FROM payments p
LEFT JOIN journal_entry_items ji ON p.clearingAccountingDocument = ji.clearingAccountingDocument
LEFT JOIN billing_doc_headers bh ON ji.accountingDocument = bh.accountingDocument
WHERE bh.billingDocumentIsCancelled = 0
```

**LLM answer:** "total paid = -17,245.11, total billed = 37,038.79"

**Ground truth (independent queries):**
```sql
SELECT SUM(amountInTransactionCurrency) FROM payments  -- 9,445.05
SELECT SUM(totalNetAmount) FROM billing_doc_headers WHERE billingDocumentIsCancelled=0  -- 30,829.33
```

**Root cause:** The 3-table JOIN creates a many-to-many cross join.
Each payment row multiplied by matching journal rows, which multiplied
by matching billing rows → numbers completely wrong.

**Fix:** Always use independent subqueries for aggregate totals across tables.

---

### Example — Products Never Billed Debug

**Question asked:** "Which products appear in sales orders but have never been billed?"

**LLM SQL produced:**
```sql
WHERE soh.salesOrder NOT IN (
  SELECT DISTINCT di.referenceSdDocument FROM delivery_items di
  JOIN billing_doc_items bi ON di.deliveryDocument = bi.billingDocument
  WHERE bi.billingDocument IS NOT NULL
)
```

**LLM answer:** "50 products never billed"

**Problem:** `di.deliveryDocument = bi.billingDocument` — joining a delivery
document ID to a billing document ID. These are different entity IDs that
never match. The JOIN returns 0 rows, so NOT IN excludes nothing,
and all products look "never billed."

**Ground truth:** Only 2 products were never billed.

**Fix:** Compare at material level directly against billing_doc_items:
```sql
WHERE soi.material NOT IN (
  SELECT DISTINCT bi.material FROM billing_doc_items bi
  JOIN billing_doc_headers bh ON bi.billingDocument = bh.billingDocument
  WHERE bh.billingDocumentIsCancelled = 0
)
```

---

## 3. Guardrail Design

### Approach

The system prompt itself acts as the primary guardrail:

```json
{"error": "out_of_scope"}
```

Any question not about the O2C dataset returns this exact JSON,
which the backend maps to a user-friendly message:

```
"This system is designed to answer questions related to the Order-to-Cash
dataset only. You can ask about sales orders, deliveries, billing documents,
journal entries, payments, customers, products, and plants."
```

### Secondary guardrail — SQL execution retry

If the LLM generates invalid SQL that throws an error:
1. Backend catches the error
2. Re-prompts the LLM with: original question + error message + failed SQL
3. LLM self-corrects
4. Retry result is executed

This handles cases where valid-looking SQL has schema mismatches.

### What the guardrail prevents

- Off-topic questions (general knowledge, non-O2C topics)
- SQL injection via prompt (system prompt constrains to SELECT only)
- Hallucinated table/column names (retry loop catches execution errors)
- Wrong domain reasoning (facts section anchors LLM to actual data)

---

## 4. Edge Case Test Battery

17 edge cases were designed and verified against the live database
to stress-test the LLM's SQL generation across the most error-prone
query patterns in the O2C schema:

| # | Edge Case | Why It's Tricky |
|---|---|---|
| 1 | Cancellation pairs | Self-join with specific direction |
| 2 | Revenue with/without cancelled | Label confusion, total vs subtotals |
| 3 | Customers with only cancelled billing | Double-negation filter |
| 4 | Delivery complete, goods not moved | Two different status fields |
| 5 | Active billing with no journal | LEFT JOIN + NULL check |
| 6 | Journal entries with no clearing doc | Permanently unlinked |
| 7 | Full O2C trace for stuck customer | Flow breaks mid-chain |
| 8 | Shared clearing docs | Many-to-one payment→journal |
| 9 | Payment total vs billed total | Cross-join inflation trap |
| 10 | Mixed rejected + active items | HAVING clause with two conditions |
| 11 | All schedule lines zero qty | HAVING SUM=0 |
| 12 | Delivered, no billing (stuck flow) | soldToParty linkage required |
| 13 | Sales orders in billing_doc_items | Correct answer is always 0 |
| 14 | Billed qty per product | Must not join via referenceSdDocument |
| 15 | SO vs billing per customer | Correlated subquery required |
| 16 | Journal vs payment reconciliation | Per-customer independent sums |
| 17 | Products never billed | Material-level comparison |
