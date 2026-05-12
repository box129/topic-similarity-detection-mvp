# Source of Truth

## Decision

For business rules in this repository, use the selected MVP/FYP requirements in `FYP_Selected/` as the primary source of truth.

- Primary source: `FYP_Selected/` requirements and API docs
- Secondary source: later implementation docs in `SDLC-Project/05-Implementation/`
- Actual behavior source: current code, but code is not automatically the intended rule

## How to interpret conflicts

- If `FYP_Selected/` and later implementation docs disagree, treat `FYP_Selected/` as authoritative for intended MVP behavior.
- Treat implementation docs as useful evidence of drift, not final business intent.
- Treat code as the current system behavior to compare against the documented intent.

## Main conflicts already identified

- Combination logic: `FYP_Selected/` says show the three algorithm scores separately and does not define a merged MVP score; later implementation docs introduce a weighted `combined` score.
- Risk thresholds: `FYP_Selected/` documents LOW `<50%`, MEDIUM `50-69%`, HIGH `>=70%`; later implementation docs document a different MEDIUM cutoff.
- Tier rules: `FYP_Selected/` documents Tier 2 and Tier 3 primarily around `SBERT >= 60%` plus the Tier 3 48-hour window; later implementation docs add extra combined-score conditions.
- Response contract: `FYP_Selected/` API docs define one response shape; implementation docs describe a different shape and status/error behavior.
- Score scale: `FYP_Selected/` exposes percentage-style `0-100` scores; implementation docs and controller logic use normalized thresholds like `0.60` and `0.70`.

## What must be reconciled before code changes

- Confirm whether MVP intent is separate algorithm scores only, or a weighted combined score.
- Confirm the intended risk thresholds and score scale.
- Confirm the exact Tier 1, Tier 2, and Tier 3 filtering rules.
- Confirm the backend response contract to preserve or update.
- After those decisions, compare code against the confirmed rules and change code deliberately rather than assuming current behavior is correct.
