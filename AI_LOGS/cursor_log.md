# Graph-based data modeling and query system
_Exported on 3/26/2026 at 00:11:59 GMT+5:30 from Cursor (2.6.20)_

---

**User**

I am building a Graph-Based Data Modeling and Query System for a 
real SAP Order-to-Cash ERP dataset. This is a full-stack application 
with an interactive graph visualization and an LLM-powered natural 
language query interface.

## TECH STACK
- Backend: Node.js + Express
- Database: SQLite via better-sqlite3
- Graph (in-memory): graphology
- Frontend: React + TypeScript + Vite
- Graph Visualization: react-force-graph-2d
- LLM: Google Gemini 1.5 Flash via @google/generative-ai
- Styling: Tailwind CSS

## PROJECT STRUCTURE
project-root/
├── backend/
│   ├── index.js
│   ├── ingest.js
│   ├── graph.js
│   ├── query.js
│   ├── guardrails.js
│   ├── data/              ← all 17 dataset folders go here
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── GraphView.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── NodePanel.tsx
│   │   └── api.ts
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
└── README.md

## COMPLETE DATASET STRUCTURE
The dataset is in backend/data/ as 17 subfolders.
Each subfolder contains multiple .jsonl part files.
Each line in a .jsonl file is one JSON record.
Ingest ALL part files from ALL subfolders, combining parts 
of the same entity into one SQLite table.

### FOLDER 1: billing_document_annotations/
EXACT FIELDS:
billingDocument, billingDocumentType, creationDate, creationTime,
lastChangeDateTime, billingDocumentDate, billingDocumentIsCancelled,
cancelledBillingDocument, totalNetAmount, transactionCurrency,
companyCode, fiscalYear, accountingDocument, soldToParty

### FOLDER 2: billing_document_items/
EXACT FIELDS:
billingDocument, billingDocumentItem, material, billingQuantity,
billingQuantityUnit, netAmount, transactionCurrency,
referenceSdDocument, referenceSdDocumentItem

### FOLDER 3: business_partner_addresses/
EXACT FIELDS:
businessPartner, addressId, validityStartDate, validityEndDate,
addressUuid, addressTimeZone, cityName, country, poBox,
poBoxDeviatingCityName, poBoxDeviatingCountry, poBoxDeviatingRegion,
poBoxIsWithoutNumber, poBoxLobbyName, poBoxPostalCode, postalCode,
region, streetName, taxJurisdiction, transportZone

### FOLDER 4: business_partners/
EXACT FIELDS:
businessPartner, customer, businessPartnerCategory,
businessPartnerFullName, businessPartnerGrouping,
businessPartnerName, correspondenceLanguage, createdByUser,
creationDate, creationTime, firstName, formOfAddress, industry,
lastChangeDate, lastName, organizationBpName1, organizationBpName2,
businessPartnerIsBlocked, isMarkedForArchiving

### FOLDER 5: customer_companies/
EXACT FIELDS:
customer, companyCode, accountingClerk, accountingClerkFaxNumber,
accountingClerkInternetAddress, accountingClerkPhoneNumber,
alternativePayerAccount, paymentBlockingReason, paymentMethodsList,
paymentTerms, reconciliationAccount, deletionIndicator,
customerAccountGroup

### FOLDER 6: customer_sales_arrangements/
EXACT FIELDS:
customer, salesOrganization, distributionChannel, division,
billingIsBlockedForCustomer, completeDeliveryIsDefined,
creditControlArea, currency, customerPaymentTerms,
deliveryPriority, incotermsClassification, incotermsLocation1,
salesGroup, salesOffice, shippingCondition,
slsUnlmtdOvrdelivIsAllwd, supplyingPlant, salesDistrict,
exchangeRateType

### FOLDER 7: journal_entry_items/
EXACT FIELDS:
companyCode, fiscalYear, accountingDocument, glAccount,
referenceDocument, costCenter, profitCenter, transactionCurrency,
amountInTransactionCurrency, companyCodeCurrency,
amountInCompanyCodeCurrency, postingDate, documentDate,
accountingDocumentType, accountingDocumentItem, assignmentReference,
lastChangeDateTime, customer, financialAccountType, clearingDate,
clearingAccountingDocument, clearingDocFiscalYear

### FOLDER 8: outbound_delivery_headers/
EXACT FIELDS:
deliveryDocument, creationDate, creationTime,
actualGoodsMovementDate, actualGoodsMovementTime,
deliveryBlockReason, hdrGeneralIncompletionStatus,
headerBillingBlockReason, lastChangeDate,
overallGoodsMovementStatus, overallPickingStatus,
overallProofOfDeliveryStatus, shippingPoint

### FOLDER 9: outbound_delivery_items/
EXACT FIELDS:
deliveryDocument, deliveryDocumentItem, actualDeliveryQuantity,
batch, deliveryQuantityUnit, itemBillingBlockReason, lastChangeDate,
plant, referenceSdDocument, referenceSdDocumentItem, storageLocation

### FOLDER 10: payments_accounts_receivable/
EXACT FIELDS:
companyCode, fiscalYear, accountingDocument, accountingDocumentItem,
clearingDate, clearingAccountingDocument, clearingDocFiscalYear,
amountInTransactionCurrency, transactionCurrency,
amountInCompanyCodeCurrency, companyCodeCurrency, customer,
invoiceReference, invoiceReferenceFiscalYear, salesDocument,
salesDocumentItem, postingDate, documentDate, assignmentReference,
glAccount, financialAccountType, profitCenter, costCenter

### FOLDER 11: plants/
EXACT FIELDS:
plant, plantName, valuationArea, plantCustomer, plantSupplier,
factoryCalendar, defaultPurchasingOrganization, salesOrganization,
addressId, plantCategory, distributionChannel, division, language,
isMarkedForArchiving

### FOLDER 12: product_descriptions/
EXACT FIELDS:
product, language, productDescription

### FOLDER 13: product_plants/
EXACT FIELDS:
product, plant, countryOfOrigin, regionOfOrigin,
productionInvtryManagedLoc, availabilityCheckType,
fiscalYearVariant, profitCenter, mrpType

### FOLDER 14: product_storage_locations/
EXACT FIELDS:
product, plant, storageLocation, physicalInventoryBlockInd,
dateOfLastPostedCntUnRstrcdStk

### FOLDER 15: products/
EXACT FIELDS:
product, productType, crossPlantStatus,
crossPlantStatusValidityDate, creationDate, createdByUser,
lastChangeDate, lastChangeDateTime, isMarkedForDeletion,
productOldId, grossWeight, weightUnit, netWeight, productGroup,
baseUnit, division, industrySector

### FOLDER 16: sales_order_headers/
EXACT FIELDS:
salesOrder, salesOrderType, salesOrganization, distributionChannel,
organizationDivision, salesGroup, salesOffice, soldToParty,
creationDate, createdByUser, lastChangeDateTime, totalNetAmount,
overallDeliveryStatus, overallOrdReltdBillgStatus,
overallSdDocReferenceStatus, transactionCurrency, pricingDate,
requestedDeliveryDate, headerBillingBlockReason, deliveryBlockReason,
incotermsClassification, incotermsLocation1, customerPaymentTerms,
totalCreditCheckStatus

### FOLDER 17: sales_order_items/
EXACT FIELDS:
salesOrder, salesOrderItem, salesOrderItemCategory, material,
requestedQuantity, requestedQuantityUnit, transactionCurrency,
netAmount, materialGroup, productionPlant, storageLocation,
salesDocumentRjcnReason, itemBillingBlockReason

### FOLDER 18: sales_order_schedule_lines/
EXACT FIELDS:
salesOrder, salesOrderItem, scheduleLine, confirmedDeliveryDate,
orderQuantityUnit, confdOrderQtyByMatlAvailCheck

---

## INGEST.JS - COMPLETE REQUIREMENTS

Write a function ingestAll() that:
1. Reads all subfolders in backend/data/
2. For each subfolder, reads ALL .jsonl files (there are multiple 
   part files per folder - combine them all)
3. Parses each line as JSON
4. Inserts into the correct SQLite table using INSERT OR IGNORE
5. Logs: table name, number of files found, rows inserted

