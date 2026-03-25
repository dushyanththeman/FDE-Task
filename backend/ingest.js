const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "o2c.sqlite");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const TABLE_SCHEMAS = [
  `CREATE TABLE IF NOT EXISTS billing_doc_headers (
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
  );`,
  `CREATE TABLE IF NOT EXISTS billing_doc_items (
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
  );`,
  `CREATE TABLE IF NOT EXISTS business_partners (
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
  );`,
  `CREATE TABLE IF NOT EXISTS business_partner_addresses (
    businessPartner TEXT,
    addressId TEXT,
    cityName TEXT,
    country TEXT,
    postalCode TEXT,
    region TEXT,
    streetName TEXT,
    transportZone TEXT,
    PRIMARY KEY (businessPartner, addressId)
  );`,
  `CREATE TABLE IF NOT EXISTS customer_companies (
    customer TEXT PRIMARY KEY,
    companyCode TEXT,
    paymentTerms TEXT,
    reconciliationAccount TEXT,
    deletionIndicator INTEGER DEFAULT 0,
    customerAccountGroup TEXT,
    paymentBlockingReason TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS customer_sales_arrangements (
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
  );`,
  `CREATE TABLE IF NOT EXISTS journal_entry_items (
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
  );`,
  `CREATE TABLE IF NOT EXISTS delivery_headers (
    deliveryDocument TEXT PRIMARY KEY,
    creationDate TEXT,
    actualGoodsMovementDate TEXT,
    deliveryBlockReason TEXT,
    headerBillingBlockReason TEXT,
    overallGoodsMovementStatus TEXT,
    overallPickingStatus TEXT,
    overallProofOfDeliveryStatus TEXT,
    shippingPoint TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS delivery_items (
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
  );`,
  `CREATE TABLE IF NOT EXISTS payments (
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
  );`,
  `CREATE TABLE IF NOT EXISTS plants (
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
  );`,
  `CREATE TABLE IF NOT EXISTS product_descriptions (
    product TEXT PRIMARY KEY,
    productDescription TEXT,
    language TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS product_plants (
    product TEXT,
    plant TEXT,
    countryOfOrigin TEXT,
    regionOfOrigin TEXT,
    profitCenter TEXT,
    mrpType TEXT,
    availabilityCheckType TEXT,
    PRIMARY KEY (product, plant)
  );`,
  `CREATE TABLE IF NOT EXISTS product_storage_locations (
    product TEXT,
    plant TEXT,
    storageLocation TEXT,
    physicalInventoryBlockInd TEXT,
    dateOfLastPostedCntUnRstrcdStk TEXT,
    PRIMARY KEY (product, plant, storageLocation)
  );`,
  `CREATE TABLE IF NOT EXISTS products (
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
  );`,
  `CREATE TABLE IF NOT EXISTS sales_order_headers (
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
  );`,
  `CREATE TABLE IF NOT EXISTS sales_order_items (
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
  );`,
  `CREATE TABLE IF NOT EXISTS sales_order_schedule_lines (
    salesOrder TEXT,
    salesOrderItem TEXT,
    scheduleLine TEXT,
    confirmedDeliveryDate TEXT,
    orderQuantityUnit TEXT,
    confdOrderQtyByMatlAvailCheck REAL,
    PRIMARY KEY (salesOrder, salesOrderItem, scheduleLine)
  );`
];

const FOLDER_TABLE_MAP = {
  // Split in your dataset: headers + cancellations
  billing_document_headers: "billing_doc_headers",
  billing_document_cancellations: "billing_doc_headers",
  billing_document_items: "billing_doc_items",
  business_partner_addresses: "business_partner_addresses",
  business_partners: "business_partners",
  customer_company_assignments: "customer_companies",
  customer_sales_area_assignments: "customer_sales_arrangements",
  journal_entry_items_accounts_receivable: "journal_entry_items",
  outbound_delivery_headers: "delivery_headers",
  outbound_delivery_items: "delivery_items",
  payments_accounts_receivable: "payments",
  plants: "plants",
  product_descriptions: "product_descriptions",
  product_plants: "product_plants",
  product_storage_locations: "product_storage_locations",
  products: "products",
  sales_order_headers: "sales_order_headers",
  sales_order_items: "sales_order_items",
  sales_order_schedule_lines: "sales_order_schedule_lines"
};

