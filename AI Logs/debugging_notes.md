# Debugging Notes

> Raw debugging observations, discoveries, and fixes made during
> data validation and system prompt correction.

---

## DB1 — System Prompt Facts Were Written Against Wrong Dataset

**Discovery:** After loading all 49 JSONL files and hitting `/health`,
the row counts didn't match the hardcoded facts in the system prompt.

```
System prompt claimed:  243 billing_doc_headers, 160 cancelled
Actual loaded data:     163 billing_doc_headers, 80 cancelled
```

**Root cause:** The system prompt was written at a different point
in development, likely against a partial or different dataset export.

**Impact:** Any query asking about billing document counts or cancellation
rates would get wrong context, potentially leading the LLM to filter
or reason incorrectly about the data.

**Fix:** Re-derived all facts directly from SQL against the live DB,
replaced every hardcoded number in the prompt with verified values.

---

## DB2 — The Forbidden Join (Silent Zero-Row Bug)

**Discovery:** Multiple queries that should return data returned 0 rows.
Pattern: anything joining `billing_doc_items.referenceSdDocument` to
`sales_order_headers.salesOrder`.

**Investigation:**
```sql
-- These are 6-digit sales order IDs:
SELECT DISTINCT salesOrder FROM sales_order_headers LIMIT 3
-- 740506, 740507, 740508

-- These are what billing_doc_items.referenceSdDocument contains:
SELECT DISTINCT referenceSdDocument FROM billing_doc_items LIMIT 3
-- 80738109, 80754606, 80754601  (8-digit billing references)
```

**Impact:** Every query using this join silently returned 0 rows with no error.
The LLM would then say "no data found" when data clearly existed.

**Fix:** Added to STRICT RULES — never join these two fields.
Documented the correct bridge: delivery_items.referenceSdDocument = salesOrder.

---

## DB3 — overallOrdReltdBillgStatus Is NULL, Not Empty String

**Discovery:**
```sql
SELECT overallOrdReltdBillgStatus, COUNT(*)
FROM sales_order_headers
GROUP BY overallOrdReltdBillgStatus
-- Result: (None, 100) — all 100 rows have SQL NULL, not ''
```

**Impact:** System prompt said `overallOrdReltdBillgStatus = ''` for all orders.
Any LLM query filtering `WHERE overallOrdReltdBillgStatus = ''` would return 0 rows.
Added STRICT RULE: use IS NULL or avoid field entirely.

---

## DB4 — Cross-Join Inflation on Multi-Table Aggregates

**Discovery:** Testing "total payments vs total billed" produced:
- LLM answer: paid = -17,245.11, billed = 37,038.79
- Correct: paid = 9,445.05, billed = 30,829.33

**Investigation:** The LLM joined payments → journal → billing in one query.
With 120 payments, 123 journal entries, and 83 active billing docs, the
three-way join creates multiply-inflated rows before SUM is applied.

**Pattern that causes this:**
```sql
-- WRONG: SUM is applied after cross-join multiplication
FROM payments p
JOIN journal_entry_items ji ON p.clearingAccountingDocument = ji.clearingAccountingDocument
JOIN billing_doc_headers bh ON ji.accountingDocument = bh.accountingDocument
```

**Fix pattern:**
```sql
-- CORRECT: each table aggregated independently
SELECT
  (SELECT SUM(amountInTransactionCurrency) FROM payments) as total_payments,
  (SELECT SUM(totalNetAmount) FROM billing_doc_headers WHERE billingDocumentIsCancelled=0) as total_billed
```

Added to STRICT RULES for all aggregate-across-tables queries.

---

## DB5 — GMS Status 'A' Misinterpreted as "Completed"

**Discovery:** In the O2C trace for sales order 740506, the LLM said:
> "The overall goods movement status is 'A' for all rows, indicating that
> the goods movement has been completed"

**Fact:** `overallGoodsMovementStatus = 'A'` means NOT STARTED (pending).
`'C'` means complete. The LLM had this exactly backwards.

**Impact:** Any query about goods movement would give the opposite conclusion
about whether stock had actually shipped.

