# Squarespace → Clio Grow lead relay

Sends every Squarespace form submission to the **Clio Grow Lead Inbox** as a new lead.

```
Visitor submits form ─► Squarespace (stores it + emails you, as today)
          │
          └─ footer snippet ─► /api/clio-lead (Vercel) ─► grow.clio.com/inbox_leads
                                 holds the Clio token        new lead in Grow Inbox
```

Squarespace has no form webhook or forms API, so a small script on the site copies
the submitted fields. It forwards them only after Squarespace shows its "thank you"
message, so a submission that fails validation never creates a lead. The Clio token
lives on the relay, never in the page, so nobody can read it and spam your Inbox.

## Files

| File | Purpose |
|------|---------|
| `squarespace/footer-snippet.html` | Paste into Squarespace Code Injection (footer) |
| `api/clio-lead.js` | Vercel serverless function that checks the origin and forwards to Clio |
| `lib/lead.js` | Maps form labels to Clio fields (first/last name, email, phone, message) |
| `test/lead.test.js` | `npm test` |

## Field mapping

| Squarespace field label (case-insensitive) | Clio Grow field |
|---|---|
| Name block (First / Last) or "First Name", "Last Name" | `from_first`, `from_last` |
| A single "Name" / "Full Name" field | split on the first space |
| Anything containing "email" | `from_email` |
| "Phone", "Mobile", "Cell", "Tel" | `from_phone` |
| "Message", "How can we help", "Comments", "Details", "Question"… | `from_message` |
| **Every other field** (practice area, county, checkboxes…) | appended to `from_message` as `Label: value` |
| Page the form was on | `referring_url` |
| `LEAD_SOURCE` + form title (e.g. "Website – Contact Us") | `from_source` |

A submission with neither an email nor a phone is rejected. Clio requires a first name,
last name and message, so blanks are filled with "(no last name)" etc.

## Setup (about 15 minutes)

1. **Get the Clio token.** In Clio Grow: Settings › Integrations (or Settings › Inbox in
   newer accounts) › *Lead capture / Inbox lead token*. Copy it.
2. **Deploy the relay to Vercel.** Create a Vercel project with *Root Directory* set to
   `integrations/squarespace-clio-grow`. Add these environment variables:

   | Variable | Value |
   |---|---|
   | `CLIO_INBOX_LEAD_TOKEN` | the token from step 1 |
   | `ALLOWED_ORIGINS` | your site, both forms: `https://www.yourfirm.com,https://yourfirm.com` |
   | `CLIO_REGION` | `us` (default), `eu`, `ca` or `au` (match your Grow login URL) |
   | `LEAD_SOURCE` | optional, default `Website` |

   The endpoint is `https://<project>.vercel.app/api/clio-lead`.
3. **Add the snippet.** Squarespace › Settings › Developer Tools › Code Injection ›
   **Footer**: paste `squarespace/footer-snippet.html` and change `RELAY_URL` to the
   endpoint from step 2. (Code Injection needs a Business plan or higher.) To leave a
   form out, such as a newsletter sign-up, add its title to `SKIP_FORMS`.
4. **Test.** Submit each form on the live site with a test name, then check the Clio
   Grow Inbox. Delete the test leads afterwards. If nothing arrives, check the Vercel
   function logs: `403` means `ALLOWED_ORIGINS` doesn't match the site address exactly;
   `502` means Clio rejected the push (wrong token or region).

Squarespace's own form storage and email notifications keep working, so a relay
outage never loses a lead; it only skips the automatic copy into Grow.

## Privacy

Form contents from prospective clients are confidential. The relay keeps nothing:
it doesn't store submissions and logs only error status, never names or messages.

## ⚠️ VERIFY before go-live

- **Clio's field names.** The payload follows Clio's Lead Inbox API
  (`inbox_lead` with `from_first`, `from_last`, `from_email`, `from_phone`,
  `from_message`, `referring_url`, `from_source`, plus `inbox_lead_token`). Clio's
  developer site couldn't be loaded when this was written, so the names were confirmed
  from Clio's help articles and existing client libraries. Compare them with
  <https://docs.developers.clio.com/guides/clio-grow/lead-inbox-api/> and do the
  step 4 test.
- **Squarespace markup.** The snippet detects success by the form being replaced or by a
  `form-submission-text` element. If Squarespace changes its form markup, leads stop
  reaching Grow. Your email notifications still arrive, but re-run the step 4 test
  after any Squarespace template change.

## No-code alternative

Squarespace form *Storage › Zapier* → Zapier "Webhooks by Zapier" POST to
`https://grow.clio.com/inbox_leads` with the same JSON body. It needs no code but
requires a paid Zapier plan, and each form has to be connected separately.
