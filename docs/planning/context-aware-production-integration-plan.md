# Context-Aware Production Integration Plan

## Purpose

This plan describes how context-aware scoring can move from evaluation-only tooling into production later without rushing implementation. It is intended to keep the project conservative: prove the behavior, expose it safely, review it with lecturers, and only then decide whether it should affect production decisions.

## Current State

- Phase 4 added `context_adjusted_combined` to the evaluation harness.
- The context fields are `population`, `location`, and `study_focus`.
- The pilot synthetic evaluation showed reduced false positives when context was considered.
- This does not mean the system has general 100% accuracy. The result only applies to the controlled pilot dataset.

## Why Production Integration Needs Caution

- The pilot dataset is small and synthetic.
- Production records may have missing or incomplete context fields.
- Records imported from Excel may contain inconsistent formatting.
- Over-penalizing context mismatch could hide valid similar topics that should still be reviewed.
- Lecturers need explanations, not just final scores.

## Proposed Production Strategy

### Step 1: Keep Existing Title Score

Keep the existing title similarity scoring as the base signal. This preserves current behavior while context-aware behavior is reviewed and validated.

### Step 2: Add Context Analysis as Explanation First

Introduce context comparison as optional API explanation metadata before using it to change final decisions.

Proposed response fields may include:

- `context_score`
- `context_details`
- `context_match_count`
- `context_mismatch_count`
- `context_missing_count`
- `context_warning`

These fields are proposed only. They are not currently implemented in production responses.

### Step 3: Add Context-Adjusted Score Behind a Feature Flag

Add a feature flag before allowing context-aware scoring to influence production behavior:

```text
CONTEXT_AWARE_SCORING_ENABLED=false
```

When disabled:

- production behavior remains unchanged

When enabled:

- backend may calculate `context_adjusted_combined`
- final decision logic can be reviewed safely before it becomes default behavior

### Step 4: Frontend Explanation UI

The frontend should explain context comparisons clearly. It should show:

- matched context fields
- mismatched context fields
- missing context fields
- why a topic was classified as similar or not similar

### Step 5: Lecturer Review Before Final Thresholds

Before changing final production decisions, test the context-aware behavior with lecturer-reviewed cases. Thresholds should not be finalized from the pilot synthetic dataset alone.

## API Design Considerations

- Avoid breaking existing frontend consumers.
- Add optional fields instead of removing or renaming old fields.
- Keep old score fields.
- Include context metadata as optional fields.
- Explain missing context fields clearly.

## Risk Rules To Consider

- Full context match may increase confidence.
- Clear population, location, or study-focus mismatch may reduce confidence.
- Missing fields should not automatically reject similarity.
- High title or semantic similarity with context mismatch should be marked for review rather than blindly accepted or rejected.

## Data Quality Requirements

- Imported topics need normalized population, location, and study focus where available.
- Incomplete records should keep warnings.
- Future import workflows may need better mapping for context fields.

## Testing Plan

- Add unit tests for a production context helper.
- Add controller or service tests for API response shape.
- Add regression tests to ensure existing title-only behavior still works when the feature flag is disabled.
- Compare evaluation harness results before and after production integration.
- Validate behavior using manual lecturer review cases.

## Deferred Implementation Tasks

- production context scoring service
- feature flag
- API response extension
- frontend explanation panel
- larger lecturer-reviewed dataset
- threshold review
- deployment readiness check

## Non-Goals For This Planning PR

- no backend code changes
- no frontend code changes
- no Prisma/schema changes
- no API response changes
- no threshold changes
- no generated reports
