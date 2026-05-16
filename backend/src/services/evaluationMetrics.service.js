function roundMetric(value) {
  return Math.round(value * 1000) / 1000;
}

function normalizeScore(score) {
  if (score === null || score === undefined) {
    return null;
  }

  const numericScore = Number(score);
  if (!Number.isFinite(numericScore)) {
    return null;
  }

  const normalizedScore = numericScore > 1 ? numericScore / 100 : numericScore;
  return roundMetric(Math.max(0, Math.min(1, normalizedScore)));
}

function classifyRisk(score) {
  const normalizedScore = normalizeScore(score);
  if (normalizedScore === null) {
    return null;
  }

  if (normalizedScore >= 0.70) {
    return 'HIGH';
  }

  if (normalizedScore >= 0.40) {
    return 'MEDIUM';
  }

  return 'LOW';
}

function labelFromRisk(risk) {
  if (risk === 'LOW') {
    return 'not_similar';
  }

  if (risk === 'MEDIUM' || risk === 'HIGH') {
    return 'similar';
  }

  return null;
}

function buildPrediction(score) {
  const normalized_score = normalizeScore(score);
  const risk = classifyRisk(normalized_score);

  return {
    score: normalized_score,
    risk,
    label: labelFromRisk(risk)
  };
}

function buildConfusionMatrix(caseResults, scorerKey) {
  const matrix = {
    tp: 0,
    tn: 0,
    fp: 0,
    fn: 0
  };

  caseResults.forEach(result => {
    const expectedLabel = result.expected_label;
    const predictedLabel = result.predictions?.[scorerKey]?.label;

    if (!expectedLabel || !predictedLabel) {
      return;
    }

    if (expectedLabel === 'similar' && predictedLabel === 'similar') {
      matrix.tp += 1;
    } else if (expectedLabel === 'not_similar' && predictedLabel === 'not_similar') {
      matrix.tn += 1;
    } else if (expectedLabel === 'not_similar' && predictedLabel === 'similar') {
      matrix.fp += 1;
    } else if (expectedLabel === 'similar' && predictedLabel === 'not_similar') {
      matrix.fn += 1;
    }
  });

  return matrix;
}

function calculateMetrics(confusionMatrix) {
  const { tp, tn, fp, fn } = confusionMatrix;
  const total = tp + tn + fp + fn;
  const accuracy = total === 0 ? 0 : (tp + tn) / total;
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return {
    tp,
    tn,
    fp,
    fn,
    accuracy: roundMetric(accuracy),
    precision: roundMetric(precision),
    recall: roundMetric(recall),
    f1: roundMetric(f1)
  };
}

module.exports = {
  normalizeScore,
  classifyRisk,
  labelFromRisk,
  buildPrediction,
  buildConfusionMatrix,
  calculateMetrics
};
