# Squarespace → Clio Grow leads (self-hosted, no Zapier)

Sends every Squarespace form submission to the **Clio Grow Lead Inbox** as a new lead.
It runs on the Cloudflare Workers free plan, which allows commercial use and covers
100,000 requests a day.

```
Visitor submits form ─► Squarespace (stores it + emails you, as today)
          │
          └─ footer snippet ─► Cloudflare Worker ─► grow.clio.com/inbox_leads
                               holds the Clio token    new lead in the Grow Inbox
```

| File | Purpose |
|------|---------|
| `squarespace/footer-snippet.html` | Pasted into Squarespace Code Injection (footer). Watches every form. |
| `src/worker.js` | The Worker: checks the request came from your site, maps fields, posts to Clio. |
| `wrangler.toml` | Worker config, for deploying from the command line. |
| `test/lead.test.js` | `npm test` |

## How it behaves

- **Every form, automatically.** Any form block on the site is picked up; new forms need
  no setup. Add a form's title to `SKIP_FORMS` in the snippet to leave it out (e.g. a
  newsletter sign-up).
- **Only real submissions.** It sends once Squarespace shows its "thank you" message. If
  Squarespace ever changes that markup, it still sends after 6 seconds when the form has
  no validation errors, so leads don't silently stop. A visitor who fixes an error and
  resubmits creates one lead, not two.
- **Fields.** First/last name, email and phone go into their Clio fields. A single
  "Name" field is split at the first space. **Every other field** (practice area,
  checkboxes, etc.) is added to the message as `Label: value`.
- **Never blank.** Clio rejects a lead if the name, message, page or source is blank (the
  error you hit in Zapier). Blanks are filled with placeholders such as "(no message)".
  A submission with neither email nor phone isn't sent.
- **Retries.** If Clio has a temporary server error, the Worker tries once more.
- **Nothing lost.** Squarespace keeps storing submissions and emailing you, so if the
  Worker or Clio is down, the lead is still in your inbox; it just isn't copied to Grow.
- **Private.** The Clio token is a Worker secret, never in the website. The Worker stores
  nothing and logs only error codes, never names or messages.

## Setup (about 15 minutes)

1. **Copy the Clio token.** Clio Grow › Settings › Integrations (or Settings › Inbox) ›
   lead capture / inbox lead token.
2. **Create the Worker** in the Cloudflare dashboard (a free account is fine):
   1. *Workers & Pages* › *Create* › *Create Worker*. Name it `clio-lead` › *Deploy*.
   2. *Edit code*: replace everything with the contents of `src/worker.js` › *Deploy*.
   3. *Settings* › *Variables and Secrets* › add:

      | Type | Name | Value |
      |---|---|---|
      | **Secret** | `CLIO_INBOX_LEAD_TOKEN` | the token from step 1 |
      | Text | `ALLOWED_ORIGINS` | your site, both forms: `https://www.yourfirm.com,https://yourfirm.com` |
      | Text | `CLIO_REGION` | `us` (or `eu`, `ca`, `au` to match your Grow login address) |
      | Text | `LEAD_SOURCE` | optional, default `Website` |

   4. Copy the Worker's address, e.g. `https://clio-lead.yourname.workers.dev`.

   (Command-line alternative: edit `wrangler.toml`, then `npx wrangler deploy` and
   `npx wrangler secret put CLIO_INBOX_LEAD_TOKEN`.)
3. **Add the snippet.** Squarespace › Settings › Developer Tools › Code Injection ›
   **Footer**: paste `squarespace/footer-snippet.html` and set `RELAY_URL` to the address
   from step 2. Code Injection needs a Squarespace Business plan or higher.
4. **Test** each form on the live site with a test name, check the Grow Inbox, then delete
   the test leads.
5. **Turn off the Zapier Zap** so leads aren't created twice.

## Troubleshooting

Open the Worker in Cloudflare › *Logs* (enable real-time logs), submit a test, and look
at the response code:

| Code | Meaning |
|---|---|
| 202 | Sent to Clio. If it's not in Grow, check `CLIO_REGION`. |
| 403 | `ALLOWED_ORIGINS` doesn't exactly match the site address (check `www` and `https`). |
| 422 | The submission had no email or phone. |
| 502 | Clio rejected it; the log line gives Clio's reason (401 = wrong token). |

No request at all means the snippet isn't running: check that it's in the **Footer**
box and that `RELAY_URL` is right.

## ⚠️ VERIFY before go-live

- **Clio field names.** These come from Clio's Lead Inbox API (`inbox_lead_token`, and
  `inbox_lead` with `from_first`, `from_last`, `from_email`, `from_phone`,
  `from_message`, `referring_url`, `from_source`); the Zapier error about the message
  field matches them. The step 4 test confirms them.
- **Spam.** Requests from other sites are refused, but a bot could still post directly to
  the Worker. If junk leads appear, add Cloudflare Turnstile or a rate-limit rule.