Create these SQLite tables with EXACT column names:
```sql
CREATE TABLE IF NOT EXISTS billing_doc_headers (
  billingDocument TEXT PRIMARY KEY,
  billingDocumentType TEXT,
  creationDate TEXT,
  billingDocumentDate TEXT,
  billingDocumentIsCancelled INTEGER DEFAULT 0,
  cancelledBillingDocument TEXT,
  totalNetAmount REAL,
  transactionCurrency TEXT,
  companyCode TEXT,
  fiscalYear TEXT,
  accountingDocument TEXT,
  soldToParty TEXT
);

CREATE TABLE IF NOT EXISTS billing_doc_items (
  billingDocument TEXT,
  billingDocumentItem TEXT,
  material TEXT,
  billingQuantity REAL,
  billingQuantityUnit TEXT,
  netAmount REAL,
  transactionCurrency TEXT,
  referenceSdDocument TEXT,
  referenceSdDocumentItem TEXT,
  PRIMARY KEY (billingDocument, billingDocumentItem)
);

CREATE TABLE IF NOT EXISTS business_partners (
  businessPartner TEXT PRIMARY KEY,
  customer TEXT,
  businessPartnerCategory TEXT,
  businessPartnerFullName TEXT,
  businessPartnerName TEXT,
  organizationBpName1 TEXT,
  organizationBpName2 TEXT,
  firstName TEXT,
  lastName TEXT,
  industry TEXT,
  creationDate TEXT,
  businessPartnerIsBlocked INTEGER DEFAULT 0,
  isMarkedForArchiving INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS business_partner_addresses (
  businessPartner TEXT,
  addressId TEXT,
  cityName TEXT,
  country TEXT,
  postalCode TEXT,
  region TEXT,
  streetName TEXT,
  transportZone TEXT,
  PRIMARY KEY (businessPartner, addressId)
);

CREATE TABLE IF NOT EXISTS customer_companies (
  customer TEXT PRIMARY KEY,
  companyCode TEXT,
  paymentTerms TEXT,
  reconciliationAccount TEXT,
  deletionIndicator INTEGER DEFAULT 0,
  customerAccountGroup TEXT,
  paymentBlockingReason TEXT
);

CREATE TABLE IF NOT EXISTS customer_sales_arrangements (
  customer TEXT,
  salesOrganization TEXT,
  distributionChannel TEXT,
  division TEXT,
  currency TEXT,
  customerPaymentTerms TEXT,
  deliveryPriority TEXT,
  supplyingPlant TEXT,
  salesDistrict TEXT,
  shippingCondition TEXT,
  creditControlArea TEXT,
  billingIsBlockedForCustomer INTEGER DEFAULT 0,
  PRIMARY KEY (customer, salesOrganization, distributionChannel)
);

CREATE TABLE IF NOT EXISTS journal_entry_items (
  accountingDocument TEXT,
  accountingDocumentItem TEXT,
  companyCode TEXT,
  fiscalYear TEXT,
  glAccount TEXT,
  referenceDocument TEXT,
  costCenter TEXT,
  profitCenter TEXT,
  transactionCurrency TEXT,
  amountInTransactionCurrency REAL,
  companyCodeCurrency TEXT,
  amountInCompanyCodeCurrency REAL,
  postingDate TEXT,
  documentDate TEXT,
  accountingDocumentType TEXT,
  assignmentReference TEXT,
  customer TEXT,
  financialAccountType TEXT,
  clearingDate TEXT,
  clearingAccountingDocument TEXT,
  clearingDocFiscalYear TEXT,
  PRIMARY KEY (accountingDocument, accountingDocumentItem)
);

CREATE TABLE IF NOT EXISTS delivery_headers (
  deliveryDocument TEXT PRIMARY KEY,
  creationDate TEXT,
  actualGoodsMovementDate TEXT,
  deliveryBlockReason TEXT,
  headerBillingBlockReason TEXT,
  overallGoodsMovementStatus TEXT,
  overallPickingStatus TEXT,
  overallProofOfDeliveryStatus TEXT,
  shippingPoint TEXT
);

CREATE TABLE IF NOT EXISTS delivery_items (
  deliveryDocument TEXT,
  deliveryDocumentItem TEXT,
  actualDeliveryQuantity REAL,
  deliveryQuantityUnit TEXT,
  batch TEXT,
  plant TEXT,
  referenceSdDocument TEXT,
  referenceSdDocumentItem TEXT,
  storageLocation TEXT,
  itemBillingBlockReason TEXT,
  PRIMARY KEY (deliveryDocument, deliveryDocumentItem)
);

CREATE TABLE IF NOT EXISTS payments (
  accountingDocument TEXT,
  accountingDocumentItem TEXT,
  companyCode TEXT,
  fiscalYear TEXT,
  clearingDate TEXT,
  clearingAccountingDocument TEXT,
  clearingDocFiscalYear TEXT,
  amountInTransactionCurrency REAL,
  transactionCurrency TEXT,
  amountInCompanyCodeCurrency REAL,
  companyCodeCurrency TEXT,
  customer TEXT,
  invoiceReference TEXT,
  invoiceReferenceFiscalYear TEXT,
  salesDocument TEXT,
  salesDocumentItem TEXT,
  postingDate TEXT,
  documentDate TEXT,
  glAccount TEXT,
  financialAccountType TEXT,
  profitCenter TEXT,
  costCenter TEXT,
  PRIMARY KEY (accountingDocument, accountingDocumentItem)
);

CREATE TABLE IF NOT EXISTS plants (
  plant TEXT PRIMARY KEY,
  plantName TEXT,
  valuationArea TEXT,
  salesOrganization TEXT,
  distributionChannel TEXT,
  division TEXT,
  plantCategory TEXT,
  addressId TEXT,
  factoryCalendar TEXT,
  isMarkedForArchiving INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_descriptions (
  product TEXT PRIMARY KEY,
  productDescription TEXT,
  language TEXT
);

CREATE TABLE IF NOT EXISTS product_plants (
  product TEXT,
  plant TEXT,
  countryOfOrigin TEXT,
  regionOfOrigin TEXT,
  profitCenter TEXT,
  mrpType TEXT,
  availabilityCheckType TEXT,
  PRIMARY KEY (product, plant)
);

CREATE TABLE IF NOT EXISTS product_storage_locations (
  product TEXT,
  plant TEXT,
  storageLocation TEXT,
  physicalInventoryBlockInd TEXT,
  dateOfLastPostedCntUnRstrcdStk TEXT,
  PRIMARY KEY (product, plant, storageLocation)
);

CREATE TABLE IF NOT EXISTS products (
  product TEXT PRIMARY KEY,
  productType TEXT,
  crossPlantStatus TEXT,
  creationDate TEXT,
  isMarkedForDeletion INTEGER DEFAULT 0,
  grossWeight REAL,
  weightUnit TEXT,
  netWeight REAL,
  productGroup TEXT,
  baseUnit TEXT,
  division TEXT,
  industrySector TEXT
);

CREATE TABLE IF NOT EXISTS sales_order_headers (
  salesOrder TEXT PRIMARY KEY,
  salesOrderType TEXT,
  salesOrganization TEXT,
  distributionChannel TEXT,
  soldToParty TEXT,
  creationDate TEXT,
  totalNetAmount REAL,
  transactionCurrency TEXT,
  overallDeliveryStatus TEXT,
  overallOrdReltdBillgStatus TEXT,
  requestedDeliveryDate TEXT,
  headerBillingBlockReason TEXT,
  deliveryBlockReason TEXT,
  incotermsClassification TEXT,
  customerPaymentTerms TEXT
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  salesOrder TEXT,
  salesOrderItem TEXT,
  material TEXT,
  requestedQuantity REAL,
  requestedQuantityUnit TEXT,
  netAmount REAL,
  transactionCurrency TEXT,
  materialGroup TEXT,
  productionPlant TEXT,
  storageLocation TEXT,
  itemBillingBlockReason TEXT,
  salesDocumentRjcnReason TEXT,
  PRIMARY KEY (salesOrder, salesOrderItem)
);

CREATE TABLE IF NOT EXISTS sales_order_schedule_lines (
  salesOrder TEXT,
  salesOrderItem TEXT,
  scheduleLine TEXT,
  confirmedDeliveryDate TEXT,
  orderQuantityUnit TEXT,
  confdOrderQtyByMatlAvailCheck REAL,
  PRIMARY KEY (salesOrder, salesOrderItem, scheduleLine)
);
```

Map each folder to its table using this exact mapping:
- billing_document_annotations → billing_doc_headers
- billing_document_items → billing_doc_items
- business_partner_addresses → business_partner_addresses
- business_partners → business_partners
- customer_companies → customer_companies
- customer_sales_arrangements → customer_sales_arrangements
- journal_entry_items → journal_entry_items
- outbound_delivery_headers → delivery_headers
- outbound_delivery_items → delivery_items
- payments_accounts_receivable → payments
- plants → plants
- product_descriptions → product_descriptions
- product_plants → product_plants
- product_storage_locations → product_storage_locations
- products → products
- sales_order_headers → sales_order_headers
- sales_order_items → sales_order_items
- sales_order_schedule_lines → sales_order_schedule_lines

After all inserts print a summary:
✓ billing_doc_headers: 5000 rows
✓ billing_doc_items: 12000 rows
... for every table

Export the db instance for use in other modules.

---

## GRAPH.JS - NODE AND EDGE MODEL

Use graphology MultiDirectedGraph.

Build nodes for these entity types with a 'type' and 'label':

NODE TYPES:
- SalesOrder → from sales_order_headers, id = salesOrder
- SalesOrderItem → from sales_order_items, 
  id = salesOrder + "_" + salesOrderItem
- DeliveryHeader → from delivery_headers, id = deliveryDocument
- DeliveryItem → from delivery_items,
  id = deliveryDocument + "_" + deliveryDocumentItem
- BillingDoc → from billing_doc_headers, id = billingDocument
- BillingItem → from billing_doc_items,
  id = billingDocument + "_" + billingDocumentItem
- JournalEntry → from journal_entry_items, 
  id = accountingDocument + "_" + accountingDocumentItem
