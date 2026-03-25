const { MultiDirectedGraph } = require("graphology");
const { db } = require("./ingest");

const graph = new MultiDirectedGraph();

const COLORS = {
  SalesOrder: "#378ADD",
  SalesOrderItem: "#5BA3E8",
  DeliveryHeader: "#1D9E75",
  DeliveryItem: "#2BC090",
  BillingDoc: "#7F77DD",
  BillingItem: "#9B8FE8",
  JournalEntry: "#E24B4A",
  Payment: "#639922",
  Customer: "#888780",
  Product: "#BA7517",
  Plant: "#D85A30"
};

function addNode(id, type, label, attrs = {}) {
  if (!id) return;
  if (graph.hasNode(id)) return;
  graph.addNode(id, { id, type, label, color: COLORS[type], ...attrs });
}

function addEdge(source, target, relation) {
  if (!source || !target) return;
  if (!graph.hasNode(source) || !graph.hasNode(target)) return;
  graph.addEdge(source, target, { relation });
}

function buildNodes() {
  db.prepare("SELECT * FROM sales_order_headers").all().forEach((r) => {
    addNode(r.salesOrder, "SalesOrder", r.salesOrder, r);
  });
  db.prepare("SELECT * FROM sales_order_items").all().forEach((r) => {
    addNode(`${r.salesOrder}_${r.salesOrderItem}`, "SalesOrderItem", `${r.salesOrder}/${r.salesOrderItem}`, r);
  });
  db.prepare("SELECT * FROM delivery_headers").all().forEach((r) => {
    addNode(r.deliveryDocument, "DeliveryHeader", r.deliveryDocument, r);
  });
  db.prepare("SELECT * FROM delivery_items").all().forEach((r) => {
    addNode(`${r.deliveryDocument}_${r.deliveryDocumentItem}`, "DeliveryItem", `${r.deliveryDocument}/${r.deliveryDocumentItem}`, r);
  });
  db.prepare("SELECT * FROM billing_doc_headers").all().forEach((r) => {
    addNode(r.billingDocument, "BillingDoc", r.billingDocument, r);
  });
  db.prepare("SELECT * FROM billing_doc_items").all().forEach((r) => {
    addNode(`${r.billingDocument}_${r.billingDocumentItem}`, "BillingItem", `${r.billingDocument}/${r.billingDocumentItem}`, r);
  });
  db.prepare("SELECT * FROM journal_entry_items").all().forEach((r) => {
    addNode(`${r.accountingDocument}_${r.accountingDocumentItem}`, "JournalEntry", `${r.accountingDocument}/${r.accountingDocumentItem}`, r);
  });
  db.prepare("SELECT * FROM payments").all().forEach((r) => {
    addNode(`${r.accountingDocument}_${r.accountingDocumentItem}`, "Payment", `${r.accountingDocument}/${r.accountingDocumentItem}`, r);
  });
  db.prepare("SELECT * FROM business_partners").all().forEach((r) => {
    addNode(r.businessPartner, "Customer", r.businessPartnerFullName || r.businessPartner, r);
  });
  db.prepare("SELECT * FROM product_descriptions").all().forEach((r) => {
    addNode(r.product, "Product", r.productDescription || r.product, r);
  });
  db.prepare("SELECT * FROM plants").all().forEach((r) => {
    addNode(r.plant, "Plant", r.plantName || r.plant, r);
  });
}