const TABLE_COLUMNS = {
  billing_doc_headers: ["billingDocument", "billingDocumentType", "creationDate", "billingDocumentDate", "billingDocumentIsCancelled", "cancelledBillingDocument", "totalNetAmount", "transactionCurrency", "companyCode", "fiscalYear", "accountingDocument", "soldToParty"],
  billing_doc_items: ["billingDocument", "billingDocumentItem", "material", "billingQuantity", "billingQuantityUnit", "netAmount", "transactionCurrency", "referenceSdDocument", "referenceSdDocumentItem"],
  business_partner_addresses: ["businessPartner", "addressId", "cityName", "country", "postalCode", "region", "streetName", "transportZone"],
  business_partners: ["businessPartner", "customer", "businessPartnerCategory", "businessPartnerFullName", "businessPartnerName", "organizationBpName1", "organizationBpName2", "firstName", "lastName", "industry", "creationDate", "businessPartnerIsBlocked", "isMarkedForArchiving"],
  customer_companies: ["customer", "companyCode", "paymentTerms", "reconciliationAccount", "deletionIndicator", "customerAccountGroup", "paymentBlockingReason"],
  customer_sales_arrangements: ["customer", "salesOrganization", "distributionChannel", "division", "currency", "customerPaymentTerms", "deliveryPriority", "supplyingPlant", "salesDistrict", "shippingCondition", "creditControlArea", "billingIsBlockedForCustomer"],
  journal_entry_items: ["accountingDocument", "accountingDocumentItem", "companyCode", "fiscalYear", "glAccount", "referenceDocument", "costCenter", "profitCenter", "transactionCurrency", "amountInTransactionCurrency", "companyCodeCurrency", "amountInCompanyCodeCurrency", "postingDate", "documentDate", "accountingDocumentType", "assignmentReference", "customer", "financialAccountType", "clearingDate", "clearingAccountingDocument", "clearingDocFiscalYear"],
  delivery_headers: ["deliveryDocument", "creationDate", "actualGoodsMovementDate", "deliveryBlockReason", "headerBillingBlockReason", "overallGoodsMovementStatus", "overallPickingStatus", "overallProofOfDeliveryStatus", "shippingPoint"],
  delivery_items: ["deliveryDocument", "deliveryDocumentItem", "actualDeliveryQuantity", "deliveryQuantityUnit", "batch", "plant", "referenceSdDocument", "referenceSdDocumentItem", "storageLocation", "itemBillingBlockReason"],
  payments: ["accountingDocument", "accountingDocumentItem", "companyCode", "fiscalYear", "clearingDate", "clearingAccountingDocument", "clearingDocFiscalYear", "amountInTransactionCurrency", "transactionCurrency", "amountInCompanyCodeCurrency", "companyCodeCurrency", "customer", "invoiceReference", "invoiceReferenceFiscalYear", "salesDocument", "salesDocumentItem", "postingDate", "documentDate", "glAccount", "financialAccountType", "profitCenter", "costCenter"],
  plants: ["plant", "plantName", "valuationArea", "salesOrganization", "distributionChannel", "division", "plantCategory", "addressId", "factoryCalendar", "isMarkedForArchiving"],
  product_descriptions: ["product", "productDescription", "language"],
  product_plants: ["product", "plant", "countryOfOrigin", "regionOfOrigin", "profitCenter", "mrpType", "availabilityCheckType"],
  product_storage_locations: ["product", "plant", "storageLocation", "physicalInventoryBlockInd", "dateOfLastPostedCntUnRstrcdStk"],
  products: ["product", "productType", "crossPlantStatus", "creationDate", "isMarkedForDeletion", "grossWeight", "weightUnit", "netWeight", "productGroup", "baseUnit", "division", "industrySector"],
  sales_order_headers: ["salesOrder", "salesOrderType", "salesOrganization", "distributionChannel", "soldToParty", "creationDate", "totalNetAmount", "transactionCurrency", "overallDeliveryStatus", "overallOrdReltdBillgStatus", "requestedDeliveryDate", "headerBillingBlockReason", "deliveryBlockReason", "incotermsClassification", "customerPaymentTerms"],
  sales_order_items: ["salesOrder", "salesOrderItem", "material", "requestedQuantity", "requestedQuantityUnit", "netAmount", "transactionCurrency", "materialGroup", "productionPlant", "storageLocation", "itemBillingBlockReason", "salesDocumentRjcnReason"],
  sales_order_schedule_lines: ["salesOrder", "salesOrderItem", "scheduleLine", "confirmedDeliveryDate", "orderQuantityUnit", "confdOrderQtyByMatlAvailCheck"]
};

