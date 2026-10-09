# Content Verification Protocol — AG Project

**Applies to:** every blog post, practice-area page, FAQ, newsletter, social post, or other content written for the AG project that states, cites, or relies on a legal rule, deadline, fee, threshold, or case.

**The rule:** no legal fact is published unless it was checked against a primary source in this protocol, or it is visibly flagged for attorney review. Memory, training data, other blogs, and AI summaries are never a source.

---

## 1. Source hierarchy (check in this order)

| # | Source | Covers | How to reach it |
|---|---|---|---|
| 1 | **This skill's verified facts** — items marked ✓ in `SKILL.md` and logged in `references/source-verification.md` | Everything already checked, with date and source | Read the files. Reuse only if the check date is under 90 days old; otherwise re-verify |
| 2 | **Open US Law dataset** — `CHREGGIE/Datasets` bucket, `open-us-law/` (snapshot v2026.09.1) | NY statutes (all consolidated laws), parts of 22 NYCRR (incl. Part 137), NY AG opinions, NY guidance; federal USC, CFR, FTC/SEC decisions | `scripts/law_lookup.py` (section 3 below). Bucket via the Hugging Face connector; files also at `https://oss-data-us.vaquill.ai/v2026.09.1/` |
| 3 | **`docketx/us-caselaw-ny`** (Hugging Face) | NY case law — ~963k opinions, CourtListener export of 2026-06-30 | Download `data/ny/opinions-2026-06-30.v1.jsonl.gz` from `docketx/us-caselaw`; search by case name |
| 4 | **Cornell LII** (`law.cornell.edu/regulations/new-york/...`) | 22 NYCRR Part 1200 (Rules of Professional Conduct), Part 1215, and all other NYCRR titles (e.g., 13 NYCRR securities) | Section URLs: `22-NYCRR-1200.7.1`, `N-Y-Comp-Codes-R-Regs-Tit-13SS-10.1` |
| 5 | **Agency sites** | DOS (`dos.ny.gov`): LLC filings and the LLC Transparency Act. NYC Finance (`nyc.gov/finance`): UBT and Business Corporation Tax | Fetch the page; record the "as of" date the page states |
| 6 | **Attorney review** | Anything not found above: pending bills, local practice, judgment calls | Flag it ⚠️ VERIFY in the draft (section 4) |

Never cite a secondary source (law-firm blogs, Wikipedia, news) as the authority. A news article can tell you *what to look up*, not what the law says.

## 2. What must be verified

Verify every one of these before it goes in a draft:

- Statute, rule, or regulation citations (and that the section number is still right).
- Dollar amounts: filing fees, thresholds, penalties, tax rates.
- Deadlines and time periods (e.g., 120 days, 30 days, six weeks).
- Who a rule applies to and its exceptions (e.g., the LLC Transparency Act exempts domestic LLCs).
- Effective dates, and whether something is enacted, pending, vetoed, or repealed.
- Case names, citations, and what the case actually held.
- Attorney-advertising wording that must be exact (e.g., "Attorney Advertising", "Prior results do not guarantee a similar outcome", the Rule 7.4(c) certification statement).

## 3. How to check (Open US Law)

1. Get the NY files once per session into a scratch folder (not the repo):
   `us_ny_statutes`, `us_ny_court_rules`, `us_ny_guidance`, `us_ny_ag_opinion`, `us_ny_constitutions` (`.parquet`, about 35 MB total). Add `us_federal_regulations` for FTC rules (16 CFR).
2. `pip install duckdb`, then:
   ```
   python3 scripts/law_lookup.py DATA_DIR cite "N.Y. LLC Law § 206"
   python3 scripts/law_lookup.py DATA_DIR search "freelance worker" --law GBS
   python3 scripts/law_lookup.py DATA_DIR rule "22 NYCRR § 137.1"
   ```
   Citation format: `N.Y. <CODE> Law § <section>` — codes include LLC, BSC (Business Corporation), GBS (General Business), GOB (General Obligations), LAB, JUD, TAX.
3. Confirm all of these before marking ✓:
   - `status` is `in_force` (not repealed, superseded, or not yet effective);
   - the exact words support the claim — quote or closely paraphrase, never extrapolate;
   - note the `source` URL and the snapshot date (statutes current through **Sept. 30, 2026**).
4. **"NOT FOUND" means unverified**, not "doesn't exist." Move down the hierarchy.

## 4. Writing rules for AG content

- **Mirror the source.** If the statute says "120 days," write 120 days, not "about four months." If a rule has exceptions, mention them or don't state the rule as absolute.
- **Date-stamp time-sensitive facts:** "As of October 2026, …" for fees, rates, deadlines, and pending legislation.
- **Cite in the content** where it helps the reader (e.g., "New York LLC Law § 206"), and always link to an official source (nysenate.gov, nycourts.gov, dos.ny.gov, nyc.gov) rather than the dataset or LII.
- **Unverified facts get a visible flag** in the draft: `⚠️ VERIFY: [claim] — [why unverified]`. A draft with any ⚠️ flag is not ready to publish.
- **Pending legislation** is always described as pending, with its status date, and never as law.
- **General information, not advice:** blog content explains the law generally and says so; it never tells a reader what to do in their situation.
- Run the skill's **Pre-Publish Gate** (in `SKILL.md`) on every piece — blogs are attorney advertising when they promote the firm.

## 4a. Metadata and markup are content too

Google's AI-content guidance requires human fact-checking of everything that can appear in Search, so apply sections 2–4 to:
- the `<title>`, meta description and Open Graph text;
- image alt text;
- structured data (JSON-LD).

The values in each must match the verified page. See `references/google-ai-content-guidelines.md` for the full Google checklist (scaled-content limits, the added-value test, reviewer bylines, AI-image rules).

## 5. Record what you checked

For every piece, deliver a **Verification Log** with the draft:

| Claim in draft | Source checked | Exact cite / URL | Date checked | Result |
|---|---|---|---|---|
| "NY LLCs must publish within 120 days" | Open US Law v2026.09.1 | N.Y. LLC Law § 206(a) | 2026-10-08 | ✓ |

Add any newly verified, reusable fact to `references/source-verification.md` so the next piece can reuse it (source 1 above).

## 6. Re-verification schedule

- Facts older than **90 days** in `source-verification.md` → re-check before reuse.
- A new Open US Law snapshot (quarterly) → re-run the lookups for every ✓ statute.
- Known moving targets — always re-check: pending non-compete bills, LLC Transparency Act guidance, tax rates, fee schedules, Form D filing practice.

## 7. Second-pass check

If the `ny-attorney-ad-compliance` skill is available in the session, run the finished draft through it as an independent advertising-compliance check after this protocol.
