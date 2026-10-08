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

## Not in the dataset — still ⚠️ VERIFY

| Item | Why |
|---|---|
| 22 NYCRR Part 1200 (Rules of Professional Conduct 7.1, 7.3, 7.4, 7.5, 1.5, 1.8, 5.8) | Absent from Open US Law and from `docketx/court-rules` (which covers only Parts 1–81, 100–161, 200–221); no other Hugging Face dataset found. Check at nycourts.gov |
| 22 NYCRR Part 1215 (engagement letters) | Same as Part 1200 |
| NY Rule 506 notice filing | It's in the Attorney General's regulations; NY regulations aren't in the dataset |
| LLC Transparency Act effective date and DOS implementation | Not in the statute text |
| NYC taxes (UBT, Business Corporation Tax) | NYC Administrative Code isn't in the dataset |
| Pending non-compete bills | Bills aren't in the dataset |
| FTC Endorsement Guides and Consumer Review Rule | Could be checked against `us_federal_regulations.parquet` (16 CFR Parts 255, 465) |
