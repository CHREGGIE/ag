# Google AI-Content Playbook — AG Project

**Why this exists:** Google's guidance on generative-AI content (updated Oct. 1, 2026) says AI-assisted content is fine, but:
- mass-producing pages that add little value is **scaled content abuse** under its spam policies;
- every page — including metadata, structured data, and image alt text — must be **fact-checked by a person**;
- telling readers **how content was created** helps.

Legal content is "Your Money or Your Life" (YMYL) material, which Google's quality raters judge most strictly. This playbook is how AG content stays on the right side of that.

Google's quality rater guidelines (sections 4.6.5 on scaled content abuse, 4.6.6 on low-effort content) don't directly set rankings, but they describe what Google's systems are built to reward and demote. Use them as the standard.

---

## 1. Don't scale — publish less, publish better

**Never do these (scaled content abuse patterns):**
- Templated pages that only swap a city, borough, county, or practice area ("LLC Formation Lawyer in Queens", "... in Brooklyn", "... in Staten Island" with the same body).
- Rewrites of other sites' articles, or of statutes, with nothing added.
- Bulk-generated FAQ or glossary pages.
- Publishing drafts in batches faster than an attorney can review them.
- Multiple near-duplicate posts targeting keyword variants. Consolidate into one strong page.

**Do instead:**
- One page per real client question, written to answer it fully.
- Location pages only where the firm has something genuinely local to say (e.g., the New York County publication cost difference, a borough-specific court or filing practice), and only for offices or areas it actually serves.
- Set the publishing pace by review capacity, not keyword lists.
- Prune or merge old thin pages rather than leaving them up.

## 2. The "added value" test (every page must pass)

Before drafting, write down what this page offers that the top search results don't. A page must include **at least two** of these, and the first is required for legal explainers:

1. **Verified, New York-specific detail:** exact rules, fees, deadlines, and exceptions checked under the Content Verification Protocol, with links to official sources.
2. **Attorney insight from practice:** what clients commonly get wrong, what the attorney actually advises, how a process tends to go in practice. This must come from the reviewing attorney — the AI drafts the questions, the attorney supplies the answers. Never invent it.
3. **A worked hypothetical**, clearly labeled as hypothetical (never a fake client story — see section 5).
4. **A practical tool:** checklist, timeline, decision tree, or fee breakdown built from verified facts.
5. **Original synthesis:** e.g., comparing how two rules interact (the LLC publication rule and the Transparency Act exemption), with sources.
6. **Questions from real intake calls**, answered.

If a draft can't pass, don't publish it.

## 3. Human fact-check covers everything that can appear in Search

Run the Content Verification Protocol on **all** of these, not just the body text:

| Element | Check |
|---|---|
| `<title>` | Accurate; no guarantees, "best", "#1", or "specialist" claims (Rules 7.1, 7.4) |
| Meta description | Same rules as the title; no claim the page doesn't support |
| Headings and body | Every legal fact verified; ⚠️ flags resolved |
| Structured data (JSON-LD) | Values match the visible page; validated (section 4) |
| Image alt text | Describes the image accurately; no keyword stuffing; no implied people or events that aren't real |
| Open Graph / social preview text | Same rules as the meta description |

Rule 7.1(g) also bars meta tags or other hidden code that would violate the advertising rules if displayed. Treat hidden markup like visible copy.

## 4. Structured data

- Mark up only what is visible on the page, and keep values accurate (name, address, phone, attorney names and admissions).
- Follow Google's general structured-data policies and the rules for each feature you use.
- **Validate before publishing** with Google's Rich Results Test, plus the Schema Markup Validator for non-rich-result types.
- **No self-serving review markup:** no `aggregateRating` or `review` markup sourced from the firm's own site.
- **FAQ markup:** Google limits FAQ rich results to well-known government and health sites (since 2023 — re-check the current feature policy). FAQPage markup on a law-firm page is still allowed, but don't expect a rich result and never add it just to chase one.
- `LegalService`, `Attorney`, `Person`, `Article`, and `BreadcrumbList` are appropriate types. Article markup should carry the real author and reviewer and `datePublished` / `dateModified`.

## 5. Give readers context about how the content was made

Every AG article carries:

- **A named, real author or reviewing attorney:** "Reviewed by [Attorney Name], admitted in New York, on [date]." This also satisfies the Rule 7.1(k) requirement that ads be pre-approved by a lawyer.
- **"Last updated" date**, and an "As of [month year]" stamp on time-sensitive facts.
- **Sources:** links to the official statutes, rules, and agency pages relied on.
- **A short note on how it was made**, where it fits the audience. Suggested wording:
  > *This article was drafted with the help of AI tools, fact-checked against official New York sources, and reviewed and edited by [Attorney Name]. It is general information, not legal advice.*
- **An author bio page** with the attorney's admissions, education, and practice focus (Rule 7.1(b)(1) permits this information).

**AI images:**
- Prefer real photos of the firm's own attorneys and office.
- Any AI-generated image must carry IPTC `DigitalSourceType` = `trainedAlgorithmicMedia` metadata. Google requires this for Merchant Center and recommends image metadata generally. Add it to alt text context or a caption where helpful.
- **Never use an AI image of a person presented as a lawyer, client, or judge**, or of a "scene" presented as real. Rule 7.1(c)(3) prohibits portraying the lawyer, firm members, clients, or a judge with actors, or showing fictionalized scenes, **without disclosure**. Treat AI-generated people the same way: avoid them, or disclose them clearly ("AI-generated illustration").
- Never use fake client stories or testimonials, AI-written or otherwise (Rules 7.1(a), (c)(1), (d)–(e); FTC rules).

## 6. Workflow for each AG article

1. **Brief:** the reader's question, the "added value" items (section 2), and the attorney's input (answers to the AI's interview questions).
2. **Verify first:** list the legal claims; check each under the Content Verification Protocol.
3. **Draft** from the verified facts and the attorney's input. Mirror source language; date-stamp moving facts.
4. **Edit for voice:** cut generic filler and repeated summaries; make sure the page answers the question early and specifically.
5. **Metadata:** write the title, meta description, alt text, and JSON-LD; verify them (section 3); validate the structured data (section 4).
6. **Attorney review and sign-off:** the attorney reads the whole page, including metadata, and approves it in writing (Rule 7.1(k)).
7. **Publish** with byline, review line, dates, sources, and the how-it-was-made note.
8. **Archive** a copy (Rule 7.1(k): website snapshots at least every 90 days) along with the Verification Log.
9. **Re-check every 90 days**, or sooner when a source changes; update `dateModified` only when content actually changes.

## 7. Red flags — stop and fix before publishing

- More than a handful of pages produced in one batch, or pages differing only by place name.
- Any statement the attorney hasn't seen.
- Any fact without a source in the Verification Log.
- Title or meta description promising an outcome.
- Structured data that doesn't match the page or fails validation.
- AI-generated people or "client" images without disclosure.
- No named reviewer or no last-updated date.