**Data context:** 83 of 86 deliveries have GMS='A' (goods NOT moved).
Only 3 deliveries have actually moved goods. This is a systemic finding —
nearly the entire dataset has deliveries created but goods not physically moved.

**Fix:** Added explicit status code table to schema notes:
```
overallGoodsMovementStatus: 'A'=NOT started, 'C'=complete
```

---

## DB6 — 24 Active Billing Docs Have No Journal Entry

**Discovery:**
```sql
SELECT COUNT(*) FROM billing_doc_headers bh
LEFT JOIN journal_entry_items ji ON bh.accountingDocument = ji.accountingDocument
WHERE bh.billingDocumentIsCancelled = 0 AND ji.accountingDocument IS NULL
-- Result: 24
```

**Impact:** O2C trace queries using INNER JOIN on accountingDocument would
silently drop 24 active billing docs from results.

**Fix:** All O2C trace queries must use LEFT JOIN. Added fact to prompt.
These 24 docs are concentrated in customer 320000083 (20 docs), plus
2 each for 320000088 and 320000085.

---

## DB7 — Cancellation Pair Join Had Wrong Direction

**Discovery:** Initial SQL for finding cancellation pairs:
```sql
JOIN billing_doc_headers bdh2
  ON bdh1.billingDocument = bdh2.cancelledBillingDocument
WHERE bdh1.billingDocumentIsCancelled = 0
  AND bdh2.billingDocumentIsCancelled = 1
```
Returned 0 rows.

**Investigation:** The `cancelledBillingDocument` field lives on the
ACTIVE/replacement doc (not the cancelled one):
```sql
SELECT billingDocumentIsCancelled, COUNT(*)
FROM billing_doc_headers
WHERE cancelledBillingDocument IS NOT NULL
GROUP BY billingDocumentIsCancelled
-- active docs (0): 80  |  cancelled docs (1): 0
```

**Correct direction:**
```sql
FROM billing_doc_headers original           -- the cancelled doc
JOIN billing_doc_headers replacement        -- the active replacement
  ON replacement.cancelledBillingDocument = original.billingDocument
WHERE original.billingDocumentIsCancelled = 1
  AND replacement.billingDocumentIsCancelled = 0
```
Returns 80 pairs — all 80 cancelled docs have exactly one active replacement.

---

## DB8 — "Delivered Not Billed" Example Was Silently Always Wrong

**Discovery:** The existing system prompt example for "delivered not billed" used:
```sql
WHERE di.referenceSdDocument NOT IN (
  SELECT DISTINCT referenceSdDocument FROM billing_doc_items
  WHERE referenceSdDocument IS NOT NULL AND referenceSdDocument != ''
)
```

Since `billing_doc_items.referenceSdDocument` contains 8-digit IDs
that never match 6-digit SO IDs, the NOT IN subquery is effectively:
`WHERE salesOrder NOT IN (empty set)` → returns ALL delivered SOs.

**Result:** Always returned all 86 delivered sales orders as "never billed" —
completely masking the real answer (only 3 stuck orders).

**Fix:** Use soldToParty linkage:
```sql
WHERE sh.soldToParty NOT IN (
  SELECT DISTINCT soldToParty FROM billing_doc_headers
  WHERE billingDocumentIsCancelled = 0
)
```
Returns correct 3 orders.

---

## DB9 — Safety Pass Caught 4 Regressions Before Production

After writing all fixes, a safety pass ran all 18 SQL examples
against the live DB. Found:

1. **EC1 count:** We said "returns 10 pairs" — actual is 80.
   Our earlier test used LIMIT 10 and we mistook the sample size for total.

2. **EC14 count:** We said "10 products billed" — actual is 55.
   Same LIMIT 10 sampling error.

3. **EC8 count:** We tried to change LLM's answer of 44 to 10 — but 44 was correct.
   Our initial "10" estimate was wrong. Would have introduced a regression.

4. **Existing "delivered_not_billed" example:** Was silently wrong (DB8 above).
   Would have continued giving wrong answers if safety pass hadn't caught it.

**Lesson:** Always run a full SQL safety pass after any system prompt change
to verify both the fixed queries AND the existing queries still work correctly.
