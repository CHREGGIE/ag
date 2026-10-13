// Code by Zapier (JavaScript) step: Squarespace form submission → Clio Grow Lead Inbox.
// Paste this whole file into the step's Code box. Set up the "Input Data" fields
// listed below in the Zap editor (left: key name, right: mapped Squarespace field).
//
//   token       Clio Grow lead capture token (typed in, not mapped)
//   region      optional: us (default) | eu | ca | au
//   source      optional: lead source shown in Clio, e.g. "Website – Contact Us"
//   pageUrl     optional: your site URL, e.g. https://www.yourfirm.com/contact
//   firstName   Squarespace Name › First Name
//   lastName    Squarespace Name › Last Name
//   name        use instead of firstName/lastName if the form has one Name field
//   email       Squarespace Email
//   phone       Squarespace Phone
//   message     Squarespace message / "How can we help" field
//   extra_*     any other field, e.g. extra_Practice Area → Practice Area field.
//               Each is added to the message as "Practice Area: Contracts".

const endpoints = {
  us: "https://grow.clio.com/inbox_leads",
  eu: "https://eu.grow.clio.com/inbox_leads",
  ca: "https://ca.grow.clio.com/inbox_leads",
  au: "https://au.grow.clio.com/inbox_leads",
};

const val = (k) => String(inputData[k] ?? "").replace(/\s+/g, " ").trim();

let first = val("firstName");
let last = val("lastName");
if (!first && !last && val("name")) {
  const parts = val("name").split(" ");
  first = parts.shift();
  last = parts.join(" ");
}

const extras = Object.keys(inputData)
  .filter((k) => k.startsWith("extra_") && val(k))
  .map((k) => `${k.slice(6).trim()}: ${val(k)}`);
const message = [String(inputData.message ?? "").trim(), ...extras].filter(Boolean).join("\n");

if (!val("email") && !val("phone")) {
  throw new Error("Submission has no email or phone; not sent to Clio Grow");
}

const url = endpoints[val("region").toLowerCase() || "us"];
if (!url) throw new Error(`Unknown region "${val("region")}"`);

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({
    inbox_lead_token: val("token"),
    inbox_lead: {
      from_first: first || "(no first name)",
      // Clio requires a last name; single-name submissions get a placeholder.
      from_last: last || "(no last name)",
      from_email: val("email"),
      from_phone: val("phone"),
      from_message: message || "(no message)",
      referring_url: val("pageUrl") || "(website form)",
      from_source: val("source") || "Website",
    },
  }),
});

const detail = await res.text();
if (!res.ok) {
  // Throwing makes Zapier mark the run as errored and email you.
  throw new Error(`Clio Grow returned ${res.status}: ${detail.slice(0, 500)}`);
}
output = { status: res.status };