- Payment → from payments,
  id = accountingDocument + "_" + accountingDocumentItem
- Customer → from business_partners, id = businessPartner
- Product → from product_descriptions, id = product
- Plant → from plants, id = plant

NODE COLORS:
SalesOrder: "#378ADD"
SalesOrderItem: "#5BA3E8"
DeliveryHeader: "#1D9E75"
DeliveryItem: "#2BC090"
BillingDoc: "#7F77DD"
BillingItem: "#9B8FE8"
JournalEntry: "#E24B4A"
Payment: "#639922"
Customer: "#888780"
Product: "#BA7517"
Plant: "#D85A30"

EDGES to build (query SQLite for each):

1. Customer → SalesOrder
   business_partners.businessPartner = sales_order_headers.soldToParty
   relation: "PLACED_ORDER"

2. SalesOrder → SalesOrderItem
   sales_order_items.salesOrder = sales_order_headers.salesOrder
   relation: "HAS_ITEM"

3. SalesOrderItem → Product
   sales_order_items.material = product_descriptions.product
   relation: "IS_PRODUCT"

4. SalesOrder → DeliveryHeader
   delivery_items.referenceSdDocument = sales_order_headers.salesOrder
   (join delivery_items to get deliveryDocument, then link to 
   delivery_headers)
   relation: "FULFILLED_BY"

5. DeliveryHeader → DeliveryItem
   delivery_items.deliveryDocument = delivery_headers.deliveryDocument
   relation: "HAS_DELIVERY_ITEM"

6. DeliveryItem → Plant
   delivery_items.plant = plants.plant
   relation: "SHIPPED_FROM"

7. SalesOrder → BillingDoc
   billing_doc_items.referenceSdDocument = sales_order_headers.salesOrder
   (join billing_doc_items to billing_doc_headers on billingDocument)
   relation: "BILLED_AS"

8. BillingDoc → BillingItem
   billing_doc_items.billingDocument = billing_doc_headers.billingDocument
   relation: "HAS_BILLING_ITEM"

9. BillingItem → Product
   billing_doc_items.material = product_descriptions.product
   relation: "BILLED_PRODUCT"

10. BillingDoc → JournalEntry
    billing_doc_headers.accountingDocument = 
    journal_entry_items.accountingDocument
    relation: "HAS_JOURNAL_ENTRY"

11. JournalEntry → Payment
    journal_entry_items.clearingAccountingDocument =
    payments.clearingAccountingDocument
    relation: "CLEARED_BY_PAYMENT"

12. Customer → BillingDoc
    billing_doc_headers.soldToParty = business_partners.businessPartner
    relation: "BILLED_TO"

graphToJSON() returns:
{
  nodes: [{ id, type, label, color, ...selectedAttrs }],
  edges: [{ source, target, relation }]
}

For performance: limit initial graph to 500 nodes max
(take top N by connection count). Add a /graph/full endpoint 
for the complete graph.

---

## QUERY.JS - COMPLETE LLM ENGINE

Use @google/generative-ai with model gemini-1.5-flash.

FULL SYSTEM PROMPT (inject this exactly):
You are a data analyst for a SAP Order-to-Cash ERP system at
company ABCD. You have access to a SQLite database.
COMPLETE SCHEMA:
sales_order_headers(salesOrder PK, salesOrderType,
salesOrganization, soldToParty, creationDate, totalNetAmount,
transactionCurrency, overallDeliveryStatus,
overallOrdReltdBillgStatus, requestedDeliveryDate,
headerBillingBlockReason, deliveryBlockReason)
sales_order_items(salesOrder, salesOrderItem, material,
requestedQuantity, requestedQuantityUnit, netAmount,
materialGroup, productionPlant, storageLocation,
itemBillingBlockReason, salesDocumentRjcnReason)
sales_order_schedule_lines(salesOrder, salesOrderItem,
scheduleLine, confirmedDeliveryDate,
confdOrderQtyByMatlAvailCheck)
billing_doc_headers(billingDocument PK, billingDocumentType,
billingDocumentDate, billingDocumentIsCancelled, totalNetAmount,
transactionCurrency, companyCode, fiscalYear, accountingDocument,
soldToParty)
billing_doc_items(billingDocument, billingDocumentItem, material,
billingQuantity, netAmount, referenceSdDocument,
referenceSdDocumentItem)
NOTE: referenceSdDocument = the Sales Order ID
delivery_headers(deliveryDocument PK, creationDate,
actualGoodsMovementDate, overallGoodsMovementStatus,
overallPickingStatus, headerBillingBlockReason, shippingPoint)
delivery_items(deliveryDocument, deliveryDocumentItem,
actualDeliveryQuantity, plant, referenceSdDocument,
referenceSdDocumentItem, storageLocation)
NOTE: referenceSdDocument = the Sales Order ID
journal_entry_items(accountingDocument, accountingDocumentItem,
glAccount, referenceDocument, amountInTransactionCurrency,
transactionCurrency, amountInCompanyCodeCurrency, postingDate,
accountingDocumentType, customer, clearingDate,
clearingAccountingDocument, profitCenter, costCenter)
payments(accountingDocument, accountingDocumentItem, clearingDate,
clearingAccountingDocument, amountInTransactionCurrency,
transactionCurrency, customer, invoiceReference, salesDocument,
postingDate, glAccount, profitCenter)
business_partners(businessPartner PK, customer,
businessPartnerFullName, organizationBpName1, industry,
businessPartnerIsBlocked)
business_partner_addresses(businessPartner, addressId, cityName,
country, postalCode, region, streetName)
customer_sales_arrangements(customer, salesOrganization,
distributionChannel, currency, customerPaymentTerms,
supplyingPlant, salesDistrict)
plants(plant PK, plantName, salesOrganization,
distributionChannel, plantCategory)
product_descriptions(product PK, productDescription, language)
product_plants(product, plant, countryOfOrigin, profitCenter,
mrpType)
product_storage_locations(product, plant, storageLocation)
products(product PK, productType, grossWeight, weightUnit,
netWeight, productGroup, baseUnit, division, industrySector)
KEY JOIN RELATIONSHIPS:

billing_doc_items.referenceSdDocument = sales_order_headers.salesOrder
delivery_items.referenceSdDocument = sales_order_headers.salesOrder
billing_doc_headers.accountingDocument = journal_entry_items.accountingDocument
billing_doc_headers.soldToParty = business_partners.businessPartner
sales_order_headers.soldToParty = business_partners.businessPartner
billing_doc_items.material = product_descriptions.product
sales_order_items.material = product_descriptions.product
delivery_items.plant = plants.plant
journal_entry_items.clearingAccountingDocument = payments.clearingAccountingDocument
overallDeliveryStatus: 'C'=complete, 'A'=not started, 'B'=partial
overallOrdReltdBillgStatus: 'C'=fully billed, ''=not billed
billingDocumentIsCancelled: 1=cancelled, 0=active

STRICT RULES:

ONLY answer questions about this Order-to-Cash dataset
Return ONLY valid JSON, no markdown fences, no extra text:
{"sql": "SELECT ...", "explanation": "what this finds"}
For out-of-scope questions return exactly:
{"error": "out_of_scope"}
Always add LIMIT 50 unless user asks for all
Never hallucinate data
For trace queries, JOIN across all relevant tables
When filtering by status use the codes above

EXAMPLE QUERIES AND CORRECT SQL:
Q: "Which products have the most billing documents?"
A: {"sql": "SELECT pd.productDescription, COUNT(DISTINCT bi.billingDocument) as billing_count, SUM(bi.netAmount) as total_amount FROM billing_doc_items bi JOIN product_descriptions pd ON bi.material = pd.product GROUP BY bi.material, pd.productDescription ORDER BY billing_count DESC LIMIT 10", "explanation": "Products ranked by number of billing documents"}
Q: "Trace the full flow of billing document 90504274"
A: {"sql": "SELECT bh.billingDocument, bh.billingDocumentDate, bh.totalNetAmount, bh.billingDocumentIsCancelled, bi.referenceSdDocument as salesOrder, dh.deliveryDocument, dh.actualGoodsMovementDate, dh.overallGoodsMovementStatus, ji.accountingDocument as journalEntry, ji.amountInTransactionCurrency as journalAmount, ji.postingDate, p.clearingDate as paymentDate, p.amountInTransactionCurrency as paymentAmount FROM billing_doc_headers bh LEFT JOIN billing_doc_items bi ON bh.billingDocument = bi.billingDocument LEFT JOIN delivery_items di ON bi.referenceSdDocument = di.referenceSdDocument LEFT JOIN delivery_headers dh ON di.deliveryDocument = dh.deliveryDocument LEFT JOIN journal_entry_items ji ON bh.accountingDocument = ji.accountingDocument LEFT JOIN payments p ON ji.clearingAccountingDocument = p.clearingAccountingDocument WHERE bh.billingDocument = '90504274' LIMIT 50", "explanation": "Full O2C flow trace for billing document"}
Q: "Find sales orders delivered but never billed"
A: {"sql": "SELECT DISTINCT di.referenceSdDocument as salesOrder, sh.totalNetAmount, sh.creationDate, sh.overallDeliveryStatus FROM delivery_items di JOIN sales_order_headers sh ON di.referenceSdDocument = sh.salesOrder WHERE di.referenceSdDocument NOT IN (SELECT DISTINCT referenceSdDocument FROM billing_doc_items WHERE referenceSdDocument IS NOT NULL AND referenceSdDocument != '') LIMIT 50", "explanation": "Sales orders with deliveries but no billing documents"}
Q: "Find sales orders billed but never delivered"
A: {"sql": "SELECT DISTINCT bi.referenceSdDocument as salesOrder, sh.totalNetAmount, sh.creationDate FROM billing_doc_items bi JOIN sales_order_headers sh ON bi.referenceSdDocument = sh.salesOrder WHERE bi.referenceSdDocument NOT IN (SELECT DISTINCT referenceSdDocument FROM delivery_items WHERE referenceSdDocument IS NOT NULL AND referenceSdDocument != '') LIMIT 50", "explanation": "Sales orders billed without delivery"}
Q: "Total revenue by customer"
A: {"sql": "SELECT bp.businessPartnerFullName, bp.organizationBpName1, COUNT(DISTINCT bh.billingDocument) as invoice_count, SUM(bh.totalNetAmount) as total_revenue, bh.transactionCurrency FROM billing_doc_headers bh JOIN business_partners bp ON bh.soldToParty = bp.businessPartner WHERE bh.billingDocumentIsCancelled = 0 GROUP BY bh.soldToParty ORDER BY total_revenue DESC LIMIT 20", "explanation": "Revenue breakdown by customer"}

