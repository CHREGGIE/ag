# Source Verification Log — NY Business Law Marketing Kit

**Source:** Open US Law, snapshot v2026.09.1 (Vaquill AI), CC BY-NC 4.0. NY statutes as published by the NY Senate (nysenate.gov), current through Sept. 30, 2026. Mirror copy in the `CHREGGIE/Datasets` bucket (`open-us-law/`).
**Checked:** October 8, 2026. Case law from `docketx/us-caselaw-ny` (CourtListener bulk export of 2026-06-30, public domain).

The law text is public domain; the compiled dataset is licensed for non-commercial use with attribution. This kit is for internal use on the AG project.

## Verified against statute text (✓)

| Citation | What the skill says | Result |
|---|---|---|
| LLC Law § 206 | Publish in 2 newspapers (one weekly, one daily) designated by the county clerk, once a week for 6 weeks, within 120 days; file a certificate of publication; authority to do business is suspended if not done | ✓ Matches |
| LLC Law § 1101(c), (f), (s) | $9 biennial statement; $200 articles of organization; $50 certificate of publication | ✓ Matches |
| LLC Law §§ 1106–1107 | Beneficial-ownership disclosure or exemption attestation; 30 days for new LLCs; 1 year for existing LLCs; annual statement; definitions tied to 31 U.S.C. § 5336 | ✓ Matches (the effective date is not in the section text) |
| LLC Law § 802 | Foreign LLCs (e.g., Delaware LLCs registered in NY) must also publish | ✓ Matches (same 6-week, 120-day requirement and suspension) |
| 22 NYCRR § 137.1 | Fee arbitration covers disputes of $1,000–$50,000 | ✓ Matches (other amounts only if the parties consent) |
| Tax Law § 658(c)(3) | LLC/partnership filing fee, $25 minimum, based on NY-source gross income | ✓ Matches (also applies to disregarded LLCs) |
| Labor Law § 202-k | Broadcast-employee non-compete ban | ✓ Matches (excludes management) |
| General non-compete statute | None | ✓ None found in the snapshot |
| General Obligations Law § 5-336 | Limits on NDAs in discrimination settlements | ✓ Matches (21-day consideration and 7-day revocation periods; ban on liquidated damages and forfeiture) |
| Labor Law § 740 | Whistleblower protections; employer must post a notice | ✓ Matches (subd. 8) |
| GBL Art. 44-A (§ 1410) | Statewide Freelance Isn't Free Act; $800 threshold, alone or aggregated over 120 days | ✓ Matches |
| *BDO Seidman v. Hirshberg*, 93 N.Y.2d 382 (1999) | Three-prong reasonableness test; legitimate interests; partial enforcement only for an employer acting in good faith | ✓ Matches (checked against `docketx/us-caselaw-ny`; page markers *387–*395 confirm the cite) |
| *Post v. Merrill Lynch*, 48 N.Y.2d 84 (1979) | Firing without cause limits enforcement | ✓ Holding is narrower than the skill first said: it covers forfeiture-for-competition clauses (pension benefits); skill text corrected |
| Judiciary Law §§ 478, 484, 485, 485-a, 495 | Unauthorized practice is a misdemeanor; class E felony under § 485-a when the person falsely holds out and causes more than $1,000 in loss; corporations may not practice law | ✓ Matches |

## Rules of Professional Conduct and Part 1215 — checked October 8, 2026

**Source:** Cornell LII's copy of 22 NYCRR (law.cornell.edu), which reproduces the official NYCRR. nycourts.gov sits behind a Cloudflare browser check and couldn't be read directly. Neither Part appears in any Hugging Face dataset found (Open US Law; `docketx/court-rules` covers only Parts 1–81, 100–161, 200–221).

