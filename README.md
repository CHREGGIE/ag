# AG — Legal Marketing Skills (New York)

Claude skills that generate compliant marketing for New York law firms.

| Skill | Path |
|-------|------|
| #244-NY Business Law & Contracts Marketing Kit | [`skills/ny-business-law-marketing-kit/SKILL.md`](skills/ny-business-law-marketing-kit/SKILL.md) |

Adapted from the Nevada edition (#244). Every skill carries **⚠️ VERIFY** flags for fast-moving law; attorney review is required before anything is published.

## Writing AG content

Every blog post or page that states legal facts follows [`references/content-verification-protocol.md`](skills/ny-business-law-marketing-kit/references/content-verification-protocol.md). In short: verify each fact against the Open US Law dataset (`CHREGGIE/Datasets` bucket), NY case law, or the skill's verified-facts log; flag anything unverified; and attach a Verification Log. `skills/ny-business-law-marketing-kit/scripts/law_lookup.py` checks a citation in one command.

Google's rules on AI-generated content (no scaled or templated pages, human fact-checking of metadata and structured data, reviewer bylines and how-it-was-made notes) are in [`references/google-ai-content-guidelines.md`](skills/ny-business-law-marketing-kit/references/google-ai-content-guidelines.md).