Query execution flow in queryWithLLM(message, history):
1. Build prompt: system + last 5 history messages + current message
2. Call Gemini → get text response
3. Strip any ``` fences, trim whitespace
4. JSON.parse() with try/catch
5. If parsed.error === 'out_of_scope' → return guardrail message
6. Execute SQL: db.prepare(parsed.sql).all()
7. If SQL throws error → retry once: send error + original 
   question back to Gemini asking it to fix the SQL
8. Send results to Gemini for plain English summary:
   "User asked: [question]. SQL returned [N] rows: [first 20 rows 
   as JSON]. Write a clear 2-3 sentence answer with specific 
   numbers and IDs from the data."
9. Extract highlightNodes: collect first column value of each 
   result row, deduplicate, max 10 items
10. Return { answer, highlightNodes, sql, rowCount, explanation }

---

## GUARDRAILS.JS

Export isOffTopic(message) → boolean

Block patterns (return true = block):
- No mentions of: order, delivery, billing, invoice, payment, 
  customer, product, plant, sales, journal, material, shipment,
  revenue, document, SAP, ERP, account, dispatch, fulfillment
- Contains: poem, joke, story, weather, capital city, president,
  celebrity, sport, recipe, code help, algorithm, math problem,
  translate, who is, what year, explain quantum, history of

DOMAIN MESSAGE (return this when blocked):
"This system is designed to answer questions related to the 
Order-to-Cash dataset only. You can ask about sales orders, 
deliveries, billing documents, journal entries, payments, 
customers, products, and plants."

---

## BACKEND INDEX.JS

Express on PORT from .env (default 3001).
CORS enabled for all origins.
express.json() middleware.

Startup sequence:
1. Call ingestAll() — reads all JSONL files, populates SQLite
2. Call buildGraph() — constructs in-memory graphology graph
3. Log: "Server ready. Graph has X nodes, Y edges."

ROUTES:

GET /health
→ { status: 'ok', nodeCount, edgeCount, tables: {rowCounts} }

GET /graph
→ graphToJSON() — limited to 500 nodes for performance

GET /graph/full  
→ graphToJSON() — all nodes (may be large)

GET /graph/node/:id
→ single node data + array of neighbor nodes + edges
→ { node, neighbors: [{id, type, relation}] }

POST /query
Body: { message: string, history?: [{role, text}] }
→ if isOffTopic(message): 
  return { answer: DOMAIN_MESSAGE, guardrailed: true }
→ else: return queryWithLLM(message, history)
→ catch all errors, return { answer: "Something went wrong..." }

---

## FRONTEND

### App.tsx
State: graphData, highlightNodes (string[]), selectedNode
Layout: flexbox row, height 100vh
Left panel: 65% width, position relative
Right panel: 35% width, border-left: 1px solid #e5e7eb

Header bar (full width, above both panels):
Height 48px, border-bottom, padding 0 16px
Left: "Mapping /" in gray + " Order to Cash" in black bold
Both panels share this header.

Fetch GET /graph on mount → setGraphData

### GraphView.tsx
import ForceGraph2D from 'react-force-graph-2d'

Props: { data, highlightNodes, onNodeClick }

nodeCanvasObject: draw each node as a circle
- If node.id is in highlightNodes: radius 9, fill #FF3B30
- Else: radius 5, fill node.color
- Draw node.type label below node in 8px gray font

linkColor: () => '#B5D4F4'
backgroundColor: '#f8f8f8'
linkWidth: 0.5
onNodeClick: calls onNodeClick prop with node data

Two buttons absolutely positioned top-left of this panel:
- "Minimize" button (icon + text)
- "Hide Granular Overlay" button (icon + text)
Style: white background, rounded, small shadow, 12px font

### NodePanel.tsx
Props: { node, onClose }

Absolutely positioned: top 60px, left 20px
z-index: 1000
Width: 300px
White background, border-radius 12px
Box shadow: 0 4px 20px rgba(0,0,0,0.1)
Padding: 20px

Content:
- Bold heading: node.type (16px)
- Italic muted: "Entity: " + node.type (12px)
- Divider line
- Key-value list of all node attributes (12px)
  Skip: x, y, vx, vy, index, color, type
  Format: "<key>: <value>" with key in gray
- If more than 8 fields: show first 8 then 
  italic gray "Additional fields hidden for readability"
- "Connections: N" at bottom where N = count of edges
- Close button: top-right, gray X, 14px

### ChatPanel.tsx
Props: { onHighlight: (ids: string[]) => void }

Full height flex column.

Header (48px):
- "Chat with Graph" in bold 14px
- "Order to Cash" in gray 12px below

Messages area (flex-1, overflow-y auto, padding 16px):
- Each message is a bubble
- Assistant: left side, black circle avatar with white "D" (32px),
  then bubble: #f0f0f0 background, black text, rounded-lg,
  max-width 85%
- User: right side, dark bubble #111111, white text, rounded-lg
- Below each assistant message: 
  <details style="font-size:11px; margin-top:4px">
    <summary style="cursor:pointer; color:#888">View SQL</summary>
    <pre style="font-size:10px; overflow-x:auto">{sql}</pre>
  </details>
  Only show if sql exists in the message

Initial message on load (assistant role):
"Hi! I can help you analyze the Order to Cash process."

Loading state: three animated bouncing dots (CSS animation)

Input bar (fixed at bottom of panel, padding 16px, border-top):
- Input: placeholder "Analyze anything", flex-1, rounded-lg,
  border, padding 10px 14px, font-size 14px
- Send button: black background, white text, rounded-lg,
  padding 10px 20px
- On Enter key → send
- Disable input + button while loading

On receiving response:
- Add assistant message with answer text + sql
- If highlightNodes array is non-empty → call onHighlight(ids)
- Scroll to bottom of messages

Keep last 10 messages in history state.
Send history as [{ role: 'user'|'assistant', text: string }] 
to POST /query.

### api.ts
```typescript
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function fetchGraph() {
  const res = await fetch(`${BASE}/graph`)
  return res.json()
}

export async function fetchNode(id: string) {
  const res = await fetch(`${BASE}/graph/node/${encodeURIComponent(id)}`)
  return res.json()
}