| Rule | Result | Change made to the skill |
|---|---|---|
| 7.1(f) "Attorney Advertising" label, email subject line | ✓ Matches | — |
| 7.1(h) name, address, phone | ✓ Matches | — |
| 7.1(d)/(e) results, comparisons, testimonials + "Prior results do not guarantee a similar outcome" | ✓ Matches | **Corrected:** pending-matter testimonials are *allowed* with informed consent confirmed in writing (the skill had said they were barred) |
| 7.1(c) specific bans | ✓ Paid endorsements, fictitious firms, undisclosed actors/dramatizations, ads resembling legal documents | **Corrected:** the "nickname or motto implying results" ban is no longer in 7.1(c); results-implying slogans are now handled under 7.1(a) (misleading) |
| 7.1(k) retention | ✓ Matches | **Added:** every ad must be pre-approved by the lawyer or firm |
| 7.1(b)(2), (g), (i), (j), (l)–(o) | New to the skill | **Added:** written consent before naming clients; no hidden meta tags; home-page legibility; written scope statement for advertised fixed fees; can't charge more than the advertised fee without written agreement; advertised fees binding 30+ days; no paying the press |
| 7.2(a) referral payments | ✓ Matches | **Corrected:** removed "cost of advertising" exception wording; listed the actual exceptions |
| 7.3 solicitation | ✓ Filing with the disciplinary committee confirmed | **Added:** file at the time it goes out; don't mention the filing; keep recipient list 3 years; disclose the source when outreach is event-triggered (7.3(f)); own website exempt |
| 7.4 specialist | ✓ No "specialist" without certification | **Corrected — important:** the required statement is now "This certification is not granted by any governmental authority." (other-state version: "...within the State of New York."), printed at least two font sizes larger. The longer disclaimer in the original draft was superseded |
| 7.5 names and domains | ✓ No misleading trade or domain names | **Corrected:** cited as 7.5(b), not 7.5(e); added LLC/PLLC/PC naming and nonlawyer-name rules |
| 1.5(a), (b) | ✓ Matches | — |
| 1.5(d)(4) | New to the skill | **Added:** nonrefundable retainers are prohibited |
| 1.8(a) | ✓ Matches word for word on all three conditions | — |
| 5.8 | ✓ | **Added:** approved-profession list, informed written consent, Statement of Client's Rights |
| 22 NYCRR § 1215.1 | ✓ | **Corrected:** the letter is due *before* the representation begins; it may follow later only if giving it first is impracticable or the scope is undeterminable. Updated letter required for significant changes |
| 22 NYCRR § 1215.2 | ✓ Under-$3,000 exception confirmed | **Added:** the other three exceptions |

## Agency rules, city law and guidance — checked October 8, 2026

| Item | Source | Result |
|---|---|---|
| NY notice filing for Rule 506 offerings | 13 NYCRR §§ 10.1(a)(3), 10.8, 10.10 (via Cornell LII) | ✓ Form D filed with the Department of Law; $300 fee (≤ $500,000 offering) or $1,200 (larger); $30 per amendment. **Corrected:** removed the unverified "via NASAA EFD" wording. The deadline isn't in the regulation |
| NY LLC Transparency Act scope, deadlines, penalties | Department of State beneficial-ownership pages and FAQ (dos.ny.gov; FAQ current as of Dec. 23, 2025) | ✓ **Major correction:** domestic LLCs and LLCs formed in other US states are exempt and file nothing. Only LLCs formed under a foreign country's law file. In force since Jan. 1, 2026; 30 days after authority; pre-2026 foreign-country LLCs by Dec. 31, 2026; $25 fee; AG fines up to $500/day; suspension after notice |
| NYC Unincorporated Business Tax | NYC Department of Finance (nyc.gov/finance) | ✓ 4% of NYC-allocated income; full credit at $3,400 or less, partial up to $5,400; covers partnership-taxed LLCs |
| NYC Business Corporation Tax | NYC Department of Finance | ✓ C corporations; $1M+ NYC receipts threshold since 2022; S corporations stay under the General Corporation Tax |

## Still ⚠️ VERIFY

| Item | Why | How to close it |
|---|---|---|
| Pending non-compete bills (state) | The Senate's bill API needs a free API key; nysenate.gov and nyassembly.gov are blocked or behind a browser check | Get a free Open Legislation key (legislation.nysenate.gov) and store it as an environment secret, or allow `nyassembly.gov` |
| Pending non-compete bills (NYC Council) | legistar.council.nyc.gov loads search results through a background script | Check manually, or allow `webapi.legistar.com` (may need a token) |
| Form D filing deadline and submission method | Not stated in 13 NYCRR Part 10 | NY Attorney General Investor Protection Bureau guidance (ag.ny.gov) |
| State tax rates and MCTMT thresholds | tax.ny.gov didn't connect | Allow `www.tax.ny.gov` |
| FTC Endorsement Guides and Consumer Review Rule | Not yet checked | `us_federal_regulations.parquet` in the bucket (16 CFR Parts 255, 465) |
