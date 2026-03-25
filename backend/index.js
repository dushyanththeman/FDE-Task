const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { ingestAll, getTableRowCounts } = require("./ingest");
const { graph, buildGraph, graphToJSON, getNodeData } = require("./graph");
const { queryWithLLM } = require("./query");
const { isOffTopic, DOMAIN_MESSAGE } = require("./guardrails");

dotenv.config();
//console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

let rowCounts = {};

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    nodeCount: graph.order,
    edgeCount: graph.size,
    tables: rowCounts
  });
});

app.get("/graph", (req, res) => {
  res.json(graphToJSON(false));
});

app.get("/graph/full", (req, res) => {
  res.json(graphToJSON(true));
});

app.get("/graph/node/:id", (req, res) => {
  const data = getNodeData(req.params.id);
  if (!data) {
    return res.status(404).json({ error: "Node not found" });
  }
  return res.json(data);
});

app.post("/query", async (req, res) => {
  try {
    const { message = "", history = [] } = req.body || {};
    if (isOffTopic(message)) {
      return res.json({ answer: DOMAIN_MESSAGE, guardrailed: true });
    }
    const result = await queryWithLLM(message, history);
    return res.json(result);
  } catch (error) {
    console.error("🔥 QUERY ERROR:", error);
  
    return res.status(500).json({
      answer: "Something went wrong...",
      error: error.message
    });
  }
});

function start() {
  ingestAll();
  rowCounts = getTableRowCounts();
  buildGraph();
  console.log(`Server ready. Graph has ${graph.order} nodes, ${graph.size} edges.`);
  app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
}

start();