function buildEdges() {
  db.prepare(`
    SELECT bp.businessPartner, sh.salesOrder
    FROM business_partners bp
    JOIN sales_order_headers sh ON bp.businessPartner = sh.soldToParty
  `).all().forEach((r) => addEdge(r.businessPartner, r.salesOrder, "PLACED_ORDER"));

  db.prepare(`
    SELECT sh.salesOrder, si.salesOrderItem
    FROM sales_order_headers sh
    JOIN sales_order_items si ON si.salesOrder = sh.salesOrder
  `).all().forEach((r) => addEdge(r.salesOrder, `${r.salesOrder}_${r.salesOrderItem}`, "HAS_ITEM"));

  db.prepare(`
    SELECT salesOrder, salesOrderItem, material
    FROM sales_order_items
  `).all().forEach((r) => addEdge(`${r.salesOrder}_${r.salesOrderItem}`, r.material, "IS_PRODUCT"));

  db.prepare(`
    SELECT DISTINCT sh.salesOrder, di.deliveryDocument
    FROM sales_order_headers sh
    JOIN delivery_items di ON di.referenceSdDocument = sh.salesOrder
  `).all().forEach((r) => addEdge(r.salesOrder, r.deliveryDocument, "FULFILLED_BY"));

  db.prepare(`
    SELECT dh.deliveryDocument, di.deliveryDocumentItem
    FROM delivery_headers dh
    JOIN delivery_items di ON di.deliveryDocument = dh.deliveryDocument
  `).all().forEach((r) => addEdge(r.deliveryDocument, `${r.deliveryDocument}_${r.deliveryDocumentItem}`, "HAS_DELIVERY_ITEM"));

  db.prepare(`
    SELECT deliveryDocument, deliveryDocumentItem, plant
    FROM delivery_items
  `).all().forEach((r) => addEdge(`${r.deliveryDocument}_${r.deliveryDocumentItem}`, r.plant, "SHIPPED_FROM"));

  db.prepare(`
    SELECT DISTINCT sh.salesOrder, bi.billingDocument
    FROM sales_order_headers sh
    JOIN billing_doc_items bi ON bi.referenceSdDocument = sh.salesOrder
    JOIN billing_doc_headers bh ON bh.billingDocument = bi.billingDocument
  `).all().forEach((r) => addEdge(r.salesOrder, r.billingDocument, "BILLED_AS"));

  db.prepare(`
    SELECT bh.billingDocument, bi.billingDocumentItem
    FROM billing_doc_headers bh
    JOIN billing_doc_items bi ON bi.billingDocument = bh.billingDocument
  `).all().forEach((r) => addEdge(r.billingDocument, `${r.billingDocument}_${r.billingDocumentItem}`, "HAS_BILLING_ITEM"));

  db.prepare(`
    SELECT billingDocument, billingDocumentItem, material
    FROM billing_doc_items
  `).all().forEach((r) => addEdge(`${r.billingDocument}_${r.billingDocumentItem}`, r.material, "BILLED_PRODUCT"));

  db.prepare(`
    SELECT bh.billingDocument, ji.accountingDocument, ji.accountingDocumentItem
    FROM billing_doc_headers bh
    JOIN journal_entry_items ji ON bh.accountingDocument = ji.accountingDocument
  `).all().forEach((r) => addEdge(r.billingDocument, `${r.accountingDocument}_${r.accountingDocumentItem}`, "HAS_JOURNAL_ENTRY"));

  db.prepare(`
    SELECT ji.accountingDocument, ji.accountingDocumentItem, p.accountingDocument AS pDoc, p.accountingDocumentItem AS pItem
    FROM journal_entry_items ji
    JOIN payments p ON ji.clearingAccountingDocument = p.clearingAccountingDocument
  `).all().forEach((r) => addEdge(`${r.accountingDocument}_${r.accountingDocumentItem}`, `${r.pDoc}_${r.pItem}`, "CLEARED_BY_PAYMENT"));

  db.prepare(`
    SELECT bp.businessPartner, bh.billingDocument
    FROM business_partners bp
    JOIN billing_doc_headers bh ON bh.soldToParty = bp.businessPartner
  `).all().forEach((r) => addEdge(r.businessPartner, r.billingDocument, "BILLED_TO"));
}

function topConnectedNodeIds(limit = 500) {
  return graph
    .nodes()
    .map((id) => ({ id, degree: graph.degree(id) }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, limit)
    .map((n) => n.id);
}

function graphToJSON(full = false) {
  const selected = full ? new Set(graph.nodes()) : new Set(topConnectedNodeIds(500));
  const nodes = [];
  const edges = [];

  selected.forEach((id) => {
    const attrs = graph.getNodeAttributes(id);
    nodes.push({ id, ...attrs });
  });

  graph.forEachEdge((edgeKey, attrs, source, target) => {
    if (selected.has(source) && selected.has(target)) {
      edges.push({ source, target, relation: attrs.relation });
    }
  });

  return { nodes, edges };
}

function getNodeData(id) {
  if (!graph.hasNode(id)) return null;
  const node = graph.getNodeAttributes(id);
  const neighbors = [];
  const edges = [];

  graph.forEachOutEdge(id, (edgeKey, attrs, source, target) => {
    if (graph.hasNode(target)) {
      const targetNode = graph.getNodeAttributes(target);
      neighbors.push({ id: target, type: targetNode.type, relation: attrs.relation });
      edges.push({ source, target, relation: attrs.relation });
    }
  });

  graph.forEachInEdge(id, (edgeKey, attrs, source, target) => {
    if (graph.hasNode(source)) {
      const sourceNode = graph.getNodeAttributes(source);
      neighbors.push({ id: source, type: sourceNode.type, relation: attrs.relation });
      edges.push({ source, target, relation: attrs.relation });
    }
  });

  return { node, neighbors, edges };
}

function buildGraph() {
  graph.clear();
  buildNodes();
  buildEdges();
  return graph;
}

module.exports = {
  graph,
  buildGraph,
  graphToJSON,
  getNodeData
};