export async function sendQuery(
  message: string, 
  history: { role: string; text: string }[]
) {
  const res = await fetch(`${BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  })
  return res.json()
}
```

---

## ENV FILES

backend/.env:
GEMINI_API_KEY=your_gemini_key_here
PORT=3001

frontend/.env:
VITE_API_URL=http://localhost:3001

---

## PACKAGE.JSON FILES

backend/package.json scripts:
"start": "node index.js"
"dev": "nodemon index.js"

backend dependencies:
express, better-sqlite3, cors, dotenv, 
@google/generative-ai, graphology

frontend/package.json scripts:
"dev": "vite"
"build": "vite build"
"preview": "vite preview"

frontend dependencies:
react, react-dom, typescript, vite, react-force-graph-2d,
tailwindcss, @vitejs/plugin-react, @types/react, @types/react-dom

---

## DEPLOYMENT FILES

Create backend/railway.toml:
[build]
builder = "nixpacks"
[deploy]
startCommand = "node index.js"

Create frontend/vercel.json:
{
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}

---

## README.md

Create a professional README with these sections:

# Graph-Based Order-to-Cash Query System

## Architecture
Explain the split: Node/Express backend, React frontend, 
SQLite for storage, graphology for in-memory graph, 
Gemini for NL→SQL translation.

## Database Choice: SQLite
- Zero infrastructure setup, single file database
- Synchronous API via better-sqlite3 — perfect for 
  read-heavy analytical queries
- Handles the full 17-table dataset efficiently
- No connection pooling complexity
- Easy to deploy on Railway with the repo

## Graph Model
Explain the 11 node types and 12 edge relationships.
Show the O2C flow: Customer → SalesOrder → DeliveryHeader 
→ BillingDoc → JournalEntry → Payment

## LLM Prompting Strategy
- Schema injection: full 17-table schema in every prompt
- JSON-only output enforcement: no markdown, structured response
- Status code translation: teach LLM what 'C', 'A', 'B' mean
- Retry mechanism: on SQL error, send error back for self-correction
- History: last 5 messages sent for conversational context
- Two-step: SQL generation → result summarization

## Guardrails
- Pre-LLM keyword filter blocks clearly off-topic queries
- LLM-level instruction: return {"error":"out_of_scope"}
- Both layers required: keyword filter saves API calls,
  LLM layer catches edge cases

## How to Run Locally
1. Clone repo
2. Add dataset to backend/data/ (17 subfolders of .jsonl files)
3. cd backend && npm install && node index.js
4. cd frontend && npm install && npm run dev
5. Open http://localhost:5173

## Deployment
- Backend: Railway (auto-detects Node, set GEMINI_API_KEY)
- Frontend: Vercel (set VITE_API_URL to Railway URL)

---

## EXECUTION ORDER

1. Create full folder structure
2. Create all backend files (ingest, graph, query, 
   guardrails, index)
3. Run: cd backend && npm install
4. Create all frontend files (App, GraphView, NodePanel, 
   ChatPanel, api)
5. Run: cd frontend && npm install
6. Show me the exact commands to:
   - Start the backend locally
   - Start the frontend locally
   - Test the /health endpoint
   - Test POST /query with curl
7. Create README.md
8. Create deployment config files

After generating everything, confirm which files were created 
and show me the curl command to test the query endpoint.

---

**Cursor**

I’ll scaffold the full backend/frontend project now, then wire ingestion, graph building, LLM query flow, and UI components exactly to your spec before installing dependencies and verifying the setup commands. I’m starting by checking the current workspace structure.

I’ve created the project folders and I’m now writing all backend modules first (`ingest`, `graph`, `query`, `guardrails`, `index`, package/env/deploy), then I’ll scaffold the React app and install dependencies in both sides.

Backend graph and ingestion files are in place. Next I’m wiring the Gemini SQL engine and API routes, then I’ll scaffold the React client and run dependency installs.

I’m now finishing the React/Vite files (`App`, graph/chat/node panels, API helpers, Tailwind config, and entrypoint files), then I’ll run `npm install` in both backend and frontend.

Code scaffolding is complete end-to-end; I’m installing dependencies in both `backend` and `frontend` now and then I’ll run a quick validation (`/health` command examples and final command list).

Implemented the full stack scaffold and core logic you specified: backend ingestion/graph/query/guardrails/API, frontend graph + chat UI, env files, deployment configs, and README.

## What I created

### Backend
- `backend/index.js`
- `backend/ingest.js`
- `backend/graph.js`
- `backend/query.js`
- `backend/guardrails.js`
- `backend/package.json`
- `backend/.env`
- `backend/railway.toml`
- `backend/data/` (folder)

### Frontend
- `frontend/src/App.tsx`
- `frontend/src/GraphView.tsx`
- `frontend/src/ChatPanel.tsx`
- `frontend/src/NodePanel.tsx`
- `frontend/src/api.ts`
- `frontend/src/main.tsx`
- `frontend/src/index.css`
- `frontend/src/vite-env.d.ts`
- `frontend/index.html`
- `frontend/package.json`
- `frontend/.env`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `frontend/vercel.json`

### Root
- `README.md`

## Dependency install status
- Backend: `npm install` completed
- Frontend: `npm install` completed
- Frontend build check: passed (`npm run build`)
- Backend module load check: passed

## Exact commands to run locally

### 1) Start backend
```bash
cd /Users/dushyanths/Downloads/FDE/backend
node index.js
```

### 2) Start frontend
```bash
cd /Users/dushyanths/Downloads/FDE/frontend
npm run dev
```

### 3) Test `/health`
```bash
curl http://localhost:3001/health
```

### 4) Test `POST /query` with curl
```bash
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d '{"message":"Total revenue by customer","history":[]}'
```

## Final query-endpoint curl (as requested)
```bash
curl -X POST http://localhost:3001/query \
  -H "Content-Type: application/json" \
  -d '{"message":"Find sales orders delivered but never billed","history":[{"role":"user","text":"Show recent delivery performance"}]}'
```

If you want, I can now run the backend server and do a live `/health` + `/query` call once your dataset is placed in `backend/data/` and `GEMINI_API_KEY` is set.

---

**User**

My backend/data/ folders have different names than what ingest.js 
expects. Here are my ACTUAL folder names:

- billing_document_cancellations
- billing_document_headers
- billing_document_items
- business_partner_addresses
- business_partners
- customer_company_assignments
- customer_sales_area_assignments
- journal_entry_items_accounts_receivable
- outbound_delivery_headers
- outbound_delivery_items
- payments_accounts_receivable
- plants
- product_descriptions
- product_plants
- product_storage_locations
- products
- sales_order_headers
- sales_order_items
- sales_order_schedule_lines

Update ingest.js so the folder-to-table mapping uses these 
exact folder names. The ingest function should match folder 
names to tables using this mapping.

---

**Cursor**

Got it. I’ll update `backend/ingest.js` so `FOLDER_TABLE_MAP` matches your actual folder names exactly (including the renamed customer-company/sales-area and the split billing headers vs cancellations), then I’ll re-run the lints/load check to ensure ingestion still boots.

Mapping is updated; next I’ll quickly sanity-check that `FOLDER_TABLE_MAP` keys align with your provided folder list and that ingestion will still create/populate the 17 SQLite tables without crashing.

Updated `backend/ingest.js` so `FOLDER_TABLE_MAP` matches your actual folder names exactly.

New folder → table mapping in `ingest.js`:

- `billing_document_headers` → `billing_doc_headers`
- `billing_document_cancellations` → `billing_doc_headers`
- `billing_document_items` → `billing_doc_items`
- `business_partner_addresses` → `business_partner_addresses`
- `business_partners` → `business_partners`
- `customer_company_assignments` → `customer_companies`
- `customer_sales_area_assignments` → `customer_sales_arrangements`
- `journal_entry_items_accounts_receivable` → `journal_entry_items`
- `outbound_delivery_headers` → `delivery_headers`
- `outbound_delivery_items` → `delivery_items`
- `payments_accounts_receivable` → `payments`
- `plants` → `plants`
- `product_descriptions` → `product_descriptions`
- `product_plants` → `product_plants`
- `product_storage_locations` → `product_storage_locations`
- `products` → `products`
- `sales_order_headers` → `sales_order_headers`
- `sales_order_items` → `sales_order_items`
- `sales_order_schedule_lines` → `sales_order_schedule_lines`

Sanity check: `ingestAll` still loads without errors after the change.

---

**User**

cd backend
npm install groq-sdk
```

**3. Update `backend/.env`:**
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
PORT=3001
```

**4. Update `query.js` — paste this into Cursor:**
```
Replace the Gemini implementation in query.js with Groq.
Remove @google/generative-ai imports and replace with:

const Groq = require('groq-sdk');
const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY }) 
  : null;

Replace the askGemini function with:

async function askGroq(prompt) {
  if (!groq) throw new Error('Missing GROQ_API_KEY');
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1,
  });
  return completion.choices[0].message.content;
}

Replace all askGemini() calls with askGroq().
Keep everything else exactly the same.

---

**Cursor**

I’ll switch the LLM engine from Gemini to Groq: install `groq-sdk`, update `backend/.env` with `GROQ_API_KEY`, then patch `backend/query.js` to remove `@google/generative-ai` and use `groq.chat.completions.create` while keeping the rest of the query flow unchanged.

Groq SDK is installed. Next I’ll update `backend/.env` to use `GROQ_API_KEY` (and keep `PORT=3001`), then patch `backend/query.js` to remove Gemini code and replace it with Groq calls while preserving the existing SQL/JSON parsing flow.

Updated Groq integration as requested.

- Installed Groq SDK: `npm install groq-sdk` in `backend/`
- Updated `backend/.env` to:
  - `GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx`
  - `PORT=3001`
- Updated `backend/query.js`:
  - Removed `@google/generative-ai` usage
  - Added `const Groq = require('groq-sdk');` and instantiated `groq` from `process.env.GROQ_API_KEY`
  - Replaced the `askGemini` implementation with `askGroq` using `groq.chat.completions.create(...)`
  - Replaced all `askGemini(...)` calls with `askGroq(...)`
  - Kept the rest of the query flow (prompt building, JSON parsing, SQL execution, retry, summarization) unchanged

You’ll need to restart the backend process for the `.env` change to take effect.

---

**User**

Update the SYSTEM_PROMPT in query.js with these critical 
data-specific corrections based on the actual dataset:

Add this DATASET QUIRKS section to the system prompt:

CRITICAL DATASET FACTS - READ BEFORE GENERATING ANY SQL:

1. BILLING STATUS IS ALWAYS EMPTY
   overallOrdReltdBillgStatus = '' for ALL 100 sales orders.
   NEVER use this field to determine if an order is billed.
   Instead, check if a sales order appears in billing_doc_items
   via: billing_doc_headers JOIN billing_doc_items, then link
   to sales orders through delivery_items.referenceSdDocument
   (delivery_items.referenceSdDocument = sales order ID, 
   these are 6-digit numbers like 740506)

2. billing_doc_items.referenceSdDocument IS NOT A SALES ORDER ID
   It contains billing reference IDs in 8-digit format (80738xxx).
   Do NOT join billing_doc_items.referenceSdDocument to 
   sales_order_headers.salesOrder - they will never match.
   To link billing to sales orders, use delivery_items as the bridge:
   delivery_items.referenceSdDocument = sales_order_headers.salesOrder

3. 65.8% OF BILLING DOCS ARE CANCELLED
   billing_doc_headers has 243 total rows but 160 are cancelled.
   ALWAYS filter with WHERE billingDocumentIsCancelled = 0
   for any revenue or active billing queries.

4. JOURNAL ENTRIES HAVE NEGATIVE AMOUNTS (REVERSALS)
   56 out of 123 journal entries have negative 
   amountInTransactionCurrency. These are reversal entries.
   For total revenue queries, use SUM and be aware negatives 
   will reduce totals. For payment status, only 120 of 123 
   journal entries have a clearingAccountingDocument.

5. DELIVERED BUT NOT BILLED - CORRECT QUERY
   overallDeliveryStatus = 'C' means delivered (86 orders)
   overallDeliveryStatus = 'A' means not started (14 orders)
   overallGoodsMovementStatus = 'A' for 83 deliveries (not moved)
   overallGoodsMovementStatus = 'C' for only 3 deliveries (moved)
   Use sales_order_headers status fields for delivery/billing checks.

6. REJECTED SALES ORDER ITEMS EXIST
   30 out of 167 sales_order_items have 
   salesDocumentRjcnReason = '61' (rejection reason code).
   For active order queries add: 
   WHERE salesDocumentRjcnReason = '' OR 
   salesDocumentRjcnReason IS NULL

7. PAYMENTS HAVE NO invoiceReference OR salesDocument
   All 120 payment records have null invoiceReference and 
   null salesDocument fields. The ONLY way to link payments 
   is through clearingAccountingDocument:
   payments.clearingAccountingDocument = 
   journal_entry_items.clearingAccountingDocument
   Only 76 out of 120 payments link to journal entries this way.

8. SCHEDULE LINES - 12 WITH ZERO CONFIRMED QUANTITY
   12 out of 179 schedule lines have 
   confdOrderQtyByMatlAvailCheck = 0. These are unconfirmed 
   lines. For available stock queries filter these out.

9. ONLY 4 UNIQUE CUSTOMERS HAVE BILLING DOCUMENTS
   soldToParty values in billing: 320000083, 320000082, 
   320000085, 320000088 only. Sales orders have 8 unique 
   customers. 4 customers (310000108, 310000109, 320000107, 
   320000108) have sales orders but NO billing documents at all.

10. CORRECT FULL FLOW TRACE QUERY
    Sales Order → Delivery → Billing → Journal → Payment
    JOIN path:
    sales_order_headers 
    → delivery_items ON delivery_items.referenceSdDocument = salesOrder
    → delivery_headers ON deliveryDocument
    → billing_doc_headers ON soldToParty (same customer)
    → journal_entry_items ON accountingDocument  
    → payments ON clearingAccountingDocument
    NOTE: 40 billing docs have NO journal entry at all.

---

**Cursor**

I’ll update `backend/query.js` by inserting your “CRITICAL DATASET FACTS - READ BEFORE GENERATING ANY SQL” section into the `SYSTEM_PROMPT` template (right after the schema/join notes and before the strict JSON rules). Then I’ll re-run lints for the edited file to ensure nothing broke.

The patch failed because the exact prompt text around the insertion point didn’t match my expected context (likely whitespace/line breaks). I’ll re-locate the precise section in `backend/query.js` and re-apply the insertion with the exact surrounding text.

SYSTEM_PROMPT now includes your dataset quirks block. Next I’ll verify that the prompt text appears in `query.js` exactly once and that the rest of the Groq SQL/JSON flow still runs by requiring the module again.

Updated `backend/query.js` by inserting your provided **“CRITICAL DATASET FACTS - READ BEFORE GENERATING ANY SQL”** section directly into the `SYSTEM_PROMPT` (immediately after the existing `billingDocumentIsCancelled` line and before `STRICT RULES`).

I also re-checked `query.js` for lints/errors and confirmed the module still loads successfully after the edit.

---

**User**

I have a React + TypeScript + Vite frontend for a Graph-Based 
Order-to-Cash system. The backend is fully working at 
http://localhost:3001. Fix and rebuild the entire frontend to 
match the reference design exactly.

## CURRENT ISSUES TO FIX
1. "Minimize" button does nothing — it should collapse/expand 
   the graph panel
2. "Hide Granular Overlay" does nothing — it should toggle 
   node type labels on/off in the graph
3. Chat panel has no working query interface
4. NodePanel needs proper styling

## COMPLETE App.tsx — REWRITE THIS FILE
```tsx
import { useState, useEffect, useCallback } from 'react'
import GraphView from './GraphView'
import ChatPanel from './ChatPanel'
import NodePanel from './NodePanel'
import { fetchGraph } from './api'

export default function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [highlightNodes, setHighlightNodes] = useState<string[]>([])
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showLabels, setShowLabels] = useState(true)

  useEffect(() => {
    fetchGraph().then(data => {
      const links = (data.edges || []).map((e: any) => ({
        source: e.source,
        target: e.target,
        relation: e.relation
      }))
      setGraphData({ nodes: data.nodes || [], links })
    })
  }, [])

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', 
      height: '100vh', background: '#fff', fontFamily: 
      '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ height: 48, borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', padding: '0 16px',
        flexShrink: 0, gap: 6 }}>
        <span style={{ color: '#9ca3af', fontSize: 14 }}>Mapping /</span>
        <span style={{ color: '#111', fontSize: 14, fontWeight: 600 }}>
          Order to Cash
        </span>
      </div>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT — GRAPH PANEL */}
        <div style={{ 
          width: isMinimized ? 0 : '65%', 
          minWidth: isMinimized ? 0 : undefined,
          position: 'relative', 
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          borderRight: '1px solid #e5e7eb'
        }}>
          {!isMinimized && (
            <>
              <GraphView
                data={graphData}
                highlightNodes={highlightNodes}
                onNodeClick={handleNodeClick}
                showLabels={showLabels}
              />

              {/* CONTROL BUTTONS */}
              <div style={{ position: 'absolute', top: 12, left: 12,
                display: 'flex', gap: 8, zIndex: 10 }}>
                <button
                  onClick={() => setIsMinimized(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#fff', border: '1px solid #e5e7eb',
                    borderRadius: 8, padding: '6px 12px',
                    fontSize: 12, cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    fontWeight: 500
                  }}>
                  <span>⤢</span> Minimize
                </button>
                <button
                  onClick={() => setShowLabels(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: showLabels ? '#111' : '#fff',
                    color: showLabels ? '#fff' : '#111',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8, padding: '6px 12px',
                    fontSize: 12, cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    fontWeight: 500
                  }}>
                  <span>⊞</span> {showLabels ? 'Hide' : 'Show'} Granular Overlay
                </button>
              </div>

              {selectedNode && (
                <NodePanel 
                  node={selectedNode} 
                  onClose={() => setSelectedNode(null)} 
                />
              )}
            </>
          )}

          {isMinimized && (
            <button
              onClick={() => setIsMinimized(false)}
              style={{
                position: 'absolute', top: 12, left: 12,
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 8, padding: '6px 12px',
                fontSize: 12, cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
              }}>
              ⤢ Expand
            </button>
          )}
        </div>

        {/* RIGHT — CHAT PANEL */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <ChatPanel onHighlight={setHighlightNodes} />
        </div>
      </div>
    </div>
  )
}
```

## COMPLETE GraphView.tsx — REWRITE THIS FILE
```tsx
import { useRef, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

interface Props {
  data: { nodes: any[]; links: any[] }
  highlightNodes: string[]
  onNodeClick: (node: any) => void
  showLabels: boolean
}

export default function GraphView({ data, highlightNodes, 
  onNodeClick, showLabels }: Props) {
  const fgRef = useRef<any>()

  const nodeCanvasObject = useCallback((node: any, ctx: 
    CanvasRenderingContext2D, globalScale: number) => {
    const isHighlighted = highlightNodes.includes(node.id)
    const radius = isHighlighted ? 9 : 5

    // Draw circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = isHighlighted ? '#FF3B30' : (node.color || '#888')
    ctx.fill()

    // Draw label if showLabels
    if (showLabels) {
      const label = node.type || node.id
      const fontSize = Math.max(8 / globalScale, 2)
      ctx.font = `${fontSize}px Sans-Serif`
      ctx.fillStyle = '#888888'
      ctx.textAlign = 'center'
      ctx.fillText(label, node.x, node.y + radius + fontSize + 1)
    }
  }, [highlightNodes, showLabels])

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={data}
      nodeCanvasObject={nodeCanvasObject}
      nodeCanvasObjectMode={() => 'replace'}
      linkColor={() => '#B5D4F4'}
      linkWidth={0.5}
      backgroundColor='#f8f8f8'
      onNodeClick={onNodeClick}
      nodeLabel={(node: any) => `${node.type}: ${node.id}`}
      width={undefined}
      height={undefined}
    />
  )
}
```

## COMPLETE ChatPanel.tsx — REWRITE THIS FILE
```tsx
import { useState, useRef, useEffect } from 'react'
import { sendQuery } from './api'

