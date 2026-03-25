const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchGraph() {
  const res = await fetch(`${BASE}/graph`);
  return res.json();
}

export async function fetchNode(id: string) {
  const res = await fetch(`${BASE}/graph/node/${encodeURIComponent(id)}`);
  return res.json();
}

export async function sendQuery(message: string, history: { role: string; text: string }[]) {
  const res = await fetch(`${BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history })
  });
  return res.json();
}
