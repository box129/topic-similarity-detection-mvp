# Topic Similarity Evaluation Harness

This guide describes the Phase 3/4 pilot evaluation harness for measuring topic-pair similarity behavior.

The harness is project tooling only. It does not change production scoring, API responses, frontend behavior, Prisma schema, embeddings, or import logic.

## Purpose

The system should be evaluated with controlled topic pairs, not only by checking whether the app runs. The pilot dataset lets us compare expected labels against current algorithm predictions and calculate:

- true positives
- true negatives
- false positives
- false negatives
- accuracy
- precision
- recall
- F1-score

## Dataset

The pilot dataset lives at:

```text
backend/evaluation/datasets/pilot-topic-pairs.json
```

It contains 16 manually readable topic pairs covering:

- exact or near duplicates
- paraphrased duplicates
- same disease with different population
- same disease with different location
- same population with different study focus
- high lexical overlap with different topic meaning
- fragmented title records
- clearly unrelated topics

Each case records title, keywords, population, location, and study focus. Existing title-based scorers use topic titles only, so the report keeps `context_fields_recorded_but_not_scored: true` for those scorers.

## Run The Harness

From `backend/`:

```powershell
npm run evaluation:topics
```

The command prints a JSON report with per-case scores, predictions, and summary metrics.

## Score Scale

All scores are normalized to `0.00-1.00` before risk classification.

Evaluation risk thresholds:

- `LOW`: `< 0.40`
- `MEDIUM`: `0.40-0.69`
- `HIGH`: `>= 0.70`

For binary metrics:

- `LOW` maps to `not_similar`
- `MEDIUM` and `HIGH` map to `similar`

## Algorithms In The Report

The report includes:

- `jaccard`
- `tfidf`
- `lexical_max`
- `sbert`, when the SBERT service is available
- `weighted_combined`, when SBERT is available
- `context_adjusted_combined`

`weighted_combined` is evaluation-only and uses:

```text
0.2 * Jaccard + 0.3 * TF-IDF + 0.5 * SBERT
```

This does not change the production controller or public API contract.

If SBERT is unavailable, the harness still completes with Jaccard, TF-IDF, and lexical-max metrics. SBERT and weighted-combined metrics are skipped.

## Context-Adjusted Evaluation Scorer

`context_adjusted_combined` is evaluation-only. It does not change production scoring, controllers, endpoint responses, Prisma schema, frontend behavior, imports, or embeddings.

The context scorer compares:

- `population`
- `location`
- `study_focus`

Each context field receives a deterministic score:

- exact normalized match: `1`
- missing on either side: `0.75`
- clear mismatch: `0`

The context score is the average of the three field scores.

The adjusted score is:

```text
adjusted = baseScore * contextScore^2 + fullContextMatchBonus
```

`fullContextMatchBonus` is `0.20` only when all three context fields are exact normalized matches and no field is missing or mismatched.

When SBERT is available, `context_adjusted_combined` uses `weighted_combined` as its base score. When SBERT is unavailable, it uses `lexical_max`.

The report includes:

```json
{
  "context_fields_recorded_but_not_scored": true,
  "context_fields_used_by_context_adjusted_combined": true,
  "production_scoring_unchanged": true
}
```

## Current Limitations

- Context fields are used only by the evaluation-only `context_adjusted_combined` scorer.
- Production similarity scoring is still title-based.
- The dataset is a pilot, not a final validation dataset.
- TF-IDF pair scoring is measured against one comparison topic, while production API scoring compares against all database topics.
- SBERT behavior depends on the local SBERT service and whether it is using real semantic embeddings or fallback embeddings.

## Future Work

- Decide whether context-aware scoring should move from evaluation-only tooling into production similarity behavior.
- Expand the dataset with lecturer-reviewed cases.
- Store evaluation reports when repeatable comparison history is needed.
- Compare production endpoint behavior against this pairwise harness.
