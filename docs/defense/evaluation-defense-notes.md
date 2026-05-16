# Evaluation and Defense Notes

## Purpose

This document summarizes the pilot evaluation results and gives careful interpretation for academic defense. It focuses on what the project evaluation shows, what it does not prove, and how to explain the role of lexical, semantic, and contextual similarity in the decision support system.

## Evaluation Setup

The evaluation used a pilot synthetic dataset with 16 topic pairs. Each pair had an expected label that was manually defined for controlled evaluation.

The evaluation measured:

- true positives
- true negatives
- false positives
- false negatives
- accuracy
- precision
- recall
- F1-score

The compared algorithms and scorers were:

- Jaccard
- TF-IDF
- lexical_max
- SBERT
- weighted_combined
- context_adjusted_combined

## Latest Evaluation Snapshot

- SBERT available: true
- Jaccard: FP 6, FN 3, F1 0.471
- TF-IDF: FP 5, FN 4, F1 0.400
- lexical_max: FP 6, FN 3, F1 0.471
- SBERT: FP 7, FN 0, F1 0.667
- weighted_combined: FP 7, FN 2, F1 0.526
- context_adjusted_combined: FP 0, FN 0, F1 1.000

## Interpretation of Results

The lexical methods struggled with paraphrased or semantically similar topics because they depend mainly on shared wording. When students use different words to describe a similar topic, lexical overlap alone may miss the relationship.

SBERT improved recall because it captured semantic similarity better than keyword matching. In the pilot dataset, it detected all expected similar cases, which explains the zero false negatives.

However, SBERT also produced false positives because semantic similarity alone may ignore important study-context differences such as population, location, or study focus. Two topics may sound semantically close while still being acceptable because they study different groups, places, or specific problems.

The weighted_combined scorer improved over lexical-only methods in some cases, but it still produced false positives because it did not directly account for context mismatch.

The context_adjusted_combined scorer reduced false positives by checking population, location, and study_focus. In the pilot dataset, adding these context checks helped separate real topic repetition from acceptable topic variation.

## What The Results Support

The results support the project idea that:

- topic approval needs more than simple keyword matching
- semantic similarity helps detect paraphrased topic repetition
- rule-based context checks help reduce false positives
- decision support should combine lexical, semantic, and contextual signals

## What The Results Do Not Prove

The results do not prove that:

- the system is generally 100% accurate
- the pilot dataset represents all real departmental cases
- real departmental data will always contain complete context fields
- the current context-aware scorer is ready for production decisions

The pilot dataset is synthetic and small. Real departmental data may be incomplete or inconsistently formatted. Lecturer-reviewed evaluation is still needed before making final claims about accuracy or before moving context-aware scoring into production behavior.

Context-aware scoring is currently evaluation-only, not production behavior.

## Defense Answer: Why Use Three Algorithms?

Jaccard captures direct word overlap. It is useful for detecting obvious repeated wording.

TF-IDF captures weighted lexical similarity. It gives more importance to meaningful terms and reduces the effect of common words.

SBERT captures semantic and paraphrase similarity. It helps detect cases where two topics have similar meaning even when the wording is different.

Using the three methods gives broader coverage than one method alone because topic repetition can appear as exact wording, weighted keyword similarity, or paraphrased meaning.

## Defense Answer: Why Add Context Fields?

Supervisors do not judge topic similarity by title alone. They also consider population, location, and study focus.

Two topics can sound similar but study different populations or locations. For example, a topic about hypertension screening among market traders is not necessarily the same as hypertension screening among teachers.

Context fields help distinguish real repetition from acceptable topic variation. They make the system more aligned with how lecturers actually review proposed topics.

## Defense Answer: Why Is Context-Aware Scoring Evaluation-Only?

Context-aware scoring is evaluation-only because production integration needs caution. Changing final production decisions too early could affect how lecturers interpret results.

The API and frontend behavior should not be changed without review. A feature-flagged rollout is planned so context-aware scoring can be tested safely before it becomes part of production decision logic.

Lecturer-reviewed cases should guide final thresholds and determine how strongly context fields should influence final risk levels.

## Recommended Wording For Report

"The evaluation results show that lexical and semantic similarity methods are useful for detecting repeated or paraphrased research topics, but they may produce false positives when contextual differences are ignored. The context-adjusted evaluation scorer demonstrates that adding population, location, and study-focus checks can improve decision-support quality in the controlled pilot dataset. However, the result should be interpreted as pilot evidence rather than a claim of general accuracy."

## Examiner Caution Points

- do not claim 100% general accuracy
- say "pilot synthetic dataset"
- say "evaluation-only"
- say "decision support, not automatic approval"
- say "lecturer review remains important"