const INTEGER_COLUMNS = new Set([
  "billingDocumentIsCancelled",
  "businessPartnerIsBlocked",
  "isMarkedForArchiving",
  "deletionIndicator",
  "billingIsBlockedForCustomer",
  "isMarkedForDeletion"
]);

const rowCounts = {};

function normalizeValue(column, value) {
  if (value === undefined || value === null || value === "") return null;
  if (INTEGER_COLUMNS.has(column)) return Number(Boolean(Number(value) || value === true || value === "true"));
  return value;
}

function createTables() {
  for (const ddl of TABLE_SCHEMAS) {
    db.exec(ddl);
  }
}

function prepareInsert(table) {
  const columns = TABLE_COLUMNS[table];
  const colSql = columns.join(", ");
  const valSql = columns.map((c) => `@${c}`).join(", ");
  return db.prepare(`INSERT OR IGNORE INTO ${table} (${colSql}) VALUES (${valSql})`);
}

function ingestTable(folderPath, table) {
  const files = fs
    .readdirSync(folderPath)
    .filter((f) => f.endsWith(".jsonl"))
    .sort();
  const insert = prepareInsert(table);
  let inserted = 0;

  const tx = db.transaction(() => {
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        try {
          const row = JSON.parse(line);
          const mapped = {};
          for (const col of TABLE_COLUMNS[table]) {
            mapped[col] = normalizeValue(col, row[col]);
          }
          const info = insert.run(mapped);
          inserted += info.changes;
        } catch (error) {
          // Skip malformed rows to keep ingestion resilient.
        }
      }
    }
  });

  tx();
  rowCounts[table] = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
  console.log(`${table}: ${files.length} files found, ${inserted} rows inserted`);
}

function ingestAll() {
  createTables();
  const dataRoot = path.join(__dirname, "data");

  if (!fs.existsSync(dataRoot)) {
    console.warn("backend/data folder not found; created empty schema only.");
    return rowCounts;
  }

  const folders = fs
    .readdirSync(dataRoot)
    .filter((name) => fs.statSync(path.join(dataRoot, name)).isDirectory());

  for (const folder of folders) {
    const table = FOLDER_TABLE_MAP[folder];
    if (!table) continue;
    ingestTable(path.join(dataRoot, folder), table);
  }

  console.log("");
  Object.keys(TABLE_COLUMNS).forEach((table) => {
    const count = rowCounts[table] ?? 0;
    console.log(`✓ ${table}: ${count} rows`);
  });

  return rowCounts;
}

function getTableRowCounts() {
  const result = {};
  for (const table of Object.keys(TABLE_COLUMNS)) {
    const count = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
    result[table] = count;
  }
  return result;
}

module.exports = {
  db,
  ingestAll,
  getTableRowCounts
};
