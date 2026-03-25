const DOMAIN_MESSAGE =
  "This system is designed to answer questions related to the Order-to-Cash dataset only. You can ask about sales orders, deliveries, billing documents, journal entries, payments, customers, products, and plants.";

const DOMAIN_KEYWORDS = [
  "order",
  "delivery",
  "billing",
  "invoice",
  "payment",
  "customer",
  "product",
  "plant",
  "sales",
  "journal",
  "material",
  "shipment",
  "revenue",
  "document",
  "sap",
  "erp",
  "account",
  "dispatch",
  "fulfillment"
];

const BLOCK_PATTERNS = [
  "poem",
  "joke",
  "story",
  "weather",
  "capital city",
  "president",
  "celebrity",
  "sport",
  "recipe",
  "code help",
  "algorithm",
  "math problem",
  "translate",
  "who is",
  "what year",
  "explain quantum",
  "history of"
];

function isOffTopic(message = "") {
  const lower = String(message).toLowerCase();
  const hasDomainKeyword = DOMAIN_KEYWORDS.some((word) => lower.includes(word));
  const hasBlockPattern = BLOCK_PATTERNS.some((pattern) => lower.includes(pattern));
  return !hasDomainKeyword || hasBlockPattern;
}

module.exports = {
  isOffTopic,
  DOMAIN_MESSAGE
};
