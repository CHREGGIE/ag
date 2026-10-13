// Vercel serverless function: receives a lead from the Squarespace snippet and
// forwards it to the Clio Grow Lead Inbox. The Clio token stays here, never in
// the browser.
//
// Environment variables:
//   CLIO_INBOX_LEAD_TOKEN  required  Clio Grow > Settings > Integrations/Inbox > Lead capture token
//   ALLOWED_ORIGINS        required  comma-separated, e.g. https://www.example.com,https://example.com
//   CLIO_REGION            optional  us (default) | eu | ca | au
//   LEAD_SOURCE            optional  shown as the lead source in Clio (default "Website")

import { buildInboxLead, sendToClio, LeadError } from "../lib/lead.js";

const MAX_BODY = 50_000;

export default async function handler(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const origin = req.headers.origin || "";

  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!allowed.includes(origin)) return res.status(403).json({ error: "Origin not allowed" });

  const token = process.env.CLIO_INBOX_LEAD_TOKEN;
  if (!token) return res.status(500).json({ error: "Server not configured" });

  // The snippet sends text/plain (no CORS preflight), so parse it ourselves.
  let body = req.body;
  try {
    if (typeof body === "string") {
      if (body.length > MAX_BODY) return res.status(413).json({ error: "Too large" });
      body = JSON.parse(body);
    }
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  let lead;
  try {
    lead = buildInboxLead(body, { source: process.env.LEAD_SOURCE || "Website" });
  } catch (err) {
    if (err instanceof LeadError) return res.status(422).json({ error: err.message });
    throw err;
  }

  try {
    await sendToClio(lead, { token, region: process.env.CLIO_REGION || "us" });
  } catch (err) {
    // Log the failure without the prospect's details (they are confidential).
    console.error("Clio Grow push failed:", err.message);
    return res.status(502).json({ error: "Could not reach Clio Grow" });
  }
  return res.status(202).json({ ok: true });
}
