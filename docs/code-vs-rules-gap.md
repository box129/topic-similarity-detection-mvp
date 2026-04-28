# Code vs Rules Gap Analysis

This compares current implementation behavior against `docs/business-rules.md` and `docs/source-of-truth.md`.

## Areas Where Code Appears Aligned

- The backend checks three data sources: historical topics, current-session topics, and under-review topics.
- Under-review topics are limited to the last 48 hours.
- Jaccard, TF-IDF, and SBERT are all called during the similarity pipeline.
- SBERT failures degrade gracefully instead of stopping the whole request.
- The response includes separate algorithm scores inside each returned topic object.
- `category` is treated as metadata in the response and is not used as a retrieval filter.
- `keywords` is accepted as optional input and returned in the response.

## Areas Where Code Appears Misaligned

- Business rules say combined/merged similarity is out of scope or `needs verification`; code calculates and exposes `scores.combined` and `overallMaxSimilarity`.
- Business rules say Tier 2 and Tier 3 should be based on `SBERT >= 60%`; code requires both `combinedScore >= 0.60` and `sbert >= 0.60`.
- Business rules say Tier 1 ranking should be by SBERT score descending; code ranks combined results by `combinedScore`.
- Business rules say risk should be based on maximum SBERT score across all tiers; code bases risk on tier presence and top Tier 1 combined score.
- Business rules say Tier 2 should not automatically mean HIGH risk; code returns HIGH if any Tier 2 match exists.
- Business rules say exposed scores are percentages on a `0-100` scale; backend exposes normalized `0-1` scores in API results.
- Business rules say if SBERT is unavailable, Tier 2 and Tier 3 fallback should use `Jaccard >= 60%` or `TF-IDF >= 60%`; code appears to keep `sbert` at `0`, which prevents Tier 2/Tier 3 fallback matches.
- Business rules say custom algorithm weighting is out of scope; code contains algorithm weight constants and combined-score logic.

## High-Risk Mismatches

- Risk correctness: a current-session match can produce `HIGH` in code, while the rules define risk by max SBERT score thresholds.
- Tier correctness: Tier 1 may show the top combined-score historical topics instead of the top SBERT historical topics.
- SBERT outage behavior: Tier 2/Tier 3 fallback rules may not work when SBERT is unavailable.
- Score scale mismatch: frontend/API consumers may receive `0-1` values where the rules expect `0-100` percentages.
- Combined-score dependence: business intent says combined scoring needs verification, but code uses it for ranking, tiering, and risk.

## Items That Need Verification Before Code Change

- Confirm the exact API response contract from `FYP_Selected/` before changing response fields.
- Confirm whether backend should expose only percentage scores or both normalized and percentage scores.
- Confirm whether user-supplied `keywords` should affect scoring or remain metadata only.
- Confirm whether stored topic `keywords` should be included in algorithm comparison text.
- Confirm whether Tier 1 should use SBERT-only ranking when SBERT is available.
- Confirm expected behavior when SBERT is unavailable and lexical fallback produces Tier 2/Tier 3 matches.
- Confirm whether `overallMaxSimilarity` should exist or be removed/replaced.

## Recommended Order Of Reconciliation

1. Confirm the intended API response shape and score scale.
2. Align score calculation and remove or isolate combined-score behavior if it is not part of MVP rules.
3. Align Tier 1, Tier 2, and Tier 3 filtering/ranking with SBERT-first rules.
4. Align LOW/MEDIUM/HIGH risk calculation with the documented thresholds.
5. Implement and test SBERT-unavailable fallback behavior for tiers and risk.
6. Update docs and tests after the confirmed behavior is implemented.
