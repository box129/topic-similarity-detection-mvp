# Reconciliation Plan

This plan reconciles the current code with `docs/source-of-truth.md`, `docs/business-rules.md`, and `docs/code-vs-rules-gap.md`. Keep changes small and focused.

## Top Issues To Fix First

1. **API response contract and score scale**
   - Why it matters: frontend code, tests, and any external consumers depend on stable field names and score units.
   - Verify before fixing: exact `FYP_Selected/` response shape; whether exposed scores should be only `0-100` percentages or include normalized internal values.
   - Checks after fixing: backend API tests, frontend result rendering tests, one manual API response inspection.

2. **Combined score dependence**
   - Why it matters: business rules mark combined/merged similarity as `needs verification` and out of scope for MVP, but current code uses it for ranking, tiering, and risk.
   - Verify before fixing: whether to remove combined score from behavior, keep it internal only, or keep it exposed as `needs verification`.
   - Checks after fixing: tests covering returned score fields, Tier 1 ordering, Tier 2/Tier 3 filtering, and risk output.

3. **Tier filtering and ranking**
   - Why it matters: business rules make SBERT the primary signal, with Tier 2/Tier 3 based on `SBERT >= 60%` and tier ranking by SBERT descending.
   - Verify before fixing: Tier 1 behavior when SBERT is available; exact lexical fallback when SBERT is unavailable.
   - Checks after fixing: unit tests for Tier 1 top 5, Tier 2 SBERT threshold, Tier 3 SBERT threshold plus 48-hour window, and fallback tiering.

4. **LOW/MEDIUM/HIGH risk calculation**
   - Why it matters: current risk may mark Tier 2 as HIGH, while business rules define risk by max SBERT score thresholds.
   - Verify before fixing: risk source score and threshold scale: `LOW < 50%`, `MEDIUM 50%-69%`, `HIGH >= 70%`.
   - Checks after fixing: risk tests for scores below 50, between 50 and 69, 70 and above, plus SBERT-unavailable fallback.

5. **SBERT-unavailable fallback**
   - Why it matters: current behavior may prevent Tier 2/Tier 3 fallback matches because `sbert` remains `0`.
   - Verify before fixing: fallback rule is `Jaccard >= 60%` or `TF-IDF >= 60%` for Tier 2/Tier 3, and risk uses `max(Jaccard, TF-IDF)`.
   - Checks after fixing: tests where SBERT fails but lexical scores produce Tier 2/Tier 3 matches and the expected risk.

## Safe Order Of Implementation

1. Add or update focused tests for the confirmed intended behavior before changing logic.
2. Reconcile response fields and score scale with the confirmed API contract.
3. Isolate or remove combined-score behavior from tiering and risk decisions.
4. Update tier filtering/ranking to follow SBERT-first rules.
5. Update risk calculation to follow documented thresholds.
6. Update SBERT-unavailable fallback behavior.
7. Update docs only for confirmed behavior changes.

## General Verification Rules

- Do not change category filtering; MVP rules say category is metadata and category/year filtering is out of scope.
- Treat keyword scoring behavior as `needs verification` until confirmed.
- Prefer narrow backend changes around `similarity.controller.js` and matching tests.
- After each fix, run the most relevant backend tests first; then run frontend checks if response fields or score scale changed.
