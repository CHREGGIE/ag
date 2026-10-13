# Squarespace → Clio Grow leads (via Zapier)

Sends every Squarespace form submission to the **Clio Grow Lead Inbox** as a new lead,
using the firm's existing Zapier account.

```
Squarespace form ─► Zap trigger: Squarespace "New Form Submission"
                  ─► Code by Zapier step (zapier/code-step.js) ─► grow.clio.com/inbox_leads
```

Squarespace keeps storing submissions and sending its email notifications. The Zap only
adds a copy in Grow, so a Zap error never loses a lead.

Zapier has no built-in Clio Grow "create lead" action, so the Zap posts to Clio's Lead
Inbox API. It does that in a small Code step rather than a hand-typed Webhooks body.
The Code step builds the JSON itself, so quotes or line breaks in a prospect's message
can't break the request. It also splits a single "Name" field into first and last name,
which Clio requires.

## Setup (one Zap per form, about 10 minutes each)

1. **Get the Clio token.** In Clio Grow: Settings › Integrations (Settings › Inbox in newer
   accounts) › *Lead capture / Inbox lead token*. Copy it.
2. **Create a Squarespace API key.** In Squarespace: Settings › Developer Tools › Developer
   API Keys › Generate Key, with **Forms** permission. Zapier asks for it once.
3. **Trigger.** New Zap › app **Squarespace** › event **New Form Submission**. Connect the
   site, pick the form, and click Test. Squarespace sends a sample submission.
4. **Action.** Add **Code by Zapier** › **Run JavaScript**.
   - **Input Data:** add these rows (key on the left, value on the right):

     | Key | Value |
     |---|---|
     | `token` | paste the Clio token (typed, not mapped) |
     | `source` | e.g. `Website – Contact Us` (shown as the lead source in Grow) |
     | `pageUrl` | the page the form is on, e.g. `https://www.yourfirm.com/contact` |
     | `firstName` / `lastName` | map Squarespace's First Name / Last Name |
     | `name` | *only if the form has a single Name field* |
     | `email` | map Email |
     | `phone` | map Phone |
     | `message` | map the message / "How can we help" field |
     | `extra_<Label>` | any other field, e.g. `extra_Practice Area` → Practice Area |
     | `region` | *only if not US:* `eu`, `ca` or `au` (match your Grow login URL) |

   - **Code:** paste all of [`zapier/code-step.js`](zapier/code-step.js).
5. **Test the step**, then open the Clio Grow Inbox and check the test lead arrived with
   the right name, email, phone and message. Delete it, then **Publish** the Zap.
6. Repeat 3–5 for each other form (change `source` so Grow shows which form a lead came
   from). Leave newsletter-only sign-ups out unless you want them in Grow as leads.

### When a run fails

The Code step makes the Zap run fail on purpose, so Zapier emails you and the run can be
replayed from **Zap history**:

| Error | Meaning |
|---|---|
| `Clio Grow returned 401` | wrong or old token: copy it again from Grow |
| `Clio Grow returned 422 …` | Clio rejected a field; the message names it |
| `no email or phone` | the submission had no way to contact the person, so it wasn't sent |

## Privacy

Prospective-client submissions are confidential. They pass through Zapier, which keeps
Zap history (including field values) for its retention period. Check that this is
acceptable under the firm's vendor/confidentiality policy. Zap history can be deleted
from the Zapier account, and anyone with edit access to the Zap can see the Clio token.

## ⚠️ VERIFY before go-live

- **Clio's field names.** The payload follows Clio's Lead Inbox API (`inbox_lead_token`
  plus `inbox_lead` with `from_first`, `from_last`, `from_email`, `from_phone`,
  `from_message`, `referring_url`, `from_source`). Clio's developer site couldn't be
  loaded when this was written, so the names were taken from Clio's help articles and
  existing client libraries. The step 5 test confirms them; see
  <https://docs.developers.clio.com/guides/clio-grow/lead-inbox-api/>.
- **Squarespace field names in Zapier.** The names Zapier shows for each form field come
  from your form's labels; map by what you see in the trigger test.

## Tests

`npm test` runs `zapier/code-step.js` the way Code by Zapier does, with a fake Clio.

## Alternative without Zapier

`squarespace/footer-snippet.html` + `api/clio-lead.js` (+ `lib/lead.js`) is a self-hosted
version: a Squarespace Code Injection script sends submissions to a Vercel function that
holds the token and posts to Clio. It covers every form at once and avoids storing
submissions at Zapier, but it's more to maintain. Setup:

1. Deploy this folder to Vercel with env vars `CLIO_INBOX_LEAD_TOKEN`,
   `ALLOWED_ORIGINS` (e.g. `https://www.yourfirm.com,https://yourfirm.com`), and
   optional `CLIO_REGION` and `LEAD_SOURCE`.
2. Paste the snippet into Settings › Developer Tools › Code Injection › Footer (Business
   plan or higher) and set `RELAY_URL` to `https://<project>.vercel.app/api/clio-lead`.

The snippet relies on Squarespace's form markup to detect a successful submission, so
re-test after template changes.
