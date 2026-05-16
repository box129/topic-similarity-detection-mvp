# MVP Phase Status

## Current MVP Scope

The MVP currently includes:

- backend topic similarity foundation
- topic import preview and commit support
- pilot evaluation dataset and evaluation harness
- SBERT-aware evaluation when the SBERT service is available
- evaluation-only context-adjusted scoring using `population`, `location`, and `study_focus`

## Completed Phases

### Phase 2: Excel Import Foundation

The project now supports Excel-based topic import workflows for departmental records. This includes:

- import preview and commit endpoints
- Excel normalization from `.xlsx` worksheet rows into normalized topic records
- topic metadata fields for context and import tracking
- import warnings for incomplete or unclear records
- a workflow that avoids manually entering all historical topics one by one

### Phase 3: Evaluation Harness

The project now includes a pilot topic-pair evaluation harness. This includes:

- a pilot dataset with 16 topic pairs
- Jaccard, TF-IDF, and lexical-max evaluation
- optional SBERT and weighted-combined evaluation when SBERT is available
- metrics for accuracy, precision, recall, F1, true positives, true negatives, false positives, and false negatives

### Phase 4: Context-Aware Evaluation Scorer

The project now includes an evaluation-only context-aware scorer:

- `context_adjusted_combined`
- compares population, location, and study focus
- remains evaluation-only
- production scoring is unchanged
- API responses are unchanged
- Prisma schema is unchanged
- frontend behavior is unchanged

## Latest Evaluation Snapshot

- SBERT available: true
- lexical_max: FP 6, F1 0.471
- SBERT: FP 7, F1 0.667
- weighted_combined: FP 7, F1 0.526
- context_adjusted_combined: FP 0, FN 0, F1 1.000

Important caution: this result is from a pilot synthetic evaluation dataset and must not be described as general 100% accuracy. It only shows that context-aware scoring reduced false positives in the controlled pilot dataset.

## Current Production Behavior

- production similarity behavior is still title-based
- context-aware scoring is not yet used in production endpoints
- Phase 4 only proves the idea inside the evaluation harness

## Deferred Work

- production integration of context-aware scoring
- frontend display of context-aware explanations
- larger lecturer-reviewed dataset
- stored evaluation reports
- final threshold review
- deployment readiness checks

## Recommended Next Steps

- Phase 5: production integration plan for context-aware scoring
- Phase 6: frontend result explanation improvements
- Phase 7: final evaluation/reporting package
