// Turns a Squarespace form capture into a Clio Grow Lead Inbox payload.
//
// Clio Grow Lead Inbox API (legacy "inbox_leads" endpoint):
//   POST https://grow.clio.com/inbox_leads          (US)
//   POST https://eu.grow.clio.com/inbox_leads       (EU)
//   Body: { "inbox_lead": { from_first, from_last, from_message, from_email,
//           from_phone, referring_url, from_source }, "inbox_lead_token": "..." }
// from_first, from_last, from_message, referring_url and from_source are required.

export const CLIO_ENDPOINTS = {
  us: "https://grow.clio.com/inbox_leads",
  eu: "https://eu.grow.clio.com/inbox_leads",
  ca: "https://ca.grow.clio.com/inbox_leads",
  au: "https://au.grow.clio.com/inbox_leads",
};

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

function clean(v, max = MAX_VALUE) {
  return String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

// fields: [{ label, value }] as captured from the page.
export function buildInboxLead({ fields, pageUrl, formName }, { source }) {
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
    if (match) {
      found[match[0]] = found[match[0]] ? `${found[match[0]]} ${value}` : value;
    } else {
      extras.push(`${label}: ${value}`);
    }
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
    // Clio requires a last name; single-name submissions get a placeholder.
    from_last: last || "(no last name)",
    from_email: found.email || "",
    from_phone: found.phone || "",
    from_message: message || "(no message)",
    referring_url: clean(pageUrl, 2000) || "(unknown page)",
    from_source: formName ? `${source} – ${clean(formName, MAX_LABEL)}` : source,
  };
}

export async function sendToClio(inboxLead, { token, region = "us", fetchImpl = fetch }) {
  const url = CLIO_ENDPOINTS[region];
  if (!url) throw new Error(`Unknown CLIO_REGION "${region}"`);
  const res = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ inbox_lead: inboxLead, inbox_lead_token: token }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Clio Grow returned ${res.status}: ${detail.slice(0, 500)}`);
  }
  return res.status;
}

export class LeadError extends Error {}
