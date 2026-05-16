const { normalizeScore } = require('./evaluationMetrics.service');

const CONTEXT_FIELDS = ['population', 'location', 'study_focus'];
const MATCH_SCORE = 1;
const MISSING_SCORE = 0.75;
const MISMATCH_SCORE = 0;
const FULL_CONTEXT_MATCH_BONUS = 0.20;

function roundScore(value) {
  return Math.round(value * 1000) / 1000;
}

function clampNormalizedScore(value) {
  return roundScore(Math.max(0, Math.min(1, value)));
}

function normalizeContextValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compareContextField(submittedValue, existingValue) {
  const submitted = normalizeContextValue(submittedValue);
  const existing = normalizeContextValue(existingValue);

  if (!submitted || !existing) {
    return {
      status: 'missing',
      score: MISSING_SCORE
    };
  }

  if (submitted === existing) {
    return {
      status: 'match',
      score: MATCH_SCORE
    };
  }

  return {
    status: 'mismatch',
    score: MISMATCH_SCORE
  };
}

function calculateContextSimilarity(submitted = {}, existing = {}) {
  const fieldResults = {};
  let matchCount = 0;
  let mismatchCount = 0;
  let missingCount = 0;
  let totalScore = 0;

  CONTEXT_FIELDS.forEach(field => {
    const result = compareContextField(submitted[field], existing[field]);
    fieldResults[field] = result;
    totalScore += result.score;

    if (result.status === 'match') {
      matchCount += 1;
    } else if (result.status === 'mismatch') {
      mismatchCount += 1;
    } else if (result.status === 'missing') {
      missingCount += 1;
    }
  });

  return {
    score: roundScore(totalScore / CONTEXT_FIELDS.length),
    field_results: fieldResults,
    match_count: matchCount,
    mismatch_count: mismatchCount,
    missing_count: missingCount,
    has_full_context_match: matchCount === CONTEXT_FIELDS.length &&
      mismatchCount === 0 &&
      missingCount === 0
  };
}

function calculateContextAdjustedScore(baseScore, contextSimilarity) {
  const normalizedBaseScore = normalizeScore(baseScore);
  if (normalizedBaseScore === null || !contextSimilarity) {
    return null;
  }

  const contextScore = normalizeScore(contextSimilarity.score) || 0;
  const fullContextMatchBonus = contextSimilarity.has_full_context_match
    ? FULL_CONTEXT_MATCH_BONUS
    : 0;
  const adjustedScore = normalizedBaseScore * Math.pow(contextScore, 2) + fullContextMatchBonus;

  return clampNormalizedScore(adjustedScore);
}

module.exports = {
  normalizeContextValue,
  compareContextField,
  calculateContextSimilarity,
  calculateContextAdjustedScore
};
