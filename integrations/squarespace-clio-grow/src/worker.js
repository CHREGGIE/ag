// Cloudflare Worker: receives a lead from the Squarespace footer snippet and
// pushes it to the Clio Grow Lead Inbox. The Clio token lives here as a secret,
// never in the website.
//
// Settings (Worker › Settings › Variables and Secrets):
//   CLIO_INBOX_LEAD_TOKEN  secret    Clio Grow lead capture / inbox token
//   ALLOWED_ORIGINS        text      e.g. https://www.yourfirm.com,https://yourfirm.com
//   CLIO_REGION            optional  us (default) | eu | ca | au
//   LEAD_SOURCE            optional  lead source shown in Grow (default "Website")
//
// Clio Grow Lead Inbox API: POST {"inbox_lead": {...}, "inbox_lead_token": "..."}
// to /inbox_leads. from_first, from_last, from_message, referring_url and
// from_source must not be blank, or Clio rejects the whole lead.

export const CLIO_ENDPOINTS = {
  us: "https://grow.clio.com/inbox_leads",
  eu: "https://eu.grow.clio.com/inbox_leads",
  ca: "https://ca.grow.clio.com/inbox_leads",
  au: "https://au.grow.clio.com/inbox_leads",
};

const MAX_BODY = 50_000;
const MAX_FIELDS = 40;
const MAX_LABEL = 120;
const MAX_VALUE = 5000;

// Label patterns, checked in order. The first match wins for each field.
const MATCHERS = [
  ["first", /^(fname|first[\s_-]*name|given[\s_-]*name|first)$/i],
  ["last", /^(lname|last[\s_-]*name|surname|family[\s_-]*name|last)$/i],
  ["name", /^(name|full[\s_-]*name|your[\s_-]*name)$/i],
  ["email", /e-?mail/i],
  ["phone", /phone|mobile|cell|tel/i],
  ["message", /message|how can we help|comments?|details|describe|question|inquiry|enquiry|tell us/i],
];

export class LeadError extends Error {}

function clean(v, max = MAX_VALUE) {
  return String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

// fields: [{ label, value }] as captured from the page.
export function buildInboxLead({ fields, pageUrl, formName } = {}, { source }) {
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new LeadError("No form fields received");
  }

  const found = {};
  const extras = [];
  for (const f of fields.slice(0, MAX_FIELDS)) {
    const label = clean(f?.label, MAX_LABEL);
    const value = clean(f?.value);
    if (!label || !value) continue;
    const match = MATCHERS.find(([key, re]) => !found[key] && re.test(label));
    if (match) found[match[0]] = value;
    else extras.push(`${label}: ${value}`);
  }

  let first = found.first || "";
  let last = found.last || "";
  if (!first && !last && found.name) {
    const parts = found.name.split(" ");
    first = parts.shift();
    last = parts.join(" ");
  }

  if (!found.email && !found.phone) {
    throw new LeadError("Lead needs an email or phone number");
  }

  const message = [found.message, ...extras].filter(Boolean).join("\n");

  return {
    from_first: first || "(no first name)",
    from_last: last || "(no last name)",
    from_email: found.email || "",
    from_phone: found.phone || "",
    from_message: message || "(no message)",
    referring_url: clean(pageUrl, 2000) || "(website form)",
    from_source: formName ? `${source} – ${clean(formName, MAX_LABEL)}` : source,
  };
}

// Posts to Clio, retrying once on a network error or a Clio-side (5xx) failure.
export async function sendToClio(inboxLead, { token, region = "us", fetchImpl = fetch }) {
  const url = CLIO_ENDPOINTS[region];
  if (!url) throw new Error(`Unknown CLIO_REGION "${region}"`);
  const init = {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ inbox_lead: inboxLead, inbox_lead_token: token }),
  };

  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    let res;
    try {
      res = await fetchImpl(url, init);
    } catch (err) {
      lastError = err;
      continue;
    }
    if (res.ok) return res.status;
    const detail = (await res.text().catch(() => "")).slice(0, 500);
    lastError = new Error(`Clio Grow returned ${res.status}: ${detail}`);
    if (res.status < 500) break;
  }
  throw lastError;
}

function json(status, body, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const cors = allowed.includes(origin)
      ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
      : {};

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { ...cors, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" },
      });
    }
    if (request.method !== "POST") return json(405, { error: "POST only" }, cors);
    if (!allowed.includes(origin)) return json(403, { error: "Origin not allowed" }, cors);
    if (!env.CLIO_INBOX_LEAD_TOKEN) return json(500, { error: "Server not configured" }, cors);

    // The snippet sends text/plain so browsers skip the CORS preflight.
    const raw = await request.text();
    if (raw.length > MAX_BODY) return json(413, { error: "Too large" }, cors);
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json(400, { error: "Invalid JSON" }, cors);
    }

    let lead;
    try {
      lead = buildInboxLead(body, { source: env.LEAD_SOURCE || "Website" });
    } catch (err) {
      if (err instanceof LeadError) return json(422, { error: err.message }, cors);
      throw err;
    }

    try {
      await sendToClio(lead, { token: env.CLIO_INBOX_LEAD_TOKEN, region: env.CLIO_REGION || "us" });
    } catch (err) {
      // Log the failure without the prospect's details (they are confidential).
      console.error("Clio Grow push failed:", err.message);
      return json(502, { error: "Could not reach Clio Grow" }, cors);
    }
    return json(202, { ok: true }, cors);
  },
};