interface Message {
  role: 'user' | 'assistant'
  text: string
  sql?: string
}

interface Props {
  onHighlight: (ids: string[]) => void
}

export default function ChatPanel({ onHighlight }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      text: 'Hi! I can help you analyze the **Order to Cash** process.' 
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Build history (last 10 messages, excluding the one we just added)
    const history = messages.slice(-10).map(m => ({ 
      role: m.role, 
      text: m.text 
    }))

    try {
      const res = await sendQuery(text, history)
      const assistantMsg: Message = {
        role: 'assistant',
        text: res.answer || 'No response received.',
        sql: res.sql
      }
      setMessages(prev => [...prev, assistantMsg])
      if (res.highlightNodes?.length) {
        onHighlight(res.highlightNodes)
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const renderText = (text: string) => {
    // Bold **text** support
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', 
      height: '100%' }}>
      
      {/* Chat Header */}
      <div style={{ padding: '12px 16px', borderBottom: 
        '1px solid #e5e7eb', flexShrink: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>
          Chat with Graph
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
          Order to Cash
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16,
        display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            gap: 10
          }}>
            {/* Avatar */}
            {msg.role === 'assistant' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#111', color: '#fff',
                display: 'flex', alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 13, fontWeight: 700, flexShrink: 0
              }}>D</div>
            )}
            {msg.role === 'user' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#e5e7eb',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" 
                  fill="#666">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 
                    12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 
                    0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8
                    -9.6-4.8z"/>
                </svg>
              </div>
            )}

            <div style={{ maxWidth: '85%' }}>
              {/* Bubble */}
              <div style={{
                background: msg.role === 'user' ? '#111' : '#f0f0f0',
                color: msg.role === 'user' ? '#fff' : '#111',
                borderRadius: msg.role === 'user' 
                  ? '12px 12px 2px 12px' 
                  : '12px 12px 12px 2px',
                padding: '10px 14px',
                fontSize: 14,
                lineHeight: 1.5
              }}>
                {renderText(msg.text)}
              </div>

              {/* SQL Viewer */}
              {msg.sql && (
                <details style={{ fontSize: 11, marginTop: 4 }}>
                  <summary style={{ cursor: 'pointer', color: '#888',
                    userSelect: 'none' }}>
                    View SQL
                  </summary>
                  <pre style={{
                    fontSize: 10, overflowX: 'auto',
                    background: '#f8f8f8', padding: '8px',
                    borderRadius: 6, marginTop: 4,
                    border: '1px solid #e5e7eb',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-all'
                  }}>{msg.sql}</pre>
                </details>
              )}
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', 
            gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#111', color: '#fff',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13, fontWeight: 700
            }}>D</div>
            <div style={{
              background: '#f0f0f0', borderRadius: '12px 12px 12px 2px',
              padding: '14px 18px', display: 'flex', gap: 4
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#999',
                  animation: 'bounce 1.2s infinite',
                  animationDelay: `${i * 0.2}s`
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Status bar */}
      <div style={{ padding: '6px 16px', borderTop: '1px solid #f0f0f0',
        fontSize: 12, color: '#22c55e', display: 'flex',
        alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%',
          background: '#22c55e' }} />
        Dodge AI is awaiting instructions
      </div>

      {/* Input bar */}
      <div style={{ padding: '12px 16px', borderTop: 
        '1px solid #e5e7eb', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          placeholder="Analyze anything"
          style={{
            flex: 1, borderRadius: 8, border: '1px solid #e5e7eb',
            padding: '10px 14px', fontSize: 14, outline: 'none',
            background: loading ? '#f9fafb' : '#fff',
            color: '#111'
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#9ca3af' : '#111',
            color: '#fff', borderRadius: 8, border: 'none',
            padding: '10px 20px', fontSize: 14, cursor: 
              loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 500, transition: 'background 0.2s'
          }}>
          Send
        </button>
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
```

## COMPLETE NodePanel.tsx — REWRITE THIS FILE
```tsx
interface Props {
  node: any
  onClose: () => void
}

const SKIP_FIELDS = new Set(['x', 'y', 'vx', 'vy', 'index', 
  'color', 'type', '__indexColor', 'fx', 'fy'])

export default function NodePanel({ node, onClose }: Props) {
  const entries = Object.entries(node)
    .filter(([k]) => !SKIP_FIELDS.has(k))
  const visible = entries.slice(0, 8)
  const hasMore = entries.length > 8

  return (
    <div style={{
      position: 'absolute', top: 60, left: 20,
      zIndex: 1000, width: 300,
      background: '#fff', borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      padding: 20, border: '1px solid #f0f0f0'
    }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: 'none', border: 'none',
          cursor: 'pointer', color: '#9ca3af',
          fontSize: 14, lineHeight: 1, padding: 4
        }}>✕</button>

      {/* Header */}
      <div style={{ fontWeight: 700, fontSize: 16, 
        color: '#111', marginBottom: 2 }}>
        {node.type}
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', 
        fontStyle: 'italic', marginBottom: 12 }}>
        Entity: {node.type}
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb',
        margin: '0 0 12px 0' }} />

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', 
        gap: 6 }}>
        {visible.map(([k, v]) => (
          <div key={k} style={{ fontSize: 12 }}>
            <span style={{ color: '#9ca3af' }}>{k}: </span>
            <span style={{ color: '#111' }}>
              {String(v ?? '')}
            </span>
          </div>
        ))}
        {hasMore && (
          <div style={{ fontSize: 12, color: '#9ca3af',
            fontStyle: 'italic', marginTop: 4 }}>
            Additional fields hidden for readability
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb',
        margin: '12px 0' }} />
      <div style={{ fontSize: 12, color: '#111' }}>
        <strong>Connections:</strong> {node.__connections || 0}
      </div>
    </div>
  )
}
```

## IMPORTANT NOTES FOR CURSOR

1. The backend at http://localhost:3001 returns edges as 
   `{ source, target, relation }` — map these to `links` 
   for react-force-graph-2d in App.tsx (already done above)

2. The `showLabels` prop is passed to GraphView and controls 
   whether node type text is drawn below each node

3. Minimize button sets `isMinimized: true` which collapses 
   the graph to width 0 and shows only the chat panel at full width

4. The "Hide Granular Overlay" button toggles `showLabels` 
   state — when labels are hidden the button turns white, 
   when showing it turns black

5. Make sure ForceGraph2D fills its container — wrap it in a 
   div with `width: 100%; height: 100%` and pass those 
   dimensions as props or use `useRef` to measure

6. Do NOT change any backend files

7. Install any missing packages:
   npm install react-force-graph-2d

---

**Cursor**

I’ll now rewrite the frontend files to exactly match the reference design you pasted: `App.tsx`, `GraphView.tsx`, `ChatPanel.tsx`, and `NodePanel.tsx`. After the edits, I’ll run a full `frontend` TypeScript/Vite build to ensure everything compiles.

Next I’ll replace `GraphView.tsx`, `ChatPanel.tsx`, and `NodePanel.tsx` with the reference code you provided so the minimize/label toggles and chat query interface behave correctly. After that, I’ll run `npm run build` for the frontend to confirm TypeScript passes.

All four UI components have been rewritten. Next I’ll run `npm run build` in `frontend/` to catch any TypeScript issues (e.g., the `React.KeyboardEvent` typing) and ensure the new UI compiles cleanly.

Front-end fixed to match the reference design exactly by rewriting these files:

- `frontend/src/App.tsx`
  - `Minimize` now collapses/expands the graph panel (`isMinimized` state)
  - `Hide/Show Granular Overlay` now toggles node type labels (`showLabels` state)
- `frontend/src/GraphView.tsx`
  - Only renders the graph (no internal non-working buttons)
  - Respects `showLabels` to show/hide type labels under each node
- `frontend/src/ChatPanel.tsx`
  - Chat UI is now fully functional and calls `POST /query` via `sendQuery(...)`
  - Includes message history (last 10) and shows `View SQL` when `sql` exists in the response
- `frontend/src/NodePanel.tsx`
  - Updated to the reference styling/structure (close button, header, field list, connections area)

Verification: `frontend` builds successfully (`npm run build` passed).

To run it locally:
```bash
cd /Users/dushyanths/Downloads/FDE/frontend
npm run dev
```

---

**User**

Update the SYSTEM_PROMPT constant in backend/query.js. 
Fix all incorrect hardcoded facts and add missing edge cases 
based on the actual SQLite data. Here are the exact corrections:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACT CORRECTIONS (replace the numbered facts section)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. BILLING STATUS IS ALWAYS NULL (not empty string)
   overallOrdReltdBillgStatus is NULL for ALL 100 sales orders 
   (not '' empty string — it is SQL NULL).
   NEVER use this field to determine billing status.
   Always check billing_doc_items linkage instead.

2. billing_doc_items.referenceSdDocument IS NOT A SALES ORDER ID
   It contains 8-digit billing reference IDs (e.g. 80738xxx).
   NEVER join billing_doc_items.referenceSdDocument to 
   sales_order_headers.salesOrder — zero rows will match.
   To link billing → sales orders, bridge through delivery_items:
   delivery_items.referenceSdDocument = sales_order_headers.salesOrder
   (this join works: all 137 delivery items match a sales order)

3. BILLING DOCUMENT COUNTS — CORRECTED
   billing_doc_headers has 163 total rows.
   80 are cancelled (49.1%), 83 are active (50.9%).
   ALWAYS filter: WHERE billingDocumentIsCancelled = 0
   Previous claim of "243 total, 160 cancelled, 65.8%" was WRONG.

4. JOURNAL ENTRIES HAVE NEGATIVE AMOUNTS (REVERSALS)
   56 out of 123 journal entries have negative 
   amountInTransactionCurrency. These are reversal entries.
   120 out of 123 journal entries have a clearingAccountingDocument.
   3 journal entries have NO clearingAccountingDocument at all —
   these can never be linked to payments.

5. DELIVERY STATUS — CONFIRMED CORRECT
   overallDeliveryStatus = 'C' → 86 sales orders (delivered)
   overallDeliveryStatus = 'A' → 14 sales orders (not started)
   overallGoodsMovementStatus = 'A' → 83 delivery headers (not moved)
   overallGoodsMovementStatus = 'C' → 3 delivery headers (moved)
   14 sales orders have NO delivery items at all.

6. REJECTED SALES ORDER ITEMS — CONFIRMED CORRECT
   30 out of 167 sales_order_items have salesDocumentRjcnReason='61'.
   For active order queries always add:
   WHERE (salesDocumentRjcnReason = '' OR salesDocumentRjcnReason IS NULL)

7. PAYMENTS LINKAGE — CORRECTED
   All 120 payments have NULL invoiceReference and NULL salesDocument.
   ALL 120 payments have a clearingAccountingDocument value.
   ALL 120 payments successfully link to journal_entry_items via:
   payments.clearingAccountingDocument = journal_entry_items.clearingAccountingDocument
   Previous claim of "only 76 out of 120 link" was WRONG.
   However, 3 journal entries have no clearingAccountingDocument 
   and therefore can never be reached from payments.

8. SCHEDULE LINES WITH ZERO CONFIRMED QUANTITY — CONFIRMED CORRECT
   12 out of 179 schedule lines have confdOrderQtyByMatlAvailCheck = 0.
   These are spread across 9 distinct sales orders.
   Some orders have multiple zero-qty lines (740533 has 2, 740542 has 3).

9. CUSTOMERS WITH/WITHOUT BILLING — CONFIRMED CORRECT
   Only 4 customers have active billing docs:
   320000083, 320000082, 320000085, 320000088
   4 customers have sales orders but ZERO billing docs:
   310000108, 310000109, 320000107, 320000108
   These 4 customers' O2C flow is permanently stuck at delivery.

10. ACTIVE BILLING DOCS WITH NO JOURNAL ENTRY
    24 out of 83 active billing docs have no matching journal entry
    (their accountingDocument does not appear in journal_entry_items).
    For payment tracing, always LEFT JOIN and handle NULLs gracefully.
    Do NOT assume every billing doc has a journal entry.

11. BILLING CANCELLATION CHAINS EXIST
    Some billing_doc_headers rows have a non-null cancelledBillingDocument
    field pointing to the original document they cancelled.
    When counting replacements/re-bills, filter:
    WHERE billingDocumentIsCancelled = 0
    to avoid double-counting cancelled + replacement pairs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SQL QUERY PATTERN FIXES (update EXAMPLE QUERIES section)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace the "Find sales orders delivered but never billed" example with:

Q: "Find sales orders delivered but never billed"
A: {"sql": "SELECT DISTINCT di.referenceSdDocument as salesOrder, sh.totalNetAmount, sh.creationDate, sh.overallDeliveryStatus FROM delivery_items di JOIN sales_order_headers sh ON di.referenceSdDocument = sh.salesOrder WHERE di.referenceSdDocument NOT IN (SELECT DISTINCT di2.referenceSdDocument FROM delivery_items di2 JOIN billing_doc_items bi ON di2.deliveryDocument = bi.billingDocument WHERE bi.billingDocument IS NOT NULL) LIMIT 50", "explanation": "Sales orders with delivery items but no billing document, bridged correctly through delivery_items"}

Replace the "Total revenue by customer" example with:

Q: "Total revenue by customer"  
A: {"sql": "SELECT bp.businessPartnerFullName, bp.organizationBpName1, COUNT(DISTINCT bh.billingDocument) as invoice_count, SUM(bh.totalNetAmount) as total_revenue, bh.transactionCurrency FROM billing_doc_headers bh JOIN business_partners bp ON bh.soldToParty = bp.businessPartner WHERE bh.billingDocumentIsCancelled = 0 GROUP BY bh.soldToParty ORDER BY total_revenue DESC LIMIT 20", "explanation": "Revenue by customer using only active (non-cancelled) billing documents"}

Add this new example for full O2C trace:

Q: "Trace complete order to cash flow for sales order [ID]"
A: {"sql": "SELECT sh.salesOrder, sh.totalNetAmount, sh.overallDeliveryStatus, di.deliveryDocument, di.actualDeliveryQuantity, dh.overallGoodsMovementStatus, dh.actualGoodsMovementDate, bh.billingDocument, bh.billingDocumentIsCancelled, bh.totalNetAmount as billedAmount, ji.accountingDocument, ji.amountInTransactionCurrency, ji.postingDate, ji.clearingAccountingDocument, p.clearingDate, p.amountInTransactionCurrency as paymentAmount FROM sales_order_headers sh LEFT JOIN delivery_items di ON sh.salesOrder = di.referenceSdDocument LEFT JOIN delivery_headers dh ON di.deliveryDocument = dh.deliveryDocument LEFT JOIN billing_doc_headers bh ON sh.soldToParty = bh.soldToParty AND bh.billingDocumentIsCancelled = 0 LEFT JOIN journal_entry_items ji ON bh.accountingDocument = ji.accountingDocument LEFT JOIN payments p ON ji.clearingAccountingDocument = p.clearingAccountingDocument WHERE sh.salesOrder = '[ID]' LIMIT 50", "explanation": "Full O2C trace: note billing linked via soldToParty since billing_doc_items.referenceSdDocument does not contain sales order IDs"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT RULES — ADD THESE TO THE RULES SECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add these rules to the STRICT RULES block:

- NEVER join billing_doc_items.referenceSdDocument to sales_order_headers.salesOrder — it will always return 0 rows
- NEVER filter overallOrdReltdBillgStatus = '' — it is NULL for all rows, use IS NULL or avoid entirely  
- ALWAYS use LEFT JOIN when tracing O2C flow since 24 active billing docs have no journal entry
- ALWAYS filter billingDocumentIsCancelled = 0 for any revenue, billing count, or flow queries
- When counting payments linked to journal entries, the join works for all 120 payments — do not state otherwise
- When a sales order trace returns null billing/journal/payment, explicitly state the flow is broken at that stage rather than saying data is consistent

---

**Cursor**

I’ll surgically update only `SYSTEM_PROMPT` in `backend/query.js`: replace the numbered dataset-facts block, update the two specified example queries, add the new full O2C trace example, and append your extra strict rules. Then I’ll run a quick lint/load check.

Updated `SYSTEM_PROMPT` in `backend/query.js` with your exact data corrections and rule changes.

### What I changed

- Replaced the entire numbered **CRITICAL DATASET FACTS** block with your corrected 1–11 facts:
  - NULL vs empty-string billing status
  - corrected billing doc counts (163 total, 80 cancelled, 83 active)
  - corrected payment linkage (all 120 linkable)
  - added active billing docs without journal entry
  - added cancellation chain caveat
  - and all other listed corrections

- Updated **STRICT RULES** with your additional mandatory constraints:
  - never join `billing_doc_items.referenceSdDocument` to `sales_order_headers.salesOrder`
  - never filter `overallOrdReltdBillgStatus = ''`
  - always use `LEFT JOIN` for traces
  - always filter `billingDocumentIsCancelled = 0` for revenue/billing/flow
  - enforce correct payments-link count behavior
  - explicitly describe broken flow stage when nulls appear

- Updated **EXAMPLE QUERIES**:
  - replaced “delivered but never billed” SQL with your bridged pattern
  - replaced “total revenue by customer” explanation text with your corrected wording
  - added new full trace example:  
    “Trace complete order to cash flow for sales order [ID]”

### Validation

- `backend/query.js` has no lint errors.
- Module loads successfully (`require('./backend/query')` passes).

